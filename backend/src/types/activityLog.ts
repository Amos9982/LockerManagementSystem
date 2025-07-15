import { ActivityType, Role } from '@prisma/client';

export interface ActivityLogResponse {
  id: string;
  userId: string;
  lockerId: string;
  type: ActivityType;
  timestamp: string;  // ISO string
  user: {
    name: string;
    role: Role;
  };
  locker: {
    number: number;
  };
}
