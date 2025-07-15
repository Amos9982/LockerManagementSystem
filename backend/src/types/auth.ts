export interface VerifyOtpRequest {
  divisionPass: string;
  otpOrQRCode: string;
  lockerNumber: number;
}