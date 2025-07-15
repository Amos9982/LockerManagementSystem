import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const plainPassword = 'superadmin123';
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  await prisma.user.upsert({
    where: { divisionPass: 'SUPERADMIN' },
    update: {
      role: Role.SUPER_ADMIN,
      password: hashedPassword,
    },
    create: {
      divisionPass: 'SUPERADMIN',
      name: 'Super Admin',
      role: Role.SUPER_ADMIN,
      email: 'superadmin@example.com',
      password: hashedPassword,
    },
  });

  console.log('✅ Super Admin seeded: email=superadmin@example.com, password=superadmin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
