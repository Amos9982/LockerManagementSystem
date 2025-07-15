import { APIGatewayProxyHandler } from 'aws-lambda';
import { loginWithOtp } from '../../services/auth.service';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { divisionPass } = body;

    if (!divisionPass) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'divisionPass is required' }),
      };
    }

    const result = await loginWithOtp(divisionPass);

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (err) {
    console.error('Login-with-otp error:', err);
    return {
      statusCode: 401,
      body: JSON.stringify({ error: (err as Error).message }),
    };
  }
};
