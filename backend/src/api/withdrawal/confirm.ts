import { APIGatewayProxyHandler } from 'aws-lambda';
import { confirmWithdrawal } from '../../services/withdrawal.service';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { divisionPass, lockerNumber } = body;

    if (!divisionPass || lockerNumber === undefined) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    const result = await confirmWithdrawal({ divisionPass, lockerNumber });

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
