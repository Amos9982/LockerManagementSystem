import { prisma } from '../models/prisma/client';
import { isLockerAvailable } from '../utils/lockerUtils';
import { StartDepositRequest, AcknowledgeDepositRequest } from '../types/deposit';
import { LockerStatus, Role, ActivityType } from '@prisma/client';
import { sendEmail } from './email.service';
import { getDepositNotificationEmail } from '../utils/emailTemplates';
import { createActivityLog } from './activityLog.service';

export async function startDepositSession(input: StartDepositRequest) {
  const { divisionPass, seizureReportNumber, lockerNumber } = input;

  const user = await prisma.user.findUnique({ where: { divisionPass } });
  if (!user) throw new Error('Invalid division pass');

  const locker = await prisma.locker.findUnique({ where: { number: lockerNumber } });
  if (!locker || !isLockerAvailable(locker.status)) {
    throw new Error('Locker is not available');
  }

  const deposit = await prisma.deposit.create({
    data: {
      seizureReportNo: seizureReportNumber,
      userId: user.id,
      lockerId: locker.id,
    },
  });

  await prisma.locker.update({
    where: { id: locker.id },
    data: { status: LockerStatus.OCCUPIED },
  });

  // log activity
  await createActivityLog(user.id, locker.id, ActivityType.DEPOSIT);

  return {
    depositId: deposit.id,
    lockerId: locker.id,
    userId: user.id,
    message: 'Deposit session started successfully',
  };
}

export async function uploadDepositImages(depositId: string, frontUrl: string, backUrl: string) {
  const deposit = await prisma.deposit.findUnique({ where: { id: depositId } });
  if (!deposit) throw new Error('Deposit not found');

  return prisma.deposit.update({
    where: { id: depositId },
    data: {
      frontImageUrl: frontUrl,
      backImageUrl: backUrl,
    },
  });
}

export async function acknowledgeDeposit(input: AcknowledgeDepositRequest) {
  const { depositId, itemDescription, signatureData } = input;

  const deposit = await prisma.deposit.findUnique({
    where: { id: depositId },
    include: { user: true, locker: true },
  });
  if (!deposit) throw new Error('Deposit not found');

  await prisma.deposit.update({
    where: { id: depositId },
    data: {
      remarks: itemDescription,
      signature: signatureData,
    },
  });

  const emailBody = getDepositNotificationEmail({
    investigatorName: deposit.user.name,
    lockerNumber: deposit.locker.number,
    seizureReportNo: deposit.seizureReportNo,
  });

  const caseStoreOfficers = await prisma.user.findMany({
    where: { role: Role.CASE_STORE_OFFICER },
  });
  const recipients = [deposit.user.email, ...caseStoreOfficers.map(u => u.email)];

  for (const to of recipients) {
    await sendEmail(to, 'Exhibit Deposited Notification', emailBody);
  }

  return { message: 'Deposit acknowledged and emails sent.' };
}

export async function completeDeposit(depositId: string, csoDivisionPass: string) {
  const cso = await prisma.user.findUnique({ where: { divisionPass: csoDivisionPass } });
  if (!cso || cso.role !== Role.CASE_STORE_OFFICER) {
    throw new Error('Unauthorized: Not a Case Store Officer');
  }

  const deposit = await prisma.deposit.findUnique({ where: { id: depositId } });
  if (!deposit) throw new Error('Deposit not found');

  await prisma.locker.update({
    where: { id: deposit.lockerId },
    data: { status: LockerStatus.AVAILABLE },
  });

  // log activity
  await createActivityLog(cso.id, deposit.lockerId, ActivityType.COLLECTION);

  return { message: 'Locker status updated to AVAILABLE after collection' };
}
