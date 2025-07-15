export function getOtpEmailTemplate(code: string): string {
  return `Your OTP code is: ${code}

This code will expire in 5 minutes.`;
}

export function getDepositNotificationEmail(data: {
  investigatorName: string;
  lockerNumber: number;
  seizureReportNo: string;
}): string {
  return `
    Exhibit deposited by: ${data.investigatorName}
    Locker Number: ${data.lockerNumber}
    Seizure Report No: ${data.seizureReportNo}

    Please retrieve and update CRIMES3 accordingly.
  `;
}

export function getWithdrawalNotificationEmail(data: {
  investigatorName: string;
  seizureReportNo: string;
  lockerNumber: number;
}): string {
  return `
    Dear ${data.investigatorName},

    Your exhibit for Seizure Report Number ${data.seizureReportNo} has been placed in Locker Number ${data.lockerNumber}.
    Please proceed to the system to retrieve it at your convenience.

    Regards,
    Exhibit Handling System
  `;
}
