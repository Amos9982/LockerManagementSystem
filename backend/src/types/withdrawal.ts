export interface StartWithdrawalRequest {
  divisionPass: string;
  seizureReportNumber: string;
  investigatorDivisionPass: string;
  lockerNumber: number;
}

export interface UploadWithdrawalImagesRequest {
  withdrawalId: string;
  frontImageUrl: string;
  backImageUrl: string;
}

export interface NotifyInvestigatorRequest {
  investigatorDivisionPass: string;
  seizureReportNumber: string;
  lockerNumber: number;
}

export interface ConfirmWithdrawalRequest {
  divisionPass: string;
  otpOrQRCode: string;
  lockerNumber: number;
}

export interface RetrieveWithdrawalRequest {
  withdrawalId: string;
  signatureData: string;
  frontImageUrl: string;
  backImageUrl: string;
}
