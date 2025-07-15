import { APIGatewayProxyHandler } from 'aws-lambda';
import { completeDeposit } from '../../services/deposit.service';  // Or deposit.service if you separate

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { depositId, csoDivisionPass } = body;

    if (!depositId || !csoDivisionPass) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    const result = await completeDeposit(depositId, csoDivisionPass);

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: (err as Error).message }),
    };
  }
};
