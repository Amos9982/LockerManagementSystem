import { prisma } from '../models/prisma/client';
import { ActivityType } from '@prisma/client';

export async function getActivityLogs() {
  return prisma.activityLog.findMany({
    orderBy: { timestamp: 'desc' },
    include: {
      user: {
        select: {
          name: true,
          role: true,
        },
      },
      locker: {
        select: {
          number: true,
        },
      },
    },
  });
}

export async function createActivityLog(userId: string, lockerId: string, type: ActivityType) {
  return prisma.activityLog.create({
    data: {
      userId,
      lockerId,
      type,
    },
  });
}
