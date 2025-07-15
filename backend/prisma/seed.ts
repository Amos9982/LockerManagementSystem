import 'dotenv/config';
import { PrismaClient, Role, LockerStatus} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create users
  await prisma.user.createMany({
    data: [
      { divisionPass: 'INV001', name: 'Adam', role: Role.INVESTIGATOR, email: 'adam@example.com' },
      { divisionPass: 'CSO001', name: 'Bob', role: Role.CASE_STORE_OFFICER, email: 'bob@example.com' },
    ],
    skipDuplicates: true,
  });

  // Create lockers
  await prisma.locker.createMany({
    data: [
      { number: 1, status: LockerStatus.AVAILABLE },
      { number: 2, status: LockerStatus.AVAILABLE },
    ],
    skipDuplicates: true,
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
