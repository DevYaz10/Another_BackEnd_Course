import { config } from "dotenv";

config({ path: `.env.${process.env.NODE_ENV || "development"}` });

export const {
  PORT,
  NODE_ENV,
  APP_URL,
  DB_URI,
  JWT_SECRET, JWT_EXPIRES_IN,
  QSTASH_URL, QSTASH_TOKEN, QSTASH_CURRENT_SIGNING_KEY, QSTASH_NEXT_SIGNING_KEY,
  EMAIL_USER, EMAIL_PASSWORD
} = process.env;
