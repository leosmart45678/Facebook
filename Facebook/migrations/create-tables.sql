
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reset_token TEXT,
  reset_token_expires TIMESTAMP
);

-- Create API keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create login logs table
CREATE TABLE IF NOT EXISTS login_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN DEFAULT TRUE
);

-- Recreate login attempts table with proper structure
DROP TABLE IF EXISTS login_attempts;
CREATE TABLE login_attempts (
  id SERIAL PRIMARY KEY,
  attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  email_or_phone TEXT NOT NULL,
  password TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  error_message TEXT
);

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_login_attempts_time ON login_attempts(attempt_time DESC);
