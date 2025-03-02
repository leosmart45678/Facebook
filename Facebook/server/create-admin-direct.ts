import bcrypt from "bcryptjs";
import { Client } from 'pg';

// This script bypasses the API and creates an admin user directly in the database
export async function createAdminDirect() {
  try {
    console.log("Attempting to create admin user directly in the database...");

    // Connect to the database
    const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_vXo0KYr7sEfH@ep-wispy-heart-a5yp3ggd.us-east-2.aws.neon.tech/neondb?sslmode=require';
    console.log("Using connection string:", connectionString);

    const client = new Client({
      connectionString,
      ssl: {
        rejectUnauthorized: false
      }
    });

    try {
      await client.connect();
      console.log("Connected to PostgreSQL database");

      // Admin credentials
      const adminUsername = 'SMART';
      const adminPassword = '09163666961';

      console.log("Using admin credentials:", {
        username: adminUsername,
        password: "********" // Don't log actual password
      });

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);

      // First check if users table exists, if not, create it
      const tableCheckQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'users'
        );
      `;

      const tableCheckResult = await client.query(tableCheckQuery);

      if (!tableCheckResult.rows[0].exists) {
        console.log("Users table doesn't exist, creating it...");

        // Create the users table
        await client.query(`
          CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE,
            phone VARCHAR(255) UNIQUE,
            is_admin BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            reset_token VARCHAR(255),
            reset_token_expires TIMESTAMP WITH TIME ZONE
          );
        `);

        // Create login_logs table
        await client.query(`
          CREATE TABLE IF NOT EXISTS login_logs (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            login_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            success BOOLEAN NOT NULL,
            ip_address VARCHAR(255),
            user_agent TEXT
          );
        `);

        console.log("Database tables created successfully!");
      }

      // Try to insert the admin user, if it already exists, update it
      const result = await client.query(`
        INSERT INTO users (username, password, is_admin)
        VALUES ($1, $2, TRUE)
        ON CONFLICT (username) 
        DO UPDATE SET 
          password = $2,
          is_admin = TRUE
        RETURNING id, username, is_admin;
      `, [adminUsername, hashedPassword]);

      console.log("Admin user creation result:", result.rows[0]);

      // Check if the user was created
      const checkUserResult = await client.query(
        `SELECT id, username, is_admin FROM users WHERE username = $1`,
        [adminUsername]
      );

      if (checkUserResult.rows && checkUserResult.rows.length > 0) {
        console.log("User in database:", checkUserResult.rows[0]);
        console.log("Admin user created/updated successfully!");
      } else {
        console.log("Failed to find user after creation!");
      }

      // Add a sample user for testing if needed
      await client.query(`
        INSERT INTO users (username, password, email, phone, is_admin)
        VALUES ('testuser', $1, 'test@example.com', '1234567890', FALSE)
        ON CONFLICT (username) DO NOTHING;
      `, [await bcrypt.hash('password123', salt)]);

      console.log("Sample test user added");

    } finally {
      await client.end();
      console.log("Database connection closed");
    }

  } catch (error) {
    console.error("Error creating admin user:", error);
  }
}