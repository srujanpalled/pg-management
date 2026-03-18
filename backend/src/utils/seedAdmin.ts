import { prisma } from './db';
import bcrypt from 'bcrypt';

async function seed() {
  const adminEmail = 'admin@pgmanager.com';
  
  const existingUser = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existingUser) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('admin123', salt);

    const user = await prisma.user.create({
      data: {
        name: 'Admin',
        email: adminEmail,
        phone: '0000000000',
        passwordHash,
        role: 'OWNER',
      },
    });
    console.log('Default admin user created:', user.id);
  } else {
    console.log('Admin user already exists.');
  }
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
