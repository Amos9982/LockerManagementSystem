export interface StartDepositRequest {
  divisionPass: string;
  seizureReportNumber: string;
  lockerNumber: number;
}

export interface UploadDepositImagesRequest {
  depositId: string;
  frontImageUrl: string;
  backImageUrl: string;
}

export interface AcknowledgeDepositRequest {
  depositId: string;
  itemDescription: string;
  signatureData: string;
}
