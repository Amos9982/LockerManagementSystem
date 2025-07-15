import { APIGatewayProxyHandler } from "aws-lambda";
import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: Number(process.env.PGPORT),
});

export const handler: APIGatewayProxyHandler = async () => {
  try {
    const result = await pool.query("SELECT NOW()");
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Connected to PostgreSQL!",
        time: result.rows[0].now,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "DB connection failed", details: error }),
    };
  }
};
