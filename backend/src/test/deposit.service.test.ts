import {
  startDepositSession,
  acknowledgeDeposit,
  uploadDepositImages,
  completeDeposit
} from '../services/deposit.service';
import { prisma } from '../models/prisma/client';
import * as emailService from '../services/email.service';
import * as activityLogService from '../services/activityLog.service';

jest.mock('../models/prisma/client', () => ({
  prisma: {
    user: { findUnique: jest.fn(), findMany: jest.fn() },
    locker: { findUnique: jest.fn(), update: jest.fn() },
    deposit: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
  },
}));

jest.mock('../services/email.service', () => ({
  sendEmail: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../services/activityLog.service', () => ({
  createActivityLog: jest.fn().mockResolvedValue(undefined),
}));

describe('deposit.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('startDepositSession', () => {
    const input = { divisionPass: 'DP123', seizureReportNumber: 'SR001', lockerNumber: 1 };

    it('throws if user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(startDepositSession(input)).rejects.toThrow('Invalid division pass');
    });

    it('throws if locker unavailable', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'U1' });
      (prisma.locker.findUnique as jest.Mock).mockResolvedValue({ status: 'OCCUPIED' });
      await expect(startDepositSession(input)).rejects.toThrow('Locker is not available');
    });

    it('creates deposit and updates locker', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'U1' });
      (prisma.locker.findUnique as jest.Mock).mockResolvedValue({ id: 'L1', status: 'AVAILABLE' });
      (prisma.deposit.create as jest.Mock).mockResolvedValue({ id: 'D1' });

      const result = await startDepositSession(input);

      expect(result).toEqual({
        depositId: 'D1',
        lockerId: 'L1',
        userId: 'U1',
        message: 'Deposit session started successfully',
      });
      expect(prisma.deposit.create).toHaveBeenCalled();
      expect(prisma.locker.update).toHaveBeenCalled();
      expect(activityLogService.createActivityLog).toHaveBeenCalled();
    });
  });

  describe('acknowledgeDeposit', () => {
    it('throws if deposit not found', async () => {
      (prisma.deposit.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(
        acknowledgeDeposit({ depositId: 'D1', itemDescription: 'desc', signatureData: 'sig' })
      ).rejects.toThrow('Deposit not found');
    });

    it('updates deposit and sends emails', async () => {
      (prisma.deposit.findUnique as jest.Mock).mockResolvedValue({
        id: 'D1',
        seizureReportNo: 'SR001',
        user: { name: 'John', email: 'john@example.com' },
        locker: { number: 1 },
      });
      (prisma.deposit.update as jest.Mock).mockResolvedValue({});
      (prisma.user.findMany as jest.Mock).mockResolvedValue([
        { email: 'cso1@example.com' },
        { email: 'cso2@example.com' },
      ]);

      await acknowledgeDeposit({ depositId: 'D1', itemDescription: 'desc', signatureData: 'sig' });

      expect(prisma.deposit.update).toHaveBeenCalled();
      expect(emailService.sendEmail).toHaveBeenCalled();
    });
  });

  describe('uploadDepositImages', () => {
    it('throws if deposit not found', async () => {
      (prisma.deposit.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(uploadDepositImages('D1', 'front.jpg', 'back.jpg')).rejects.toThrow('Deposit not found');
    });

    it('updates deposit images', async () => {
      (prisma.deposit.findUnique as jest.Mock).mockResolvedValue({ id: 'D1' });
      (prisma.deposit.update as jest.Mock).mockResolvedValue({});
      await uploadDepositImages('D1', 'front.jpg', 'back.jpg');

      expect(prisma.deposit.update).toHaveBeenCalledWith({
        where: { id: 'D1' },
        data: { frontImageUrl: 'front.jpg', backImageUrl: 'back.jpg' },
      });
    });
  });

  describe('completeDeposit', () => {
    it('throws if CSO not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(completeDeposit('D1', 'CSO123')).rejects.toThrow('Unauthorized: Not a Case Store Officer');
    });

    it('throws if user is not CSO', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ role: 'INVESTIGATOR' });
      await expect(completeDeposit('D1', 'CSO123')).rejects.toThrow('Unauthorized: Not a Case Store Officer');
    });

    it('updates locker and logs activity', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'CSO1', role: 'CASE_STORE_OFFICER' });
      (prisma.deposit.findUnique as jest.Mock).mockResolvedValue({ lockerId: 'L1' });
      (prisma.locker.update as jest.Mock).mockResolvedValue({});

      const result = await completeDeposit('D1', 'CSO123');

      expect(result.message).toMatch(/Locker status updated/i);
      expect(prisma.locker.update).toHaveBeenCalled();
      expect(activityLogService.createActivityLog).toHaveBeenCalled();
    });
  });
});
