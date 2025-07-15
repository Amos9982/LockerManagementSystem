import { LockerStatus } from '@prisma/client';

export function isLockerAvailable(status: LockerStatus): boolean {
  return status === LockerStatus.AVAILABLE;
}