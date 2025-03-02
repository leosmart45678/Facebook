
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({
  path: path.resolve(process.cwd(), '.env')
});

// Export environment variables with defaults
export const config = {
  DATABASE_URL: process.env.DATABASE_URL,
  API_KEY: process.env.API_KEY || '',
  SESSION_ID: process.env.SESSION_ID || '',
  PORT: process.env.PORT || 5000
};

// Validate required environment variables
export function validateEnv() {
  if (!config.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
}
