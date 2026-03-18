import { Router, Request, Response } from 'express';
import { prisma } from '../utils/db';
import { authenticate, authorizeRole } from '../middleware/auth';

const router = Router();
router.use(authenticate);
router.use(authorizeRole(['OWNER', 'MANAGER']));

router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const propertyId = req.query.propertyId as string;
    
    // Fallback logic for single default PG if no specific ID provided
    let targetPropertyId = propertyId;
    if (!targetPropertyId) {
       const defaultProp = await prisma.property.findFirst({ where: { ownerId: req.user?.id } });
       if(defaultProp) targetPropertyId = defaultProp.id;
    }

    const filter = targetPropertyId ? { propertyId: targetPropertyId } : {};

    // 1. Total Tenants
    const tenantsCount = await prisma.tenant.count({ where: { status: 'ACTIVE', room: filter } });

    // 2. Room Statistics
    const rooms = await prisma.room.findMany({ where: filter, include: { _count: { select: { beds: true } } } });
    const totalBeds = rooms.reduce((acc, room) => acc + room.totalBeds, 0);
    const occupiedBeds = rooms.reduce((acc, room) => acc + room.occupiedBeds, 0);
    const availableBeds = totalBeds - occupiedBeds;

    // 3. Revenue (This Month)
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const payments = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: { paymentMonth: currentMonth, status: 'PAID', tenant: { room: filter } }
    });

    // 4. Expenses (This Month)
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const expenses = await prisma.expense.aggregate({
      _sum: { amount: true },
      where: { propertyId: targetPropertyId, date: { gte: startOfMonth } }
    });

    const revenue = payments._sum.amount || 0;
    const totalExpenses = expenses._sum.amount || 0;
    const profit = revenue - totalExpenses;

    res.status(200).json({
      tenantsCount,
      occupancy: { totalBeds, occupiedBeds, availableBeds },
      financials: { currentMonth, revenue, expenses: totalExpenses, profit }
    });

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
