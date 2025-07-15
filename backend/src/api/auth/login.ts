import { APIGatewayProxyHandler } from 'aws-lambda';
import { loginWithOtp, loginWithoutOtp } from '../../services/auth.service';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { divisionPass, needsOtp } = body;

    if (!divisionPass) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'divisionPass is required' }),
      };
    }

    let result;
    if (needsOtp) {
      result = await loginWithOtp(divisionPass);
    } else {
      result = await loginWithoutOtp(divisionPass);
    }

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (err) {
    console.error('Login error:', err);
    return {
      statusCode: 401,
      body: JSON.stringify({ error: (err as Error).message }),
    };
  }
};
