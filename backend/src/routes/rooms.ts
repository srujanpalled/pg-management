import { Router, Request, Response } from 'express';
import { prisma } from '../utils/db';
import { authenticate, authorizeRole } from '../middleware/auth';

const router = Router();

// Protect all room routes
router.use(authenticate);

// Get all rooms for a property
router.get('/', async (req: Request, res: Response) => {
  try {
    const propertyId = req.query.propertyId as string;
    const filter = propertyId ? { propertyId } : {};

    const rooms = await prisma.room.findMany({
      where: filter,
      include: {
        beds: true,
      },
    });
    res.status(200).json(rooms);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single room
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const room = await prisma.room.findUnique({
      where: { id: req.params.id },
      include: {
        beds: {
          include: { tenant: true },
        },
      },
    });

    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.status(200).json(room);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new room (Owner/Manager only)
router.post('/', authorizeRole(['OWNER', 'MANAGER']), async (req: Request, res: Response) => {
  try {
    const { propertyId, roomNumber, floor, roomType, rentPrice, totalBeds } = req.body;

    // Check if property exists, or assign default if not testing multi-property yet.
    // For this scenario, since we didn't add an endpoint for property, we will automatically create one if there isn't any, assuming single PG per owner initially.
    let targetPropertyId = propertyId;
    if (!targetPropertyId) {
       let defaultProp = await prisma.property.findFirst({ where: { ownerId: req.user?.id } });
       if(!defaultProp) {
         defaultProp = await prisma.property.create({
            data: {
              ownerId: req.user!.id,
              propertyName: 'Default PG',
              address: 'N/A',
              city: 'N/A',
              totalFloors: 1
            }
         });
       }
       targetPropertyId = defaultProp.id;
    }

    const room = await prisma.room.create({
      data: {
        propertyId: targetPropertyId,
        roomNumber,
        floor,
        roomType,
        rentPrice,
        totalBeds,
        availableBeds: totalBeds,
        status: 'AVAILABLE',
        beds: {
          create: Array.from({ length: totalBeds }).map((_, index) => ({
            bedNumber: index + 1,
            status: 'AVAILABLE',
          })),
        },
      },
      include: { beds: true }
    });

    res.status(201).json(room);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update Room
router.put('/:id', authorizeRole(['OWNER', 'MANAGER']), async (req: Request, res: Response) => {
  try {
    const { roomType, rentPrice, status } = req.body;
    const room = await prisma.room.update({
      where: { id: req.params.id },
      data: { roomType, rentPrice, status },
    });
    res.status(200).json(room);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Delete Room
router.delete('/:id', authorizeRole(['OWNER']), async (req: Request, res: Response) => {
  try {
    // Check if room has active tenants
    const room = await prisma.room.findUnique({
      where: { id: req.params.id },
      include: { tenants: { where: { status: 'ACTIVE' } } },
    });

    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (room.tenants.length > 0) {
      return res.status(400).json({ message: 'Cannot delete room with active tenants' });
    }

    // Delete beds and then room
    await prisma.bed.deleteMany({ where: { roomId: req.params.id } });
    await prisma.room.delete({ where: { id: req.params.id } });

    res.status(200).json({ message: 'Room deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
