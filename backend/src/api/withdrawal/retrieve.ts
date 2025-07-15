import { APIGatewayProxyHandler } from 'aws-lambda';
import { completeWithdrawal } from '../../services/withdrawal.service';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');

    const { withdrawalId, signatureData, frontImageUrl, backImageUrl } = body;

    if (!withdrawalId || !signatureData || !frontImageUrl || !backImageUrl) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    const result = await completeWithdrawal({
      withdrawalId,
      signatureData,
      frontImageUrl,
      backImageUrl,
    });

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
