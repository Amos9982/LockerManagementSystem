import { APIGatewayProxyHandler } from 'aws-lambda';
import { getActivityLogs } from '../../services/activityLog.service';

export const handler: APIGatewayProxyHandler = async (event, context) => {
  try {
    const logs = await getActivityLogs();
    return {
      statusCode: 200,
      body: JSON.stringify(logs),
    };
  } catch (error) {
    console.error('Failed to fetch activity logs:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
