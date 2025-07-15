import { prisma } from '../models/prisma/client';

export async function verifyOtp(divisionPass: string, otpOrQRCode: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { divisionPass },
  });

  if (
    !user ||
    !user.otpCode ||
    !user.otpExpiresAt ||
    user.otpCode !== otpOrQRCode ||
    user.otpExpiresAt < new Date()
  ) {
    return false;
  }

  // Invalidate OTP after use
  await prisma.user.update({
    where: { divisionPass },
    data: {
      otpCode: null,
      otpExpiresAt: null,
    },
  });

  return true;
}
