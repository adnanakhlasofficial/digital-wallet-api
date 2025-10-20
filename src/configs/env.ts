import dotenv from "dotenv";
dotenv.config();

interface IENV {
  PORT: string;
  MONGODB_URI: string;
  NODE_ENV: string;
  FRONTEND_URL: string;
  JWT_ACCESS_SECRET: string;
  JWT_ACCESS_EXPIRES_AT: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES_AT: string;
  BCRYPT_SALT: string;
  ADMIN_NAME: string;
  ADMIN_EMAIL: string;
  ADMIN_PASSWORD: string;
  ADMIN_PHONE: string;
  ADMIN_NID: string;
  ADMIN_BIRTH: string;
}

const REQUIRED_ENV_KEYS: (keyof IENV)[] = [
  "PORT",
  "NODE_ENV",
  "MONGODB_URI",
  "FRONTEND_URL",
  "JWT_ACCESS_SECRET",
  "JWT_ACCESS_EXPIRES_AT",
  "JWT_REFRESH_SECRET",
  "JWT_REFRESH_EXPIRES_AT",
  "BCRYPT_SALT",
  "ADMIN_NAME",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",
  "ADMIN_PHONE",
  "ADMIN_NID",
  "ADMIN_BIRTH",
];

function loadEnv(): IENV {
  const env = {} as IENV;

  for (const key of REQUIRED_ENV_KEYS) {
    const value = process.env[key];
    if (!value) throw new Error(`Missing required env: ${key}`);
    env[key] = value;
  }

  return env;
}

export const env = loadEnv();
