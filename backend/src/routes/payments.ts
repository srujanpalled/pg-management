import { Router, Request, Response } from 'express';
import { prisma } from '../utils/db';
import { authenticate, authorizeRole } from '../middleware/auth';

const router = Router();
router.use(authenticate);

// Get all payments
router.get('/', async (req: Request, res: Response) => {
  try {
    const payments = await prisma.payment.findMany({
      include: { tenant: { select: { name: true, phone: true } } },
      orderBy: { paymentDate: 'desc' }
    });
    res.status(200).json(payments);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Record a payment
router.post('/', authorizeRole(['OWNER', 'MANAGER']), async (req: Request, res: Response) => {
  try {
    const { tenantId, amount, paymentMethod, paymentMonth, status, receiptNumber } = req.body;

    const payment = await prisma.payment.create({
      data: {
        tenantId,
        amount,
        paymentMethod,
        paymentMonth,
        status: status || 'PAID',
        receiptNumber,
      },
    });

    if (payment.status === 'PAID') {
      await prisma.tenant.update({
        where: { id: tenantId },
        data: { dueAmount: { decrement: amount } }
      });
    }

    res.status(201).json(payment);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update payment status (e.g. from PENDING to PAID)
router.put('/:id', authorizeRole(['OWNER', 'MANAGER']), async (req: Request, res: Response) => {
  try {
    const { status, paymentMethod, receiptNumber } = req.body;
    
    // Check old status
    const oldPayment = await prisma.payment.findUnique({ where: { id: req.params.id } });
    
    const payment = await prisma.payment.update({
      where: { id: req.params.id },
      data: { status, paymentMethod, receiptNumber },
    });

    // If changing from PENDING to PAID
    if (oldPayment?.status !== 'PAID' && status === 'PAID') {
      await prisma.tenant.update({
        where: { id: payment.tenantId },
        data: { dueAmount: { decrement: payment.amount } }
      });
    }

    res.status(200).json(payment);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
