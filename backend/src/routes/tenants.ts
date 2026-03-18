import { Router, Request, Response } from 'express';
import { prisma } from '../utils/db';
import { authenticate, authorizeRole } from '../middleware/auth';

const router = Router();
router.use(authenticate);

// Get all tenants
router.get('/', async (req: Request, res: Response) => {
  try {
    const tenants = await prisma.tenant.findMany({
      include: {
        room: true,
        bed: true,
      },
    });
    res.status(200).json(tenants);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single tenant
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: req.params.id },
      include: { room: true, bed: true, payments: true, maintenanceRequests: true },
    });
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
    res.status(200).json(tenant);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create a tenant
router.post('/', authorizeRole(['OWNER', 'MANAGER']), async (req: Request, res: Response) => {
  try {
    const { name, phone, email, idProof, emergencyContact, roomId, bedId, moveInDate, rentAmount, depositAmount, dueAmount } = req.body;

    // Validate bed availability
    const bed = await prisma.bed.findUnique({ where: { id: bedId } });
    if (!bed || bed.status === 'OCCUPIED' || bed.roomId !== roomId) {
      return res.status(400).json({ message: 'Invalid or occupied bed selected' });
    }

    // Start a transaction to ensure atomic updates
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create tenant
      const tenant = await tx.tenant.create({
        data: {
          name, phone, email, idProof, emergencyContact,
          roomId, bedId, 
          moveInDate: new Date(moveInDate), 
          rentAmount, depositAmount, dueAmount: dueAmount || 0,
          status: 'ACTIVE'
        }
      });

      // 2. Mark bed as OCCUPIED and link tenant
      await tx.bed.update({
        where: { id: bedId },
        data: { status: 'OCCUPIED', tenantId: tenant.id }
      });

      // 3. Update room occupancy
      await tx.room.update({
        where: { id: roomId },
        data: {
          occupiedBeds: { increment: 1 },
          availableBeds: { decrement: 1 },
          status: 'OCCUPIED' // will be overwritten if still available
        }
      });

      // Re-evaluate room status (OCCUPIED vs AVAILABLE)
      const room = await tx.room.findUnique({ where: { id: roomId } });
      if (room && room.availableBeds > 0) {
        await tx.room.update({ where: { id: roomId }, data: { status: 'AVAILABLE' } });
      }

      return tenant;
    });

    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Vacate a tenant
router.put('/:id/vacate', authorizeRole(['OWNER', 'MANAGER']), async (req: Request, res: Response) => {
  try {
    const tenantId = req.params.id;

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant || tenant.status === 'LEFT') {
      return res.status(400).json({ message: 'Tenant not found or already left' });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Mark tenant as LEFT
      const updatedTenant = await tx.tenant.update({
        where: { id: tenantId },
        data: { status: 'LEFT', bedId: null },
      });

      if (tenant.bedId) {
        // 2. Mark bed as AVAILABLE
        await tx.bed.update({
          where: { id: tenant.bedId },
          data: { status: 'AVAILABLE', tenantId: null },
        });

        // 3. Update room occupancy
        await tx.room.update({
          where: { id: tenant.roomId },
          data: {
            occupiedBeds: { decrement: 1 },
            availableBeds: { increment: 1 },
            status: 'AVAILABLE'
          }
        });
      }
    });

    res.status(200).json({ message: 'Tenant successfully vacated' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update a tenant
router.put('/:id', authorizeRole(['OWNER', 'MANAGER']), async (req: Request, res: Response) => {
  try {
    const { name, phone, email, idProof, emergencyContact, rentAmount } = req.body;
    const tenant = await prisma.tenant.update({
      where: { id: req.params.id },
      data: { name, phone, email, idProof, emergencyContact, rentAmount },
    });
    res.status(200).json(tenant);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a tenant permanently
router.delete('/:id', authorizeRole(['OWNER', 'MANAGER']), async (req: Request, res: Response) => {
  try {
    const tenantId = req.params.id;
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });

    await prisma.$transaction(async (tx) => {
      if (tenant.bedId) {
        // Mark bed as AVAILABLE
        await tx.bed.update({
          where: { id: tenant.bedId },
          data: { status: 'AVAILABLE', tenantId: null },
        });

        // Update room occupancy
        await tx.room.update({
          where: { id: tenant.roomId },
          data: {
            occupiedBeds: { decrement: 1 },
            availableBeds: { increment: 1 },
            status: 'AVAILABLE'
          }
        });
      }

      // Delete associated payments and maintenance requests first to respect foreign keys
      await tx.payment.deleteMany({ where: { tenantId } });
      await tx.maintenanceRequest.deleteMany({ where: { tenantId } });

      // Delete tenant
      await tx.tenant.delete({ where: { id: tenantId } });
    });

    res.status(200).json({ message: 'Tenant successfully deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
