import { APIGatewayProxyHandler } from 'aws-lambda';
import { acknowledgeDeposit } from '../../services/deposit.service';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { depositId, itemDescription, signatureData } = body;

    if (!depositId || !itemDescription || !signatureData) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing fields' }),
      };
    }

    const result = await acknowledgeDeposit({ depositId, itemDescription, signatureData });

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
