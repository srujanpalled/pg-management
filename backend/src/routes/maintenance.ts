import { Router, Request, Response } from 'express';
import { prisma } from '../utils/db';
import { authenticate, authorizeRole } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', async (req: Request, res: Response) => {
  try {
    const requests = await prisma.maintenanceRequest.findMany({
      include: { room: true, tenant: true },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(requests);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    // Both Tenants and Staff/Owners can create requests
    const { roomId, tenantId, issueType, description, priority } = req.body;
    const request = await prisma.maintenanceRequest.create({
      data: { roomId, tenantId, issueType, description, priority: priority || 'MEDIUM' },
    });
    res.status(201).json(request);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', authorizeRole(['OWNER', 'MANAGER', 'STAFF']), async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const resolvedAt = status === 'RESOLVED' ? new Date() : null;

    const request = await prisma.maintenanceRequest.update({
      where: { id: req.params.id },
      data: { status, resolvedAt },
    });

    if (status === 'RESOLVED') {
      const room = await prisma.room.findUnique({ where: { id: request.roomId } });
      if (room) {
        const newStatus = room.availableBeds > 0 ? 'AVAILABLE' : 'OCCUPIED';
        await prisma.room.update({
          where: { id: room.id },
          data: { status: newStatus }
        });
      }
    }

    res.status(200).json(request);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
