import { APIGatewayProxyHandler } from 'aws-lambda';
import { notifyInvestigator } from '../../services/withdrawal.service';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { investigatorDivisionPass, seizureReportNumber, lockerNumber } = body;

    if (!investigatorDivisionPass || !seizureReportNumber || lockerNumber == null) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    const result = await notifyInvestigator({ investigatorDivisionPass, seizureReportNumber, lockerNumber });

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
