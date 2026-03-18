import { Router, Request, Response } from 'express';
import { prisma } from '../utils/db';
import { authenticate, authorizeRole } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', async (req: Request, res: Response) => {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: { date: 'desc' }
    });
    res.status(200).json(expenses);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', authorizeRole(['OWNER', 'MANAGER']), async (req: Request, res: Response) => {
  try {
    const { propertyId, title, category, amount, date, description } = req.body;

    let targetPropertyId = propertyId;
    if (!targetPropertyId) {
      const defaultProp = await prisma.property.findFirst({ where: { ownerId: req.user?.id } });
      if(!defaultProp) return res.status(400).json({ message: 'No property found to attach expense to' });
      targetPropertyId = defaultProp.id;
    }

    const expense = await prisma.expense.create({
      data: {
        propertyId: targetPropertyId,
        title,
        category,
        amount,
        date: new Date(date),
        description
      },
    });

    res.status(201).json(expense);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', authorizeRole(['OWNER']), async (req: Request, res: Response) => {
  try {
    await prisma.expense.delete({ where: { id: req.params.id } });
    res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
