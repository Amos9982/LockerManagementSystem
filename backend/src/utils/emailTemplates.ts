export function getOtpEmailTemplate(code: string): string {
  return `Your OTP code is: ${code}

This code will expire in 5 minutes.`;
}

export function getInvestigatorDepositConfirmationEmail(data: {
  lockerNumber: number;
  seizureReportNo: string;
  depositId: string;
}): string {
  return `
Your deposit has been successfully completed.

Locker Number: ${data.lockerNumber}
Seizure Report No: ${data.seizureReportNo}
Deposit ID: ${data.depositId}

The Case Store Officer will now retrieve the item and update CRIMES3.
`;
}

export function getDepositNotificationEmail(data: {
  investigatorName: string;
  lockerNumber: number;
  seizureReportNo: string;
  depositId: string;
}): string {
  return `
Exhibit deposited by: ${data.investigatorName}
Locker Number: ${data.lockerNumber}
Seizure Report No: ${data.seizureReportNo}
Deposit ID: ${data.depositId}

Please retrieve and update CRIMES3 accordingly.
`;
}

export function getWithdrawalNotificationEmail({ investigatorName, seizureReportNo, lockerNumber, withdrawalId }: {
  investigatorName: string;
  seizureReportNo: string;
  lockerNumber: number;
  withdrawalId: string;
}) {
  return `
    Hello ${investigatorName},
    Your exhibit is ready for collection.
    Seizure Report No: ${seizureReportNo}
    Locker Number: ${lockerNumber}
    Withdrawal ID: ${withdrawalId}
    Please proceed to collect it.
  `;
}
