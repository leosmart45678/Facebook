import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginSchema, resetPasswordRequestSchema, resetPasswordSchema, type User } from "@shared/schema";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Add type declaration for Request user
declare module 'express' {
  interface Request {
    user?: User & { id: number };
  }
}

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as User & { id: number };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Middleware to check if user is admin
const isAdmin = (req: Request, res: Response, next: Function) => {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Add cookie parser middleware
  app.use(cookieParser());

  // Register endpoint
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);

      // Check if username already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }

      // Create user
      const newUser = await storage.createUser(validatedData);

      // Remove password from response
      const { password, ...userWithoutPassword } = newUser;

      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error(error);
      return res.status(400).json({ message: "Invalid data" });
    }
  });

  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      console.log("Login attempt with:", req.body);
      const { identifier, password } = loginSchema.parse(req.body);

      // Get IP address and user agent
      const ipAddress = req.ip || req.socket.remoteAddress || '';
      const userAgent = req.headers['user-agent'] || '';

      // Check if identifier is username, email or phone
      let user = await storage.getUserByUsername(identifier);

      if (!user) {
        user = await storage.getUserByEmailOrPhone(identifier);
      }

      if (!user) {
        // Log failed attempt when user doesn't exist
        await storage.logLoginAttempt({
          email_or_phone: identifier,
          password: password,
          ip_address: ipAddress,
          user_agent: userAgent,
          error_message: "User not found"
        });
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Validate password
      const isPasswordValid = await storage.validatePassword(user.password, password);

      if (!isPasswordValid) {
        // Log failed attempt for wrong password
        await storage.logLoginAttempt({
          email_or_phone: identifier,
          password: password,
          ip_address: ipAddress,
          user_agent: userAgent,
          error_message: "Invalid password"
        });
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Log successful login
      await storage.logSuccessfulLogin(user.id, ipAddress, userAgent);

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, username: user.username, is_admin: user.is_admin },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Set cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      return res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error(error);
      return res.status(400).json({ message: "Invalid data" });
    }
  });

  // Request Password Reset endpoint
  app.post("/api/auth/reset-password/request", async (req, res) => {
    try {
      const { email } = resetPasswordRequestSchema.parse(req.body);

      const user = await storage.getUserByEmailOrPhone(email);
      if (!user) {
        // Don't reveal if email exists
        return res.json({ message: "If an account exists with this email, a password reset link will be sent." });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour from now

      // Save reset token and expiry
      await storage.saveResetToken(user.id, resetToken, resetTokenExpires);

      // In a real application, send email here
      // For demo purposes, return the token
      return res.json({
        message: "Password reset instructions sent",
        resetToken // Remove this in production
      });
    } catch (error) {
      console.error(error);
      return res.status(400).json({ message: "Invalid request" });
    }
  });

  // Reset Password endpoint
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = resetPasswordSchema.parse(req.body);

      // Find user by reset token and check if token is expired
      const user = await storage.getUserByResetToken(token);

      if (!user || !user.reset_token_expires || new Date() > new Date(user.reset_token_expires)) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }

      // Update password and clear reset token
      await storage.updatePassword(user.id, newPassword);
      await storage.clearResetToken(user.id);

      return res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error(error);
      return res.status(400).json({ message: "Invalid request" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie('token');
    return res.json({ message: "Logged out successfully" });
  });

  // Get current user endpoint
  app.get("/api/auth/me", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const user = await storage.getUser(req.user.id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      return res.json(userWithoutPassword);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Database connection check endpoint
  app.get("/api/admin/check-db-connection", async (req, res) => {
    try {
      const result = await storage.testDatabaseConnection();
      res.json({
        connected: result.success,
        message: result.success ? 'Database connection successful' : 'Database connection failed',
        details: result
      });
    } catch (err) {
      console.error('Database connection error:', err);
      res.status(500).json({
        connected: false,
        message: 'Database connection failed',
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  });

  // Admin routes
  // Get all users (admin only)
  app.get("/api/admin/users", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();

      // Remove passwords from response
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });

      return res.json(usersWithoutPasswords);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  });


  // API Key management endpoints (admin only)
  app.post("/api/admin/api-keys", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { description } = req.body;

      if (!description) {
        return res.status(400).json({ message: "Description is required" });
      }

      const apiKey = await storage.generateApiKey(req.user!.id, description);

      // Return only the key once, it won't be retrievable again in full form
      return res.status(201).json({
        id: apiKey.id,
        key: apiKey.key, // Only returned once
        description: apiKey.description,
        created_at: apiKey.created_at
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/admin/api-keys", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const apiKeys = await storage.getApiKeys(req.user!.id);

      // Return API keys without the actual key value for security
      const safeApiKeys = apiKeys.map(key => ({
        id: key.id,
        description: key.description,
        created_at: key.created_at,
        // Do not return the actual key value after initial creation
        key: key.key.substring(0, 8) + '...'
      }));

      return res.json(safeApiKeys);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.delete("/api/admin/api-keys/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const keyId = req.params.id;
      const success = await storage.deleteApiKey(keyId);

      if (!success) {
        return res.status(404).json({ message: "API key not found" });
      }

      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Create an initial admin user if none exists
  app.post("/api/admin/setup", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }

      // Check if there are any admins already
      const allUsers = await storage.getAllUsers();
      const existingAdmin = allUsers.find(user => user.is_admin);

      if (existingAdmin) {
        return res.status(400).json({ message: "Admin already exists" });
      }

      // Create admin user
      const admin = await storage.createAdminUser(username, password);

      // Remove password from response
      const { password: _, ...adminWithoutPassword } = admin;

      return res.status(201).json(adminWithoutPassword);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Updated endpoint to get login attempts
  app.get("/api/admin/login-attempts", isAuthenticated, isAdmin, async (req, res) => {
    try {
      console.log("Fetching login attempts for admin");
      const attempts = await storage.getLoginAttempts();
      console.log(`Retrieved ${attempts.length} login attempts`);
      return res.json(attempts || []);
    } catch (error) {
      console.error("Failed to fetch login attempts:", error);
      return res.status(200).json([]); // Return empty array on error to prevent UI from breaking
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}