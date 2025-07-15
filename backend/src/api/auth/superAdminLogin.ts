import type { APIGatewayProxyHandler } from 'aws-lambda';
import { loginSuperAdmin } from '../../services/superAdmin.service';

export const superAdminLogin: APIGatewayProxyHandler = async (event) => {
  try {
    if (!event.body) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Missing body' }) };
    }
    const { email, password } = JSON.parse(event.body);

    if (!email || !password) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Email and password required' }) };
    }

    const user = await loginSuperAdmin(email, password);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Login successful', user }),
    };
  } catch (err: any) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: err.message || 'Unauthorized' }),
    };
  }
};
