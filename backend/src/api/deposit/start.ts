import { APIGatewayProxyHandler } from 'aws-lambda';
import { startDepositSession } from '../../services/deposit.service';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { divisionPass, seizureReportNumber, lockerNumber } = body;

    if (!divisionPass || !seizureReportNumber || lockerNumber === undefined) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    const result = await startDepositSession({ divisionPass, seizureReportNumber, lockerNumber });

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
