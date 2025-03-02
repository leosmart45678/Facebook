import { users, loginAttempts, loginLogs, type User, type InsertUser } from "@shared/schema";
import { eq, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { config } from './config';

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmailOrPhone(identifier: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  validatePassword(storedPassword: string, inputPassword: string): Promise<boolean>;
  createAdminUser(username: string, password: string): Promise<User>;
  logLoginAttempt(attempt: { 
    email_or_phone: string; 
    password: string; 
    ip_address?: string; 
    user_agent?: string;
    error_message?: string;
  }): Promise<void>;
  logSuccessfulLogin(userId: number, ipAddress?: string, userAgent?: string): Promise<void>;
  getLoginAttempts(): Promise<any[]>;
  getLoginLogs(): Promise<any[]>;
  testDatabaseConnection(): Promise<{ time: string; success: boolean }>;
}

export class DbStorage implements IStorage {
  private db;

  constructor() {
    try {
      const client = postgres(config.DATABASE_URL || '');
      this.db = drizzle(client);
    } catch (error) {
      console.error("Database configuration error:", error);
      throw error;
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async getUserByEmailOrPhone(identifier: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(
      or(
        eq(users.email, identifier),
        eq(users.phone, identifier)
      )
    );
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const result = await this.db.insert(users).values({
      ...insertUser,
      password: hashedPassword,
      is_admin: false,
      created_at: new Date(),
      reset_token: null,
      reset_token_expires: null
    }).returning();
    return result[0];
  }

  async getAllUsers(): Promise<User[]> {
    return await this.db.select().from(users);
  }

  async validatePassword(storedPassword: string, inputPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(inputPassword, storedPassword);
    } catch (error) {
      console.error("Error validating password:", error);
      return false;
    }
  }

  async createAdminUser(username: string, password: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await this.db.insert(users).values({
      username,
      password: hashedPassword,
      is_admin: true,
      created_at: new Date(),
      email: null,
      phone: null,
      reset_token: null,
      reset_token_expires: null
    }).returning();
    return result[0];
  }

  async logLoginAttempt(attempt: {
    email_or_phone: string;
    password: string;
    ip_address?: string;
    user_agent?: string;
    error_message?: string;
  }): Promise<void> {
    await this.db.insert(loginAttempts).values({
      ...attempt,
      attempt_time: new Date(),
    });
  }

  async logSuccessfulLogin(userId: number, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.db.insert(loginLogs).values({
      user_id: userId,
      login_time: new Date(),
      ip_address: ipAddress,
      user_agent: userAgent,
      success: true,
    });
  }

  async getLoginAttempts(): Promise<any[]> {
    return await this.db.select().from(loginAttempts).orderBy(loginAttempts.attempt_time);
  }

  async getLoginLogs(): Promise<any[]> {
    return await this.db.select().from(loginLogs).orderBy(loginLogs.login_time);
  }

  async testDatabaseConnection(): Promise<{ time: string; success: boolean }> {
    try {
      const result = await this.db.select({ 
        now: sql`now()` 
      }).from(users);
      return { time: result[0].now.toISOString(), success: true };
    } catch (error) {
      console.error('Database test error:', error);
      return { time: '', success: false };
    }
  }
}

// Memory storage for development/testing
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private currentId: number;
  private apiKeys: Map<string, ApiKey> = new Map();

  constructor() {
    this.users = new Map();
    this.currentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmailOrPhone(identifier: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === identifier || user.phone === identifier,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { 
      id,
      username: insertUser.username,
      password: insertUser.password,
      email: insertUser.email || null,
      phone: insertUser.phone || null,
      is_admin: false,
      created_at: new Date(),
      reset_token: null,
      reset_token_expires: null
    };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async validatePassword(storedPassword: string, inputPassword: string): Promise<boolean> {
    return storedPassword === inputPassword; // In memory storage we don't hash for simplicity
  }

  async createAdminUser(username: string, password: string): Promise<User> {
    const id = this.currentId++;
    const user: User = { 
      id,
      username,
      password,
      email: null,
      phone: null,
      is_admin: true,
      created_at: new Date(),
      reset_token: null,
      reset_token_expires: null
    };
    this.users.set(id, user);
    return user;
  }

  async generateApiKey(userId: number, description: string): Promise<ApiKey> {
    const keyString = crypto.randomBytes(32).toString('hex');
    const id = crypto.randomBytes(16).toString('hex');

    const apiKey: ApiKey = {
      id,
      userId,
      key: keyString,
      description,
      created_at: new Date()
    };

    this.apiKeys.set(id, apiKey);
    return apiKey;
  }

  async getApiKeys(userId: number): Promise<ApiKey[]> {
    return Array.from(this.apiKeys.values()).filter(key => key.userId === userId);
  }

  async deleteApiKey(keyId: string): Promise<boolean> {
    return this.apiKeys.delete(keyId);
  }
  async logLogin(userId: number, success: boolean, ip: string, userAgent: string, identifier: string): Promise<void> {
    //In memory storage, no logging
    return;
  }
  async testDatabaseConnection(): Promise<{ time: string; success: boolean }> {
    return { time: '', success: false };
  }
  async logLoginAttempt(attempt: {
    email_or_phone: string;
    password: string;
    ip_address?: string;
    user_agent?: string;
    error_message?: string;
  }): Promise<void> {
    return;
  }

  async logSuccessfulLogin(userId: number, ipAddress?: string, userAgent?: string): Promise<void> {
    return;
  }

  async getLoginAttempts(): Promise<any[]> {
    return [];
  }

  async getLoginLogs(): Promise<any[]> {
    return [];
  }
}

export interface ApiKey {
  id: string;
  userId: number;
  key: string;
  description: string;
  created_at: Date;
}

// Export only one instance of the storage
export const storage = new DbStorage();

export async function testDatabaseConnection(): Promise<any> {
  try {
    const result = await storage.testDatabaseConnection();
    return result;
  } catch (error) {
    console.error('Database connection test failed:', error);
    throw error;
  }
}

export async function getAllUsers(): Promise<any[]> {
  return await storage.getAllUsers();
}