import { Router, Request, Response } from 'express';
import { prisma } from '../utils/db';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

// Get all workers
router.get('/', async (req: Request, res: Response) => {
  try {
    const workers = await prisma.worker.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(workers);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create a worker
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, phone, workType } = req.body;
    const worker = await prisma.worker.create({
      data: { name, phone, workType }
    });
    res.status(201).json(worker);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a worker
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.worker.delete({ where: { id } });
    res.json({ message: 'Worker deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
