import { APIGatewayProxyHandler } from 'aws-lambda';
import { verifyOtp } from '../../services/auth.service';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { divisionPass, otpOrQRCode, lockerNumber } = body;

    const lockerNumberInt = parseInt(lockerNumber, 10);
    if (!divisionPass || !otpOrQRCode || isNaN(lockerNumberInt)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'divisionPass, otpOrQRCode and valid lockerNumber are required' }),
      };
    }

    const result = await verifyOtp({ divisionPass, otpOrQRCode, lockerNumber: lockerNumberInt });

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (err) {
    console.error('Verify-otp error:', err);
    return {
      statusCode: 401,
      body: JSON.stringify({ error: (err as Error).message }),
    };
  }
};
