import { APIGatewayProxyHandler } from 'aws-lambda';
import { startWithdrawalSession } from '../../services/withdrawal.service';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { divisionPass, seizureReportNumber, lockerNumber } = body;

    const lockerNumberInt = parseInt(lockerNumber, 10);
    if (
      !divisionPass || 
      !seizureReportNumber || 
      isNaN(lockerNumberInt)
    ) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing or invalid required fields' }),
      };
    }

    const result = await startWithdrawalSession({ 
      divisionPass, 
      seizureReportNumber, 
      //investigatorDivisionPass, 
      lockerNumber: lockerNumberInt 
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
