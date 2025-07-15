import { startDepositSession, acknowledgeDeposit } from '../services/deposit.service';
import { prisma } from '../models/prisma/client';
import * as emailService from '../services/email.service';

// Mock prisma client methods
jest.mock('../models/prisma/client', () => ({
  prisma: {
    user: { findUnique: jest.fn(), findMany: jest.fn() },
    locker: { findUnique: jest.fn(), update: jest.fn() },
    deposit: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
    activityLog: { create: jest.fn() },
  },
}));

// Mock sendEmail so it doesn't send real emails during tests
jest.spyOn(emailService, 'sendEmail').mockImplementation(() => Promise.resolve());

describe('startDepositSession', () => {
  // Added lockerNumber to match StartDepositRequest type
  const validInput = {
    divisionPass: 'INV123',
    seizureReportNumber: 'SR001',
    lockerId: 'LOCKER1',
    lockerNumber: 1, // <--- required field added here
  };

  it('should throw if user not found', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(startDepositSession(validInput))
      .rejects
      .toThrow('Invalid division pass');
  });

  it('should throw if locker is not available', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'U1' });
    (prisma.locker.findUnique as jest.Mock).mockResolvedValue({ status: 'OCCUPIED' });

    await expect(startDepositSession(validInput))
      .rejects
      .toThrow('Locker is not available');
  });

  it('should create deposit and update locker on success', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'U1' });
    (prisma.locker.findUnique as jest.Mock).mockResolvedValue({ id: 'L1', status: 'AVAILABLE' });
    (prisma.deposit.create as jest.Mock).mockResolvedValue({ id: 'D1' });
    (prisma.activityLog.create as jest.Mock).mockResolvedValue({});

    const result = await startDepositSession(validInput);

    expect(result).toMatchObject({
      depositId: 'D1',
      lockerId: 'L1',
      userId: 'U1',
      message: 'Deposit session started successfully',
    });
  });
});

describe('acknowledgeDeposit', () => {
  it('should throw if deposit not found', async () => {
    (prisma.deposit.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(
      acknowledgeDeposit({ depositId: 'nonexistent', itemDescription: 'Test', signatureData: 'abc' })
    ).rejects.toThrow('Deposit not found');
  });

  it('should update deposit and send email', async () => {
    // Mock deposit with nested user and locker data (needed for email)
    (prisma.deposit.findUnique as jest.Mock).mockResolvedValue({ 
      id: 'deposit1', 
      userId: 'user1', 
      lockerId: 'locker1', 
      seizureReportNo: 'SR001',
      user: { name: 'John', email: 'john@example.com' },
      locker: { number: 1 },
    });

    (prisma.deposit.update as jest.Mock).mockResolvedValue({});
    (prisma.locker.update as jest.Mock).mockResolvedValue({});
    (prisma.activityLog.create as jest.Mock).mockResolvedValue({});

    // Mock findMany to simulate Case Store Officers for email recipients
    (prisma.user.findMany as jest.Mock).mockResolvedValue([
      { email: 'cso1@example.com' },
      { email: 'cso2@example.com' },
    ]);

    await acknowledgeDeposit({ depositId: 'deposit1', itemDescription: 'Item A', signatureData: 'sig' });

    expect(emailService.sendEmail).toHaveBeenCalled();
    expect(prisma.deposit.update).toHaveBeenCalled();
    expect(prisma.locker.update).toHaveBeenCalled();
    expect(prisma.activityLog.create).toHaveBeenCalled();
  });
});
