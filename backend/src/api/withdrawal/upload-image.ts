import { APIGatewayProxyHandler } from 'aws-lambda';
import { uploadWithdrawalImages } from '../../services/withdrawal.service';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { withdrawalId, frontImageUrl, backImageUrl } = body;

    if (!withdrawalId || !frontImageUrl || !backImageUrl) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing image or withdrawal ID' }),
      };
    }

    const result = await uploadWithdrawalImages({ withdrawalId, frontImageUrl, backImageUrl });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Images uploaded successfully', result }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: (err as Error).message }),
    };
  }
};
