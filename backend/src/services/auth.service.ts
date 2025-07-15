import { prisma } from '../models/prisma/client';
import { generateOtp } from '../utils/otpUtils';
import { getOtpEmailTemplate } from '../utils/emailTemplates';
import { createActivityLog } from './activityLog.service';
import { VerifyOtpRequest } from '../types/auth';

export async function loginWithoutOtp(divisionPass: string) {
  const user = await prisma.user.findUnique({
    where: { divisionPass },
  });

  if (!user) {
    throw new Error('Invalid Division Pass');
  }

  return {
    userId: user.id,
    name: user.name,
    role: user.role,
    message: 'Logged in successfully (no OTP required)',
  };
}

export async function loginWithOtp(divisionPass: string) {
  const user = await prisma.user.findUnique({
    where: { divisionPass },
  });

  if (!user) {
    throw new Error('Invalid Division Pass');
  }

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min expiry

  await prisma.user.update({
    where: { id: user.id },
    data: {
      otpCode: otp,
      otpExpiresAt: expiresAt,
    },
  });

  // For now, log to console instead of sending email
  console.log(`Email to ${user.email}:\n${getOtpEmailTemplate(otp)}`);

  return {
    userId: user.id,
    name: user.name,
    role: user.role,
    message: 'OTP has been sent to your email (logged in console for now)',
  };
}

export async function verifyOtp(input: VerifyOtpRequest) {
  const { divisionPass, otpOrQRCode, lockerNumber } = input;

  const user = await prisma.user.findUnique({
    where: { divisionPass },
  });

  const locker = await prisma.locker.findUnique({ where: { number: lockerNumber } });

  if (!locker) {
    throw new Error('Locker not found');
  }

  if (!user || !user.otpCode || !user.otpExpiresAt) {
    throw new Error('User not found or OTP not generated');
  }

  const now = new Date();
  if (user.otpCode !== otpOrQRCode || user.otpExpiresAt < now) {
    throw new Error('Invalid or expired OTP');
  }

  // Clear OTP after verification
  await prisma.user.update({
    where: { id: user.id },
    data: {
      otpCode: null,
      otpExpiresAt: null,
    },
  });

  if (locker.status !== 'ALLOCATED') {
    throw new Error('Locker not allocated');
  }

  // Log locker access activity
  await createActivityLog(user.id, locker.id, 'ACCESS');

  return {
    userId: user.id,
    name: user.name,
    role: user.role,
    lockerNumber: locker.number,
    message: 'OTP verified. Access granted to locker.',
  };
}
