import { prisma } from '../models/prisma/client';
import { LockerStatus, Role, ActivityType } from '@prisma/client';
import { 
  StartWithdrawalRequest, 
  UploadWithdrawalImagesRequest, 
  NotifyInvestigatorRequest, 
  RetrieveWithdrawalRequest 
} from '../types/withdrawal';
import { sendEmail } from './email.service';
import { getWithdrawalNotificationEmail } from '../utils/emailTemplates';
import { createActivityLog } from './activityLog.service';

interface ConfirmWithdrawalRequest {
  divisionPass: string;
  lockerNumber: number | string;
}

export async function startWithdrawalSession(input: StartWithdrawalRequest) {
  const { divisionPass, seizureReportNumber, lockerNumber } = input;

  const cso = await prisma.user.findUnique({ where: { divisionPass } });
  if (!cso || cso.role !== Role.CASE_STORE_OFFICER) {
    throw new Error('Unauthorized: Not a Case Store Officer');
  }

  // Find the locker by the specified number
  const locker = await prisma.locker.findUnique({ where: { number: lockerNumber } });
  if (!locker) {
    throw new Error(`Locker number ${lockerNumber} does not exist`);
  }

  if (locker.status !== LockerStatus.AVAILABLE) {
    throw new Error(`Locker number ${lockerNumber} is not available`);
  }

  // Create withdrawal session
  const withdrawal = await prisma.withdrawal.create({
    data: {
      seizureReportNo: seizureReportNumber,
      userId: cso.id,
      lockerId: locker.id,
    },
  });

  // Update locker status to ALLOCATED
  await prisma.locker.update({ where: { id: locker.id }, data: { status: LockerStatus.ALLOCATED } });

  // Log activity
  await createActivityLog(cso.id, locker.id, ActivityType.WITHDRAWAL);

  return {
    withdrawalId: withdrawal.id,
    lockerNumber: locker.number,
    message: 'Withdrawal session started for Case Store Officer',
  };
}

export async function uploadWithdrawalImages(input: UploadWithdrawalImagesRequest) {
  const { withdrawalId, frontImageUrl, backImageUrl } = input;

  const withdrawal = await prisma.withdrawal.findUnique({ where: { id: withdrawalId } });
  if (!withdrawal) throw new Error('Withdrawal not found');

  return prisma.withdrawal.update({
    where: { id: withdrawalId },
    data: { frontImageUrl, backImageUrl },
  });
}

export async function notifyInvestigator(input: NotifyInvestigatorRequest) {
  const { seizureReportNumber, lockerNumber } = input;

  // Find deposit by seizureReportNumber
  const deposit = await prisma.deposit.findFirst({
    where: { seizureReportNo: seizureReportNumber },
    include: { user: true }, // get the investigator user who deposited
  });
  if (!deposit || !deposit.user) {
    throw new Error('Investigator (from deposit) not found');
  }

  const investigator = deposit.user;

  // Find locker
  const locker = await prisma.locker.findUnique({ where: { number: lockerNumber } });
  if (!locker) throw new Error('Locker not found');

  // Find existing withdrawal
  const withdrawal = await prisma.withdrawal.findFirst({
    where: { seizureReportNo: seizureReportNumber },
  });
  if (!withdrawal) {
    throw new Error('Withdrawal not found for this seizure report number');
  }

  // Send email with withdrawalId
  const emailBody = getWithdrawalNotificationEmail({
    investigatorName: investigator.name,
    seizureReportNo: seizureReportNumber,
    lockerNumber: locker.number,
    withdrawalId: withdrawal.id, // add this param to template
  });

  await sendEmail(investigator.email, 'Exhibit Ready for Collection', emailBody);

  return { message: 'Email notification sent to investigator', withdrawalId: withdrawal.id };
}


export async function confirmWithdrawal(input: ConfirmWithdrawalRequest) {
  const { divisionPass, lockerNumber } = input;

  const user = await prisma.user.findUnique({ where: { divisionPass } });
  if (!user) throw new Error('User not found');

  const locker = await prisma.locker.findFirst({ where: { number: Number(lockerNumber) } });
  if (!locker || locker.status !== LockerStatus.ALLOCATED) {
    throw new Error('Locker not ready for withdrawal');
  }

  console.log(`Locker ${lockerNumber} opened.`);

  // log activity
  await createActivityLog(user.id, locker.id, ActivityType.ACCESS);

  return { message: `Locker ${lockerNumber} opened successfully` };
}

export async function completeWithdrawal(input: RetrieveWithdrawalRequest) {
  const { withdrawalId, signatureData, frontImageUrl, backImageUrl } = input;

  const withdrawal = await prisma.withdrawal.findUnique({
    where: { id: withdrawalId },
    include: { user: true, locker: true },
  });
  if (!withdrawal) throw new Error('Withdrawal not found');

  await prisma.withdrawal.update({
    where: { id: withdrawalId },
    data: {
      signature: signatureData,
      retrieveFrontImageUrl: frontImageUrl,
      retrieveBackImageUrl: backImageUrl,
    },
  });

  await prisma.locker.update({
    where: { id: withdrawal.lockerId },
    data: { status: LockerStatus.AVAILABLE },
  });

  // log activity
  await createActivityLog(withdrawal.user.id, withdrawal.locker.id, ActivityType.COLLECTION);

  const caseStoreOfficers = await prisma.user.findMany({
    where: { role: Role.CASE_STORE_OFFICER },
  });
  //const recipients = [withdrawal.user.email, ...caseStoreOfficers.map((u) => u.email)];

  // Find the investigator who deposited originally
  const deposit = await prisma.deposit.findFirst({
    where: { seizureReportNo: withdrawal.seizureReportNo },
    include: { user: true }, // assuming Deposit.userId -> User
  });

  const investigatorEmail = deposit?.user?.email;

  const recipients = [
    ...(investigatorEmail ? [investigatorEmail] : []),
    ...caseStoreOfficers.map(u => u.email)
  ].filter(Boolean);
  
  const emailBody = `
  Exhibit has been withdrawn by ${withdrawal.user.name} (Division Pass: ${withdrawal.user.divisionPass})
  Locker: ${withdrawal.locker.number}
  Seizure Report No: ${withdrawal.seizureReportNo}
  `.trim();

  for (const to of recipients) {
    await sendEmail(to, 'Exhibit Withdrawal Notification', emailBody);
  }

  return { message: 'Withdrawal completed and notifications sent.' };
}
