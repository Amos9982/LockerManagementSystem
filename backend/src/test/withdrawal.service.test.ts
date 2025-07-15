import { startWithdrawalSession, confirmWithdrawal } from '../services/withdrawal.service';
import { prisma } from '../models/prisma/client';

jest.mock('../models/prisma/client', () => ({
  prisma: {
    user: { findUnique: jest.fn(), findMany: jest.fn() },
    locker: { findUnique: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
    withdrawal: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
    activityLog: { create: jest.fn() },
  },
}));

jest.mock('../services/otp.service', () => ({
  verifyOtp: jest.fn(),
}));

describe('startWithdrawalSession', () => {
  it('should throw if no available locker', async () => {
    (prisma.user.findUnique as jest.Mock)
      .mockResolvedValueOnce({ id: 'cso1', role: 'CASE_STORE_OFFICER' }) // CSO
      .mockResolvedValueOnce({ id: 'inv1', role: 'INVESTIGATOR' }); // Investigator

    (prisma.locker.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(startWithdrawalSession({
      divisionPass: 'cso1',
      seizureReportNumber: 'SR001',
      investigatorDivisionPass: 'inv1',
    })).rejects.toThrow('No available lockers for withdrawal');
  });

  it('should create withdrawal and allocate locker', async () => {
    (prisma.user.findUnique as jest.Mock)
      .mockResolvedValueOnce({ id: 'cso1', role: 'CASE_STORE_OFFICER' }) // CSO
      .mockResolvedValueOnce({ id: 'inv1', role: 'INVESTIGATOR' }); // Investigator

    (prisma.locker.findFirst as jest.Mock).mockResolvedValue({ id: 'L1', status: 'AVAILABLE' });
    (prisma.withdrawal.create as jest.Mock).mockResolvedValue({ id: 'W1' });
    (prisma.locker.update as jest.Mock).mockResolvedValue({});
    (prisma.activityLog.create as jest.Mock).mockResolvedValue({});

    const result = await startWithdrawalSession({
      divisionPass: 'cso1',
      seizureReportNumber: 'SR001',
      investigatorDivisionPass: 'inv1',
    });

    expect(result).toMatchObject({
      withdrawalId: 'W1',
      lockerId: 'L1',
      message: expect.any(String),
    });

    expect(prisma.withdrawal.create).toHaveBeenCalled();
    expect(prisma.locker.update).toHaveBeenCalled();
    expect(prisma.activityLog.create).toHaveBeenCalled();
  });
});
