import { APIGatewayProxyHandler } from 'aws-lambda';
import { uploadDepositImages } from '../../services/deposit.service';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { depositId, frontImageUrl, backImageUrl } = body;

    if (!depositId || !frontImageUrl || !backImageUrl) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'depositId, frontImageUrl, and backImageUrl are required' }),
      };
    }

    const updated = await uploadDepositImages(depositId, frontImageUrl, backImageUrl);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Images uploaded successfully',
        deposit: updated,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: (err as Error).message }),
    };
  }
};
