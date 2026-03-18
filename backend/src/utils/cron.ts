import cron from 'node-cron';
import { prisma } from './db';

// Run every day at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('Running daily automation tasks...');
  try {
    const today = new Date();
    const isFirstOfMonth = today.getDate() === 1;

    // 1. Generate new rent dues if it is the 1st of the month
    if (isFirstOfMonth) {
      console.log('1st of the month: Generating rent dues...');
      const activeTenants = await prisma.tenant.findMany({ where: { status: 'ACTIVE' } });
      
      const currentMonth = today.toISOString().slice(0, 7); // YYYY-MM
      
      for (const tenant of activeTenants) {
        // Check if payment already exists for this month to avoid duplicates
        const existingPayment = await prisma.payment.findFirst({
          where: { tenantId: tenant.id, paymentMonth: currentMonth, title: 'Rent' } as any
        });

        if (!existingPayment) {
          await prisma.payment.create({
            data: {
              tenantId: tenant.id,
              amount: tenant.rentAmount,
              paymentMethod: 'Pending',
              paymentMonth: currentMonth,
              status: 'PENDING',
            }
          });

          // Generate a notification for the owner
          await prisma.notification.create({
             data: {
               userId: tenant.room?.property?.ownerId || '', // Would need include relation or specific owner fetching
               type: 'RentReminder',
               message: `Rent generated for ${tenant.name} for ${currentMonth}`,
             } as any
          });
        }
      }
    }

    // 2. Mark overdue payments (e.g. past 5th of the month)
    if (today.getDate() > 5) {
      const currentMonth = today.toISOString().slice(0, 7);
      const updated = await prisma.payment.updateMany({
        where: { paymentMonth: currentMonth, status: 'PENDING' },
        data: { status: 'OVERDUE' }
      });
      if (updated.count > 0) {
        console.log(`Marked ${updated.count} payments as OVERDUE`);
      }
    }

  } catch (error) {
    console.error('Error in daily automation:', error);
  }
});
