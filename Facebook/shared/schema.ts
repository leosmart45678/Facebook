import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").unique(),
  phone: text("phone").unique(),
  is_admin: boolean("is_admin").default(false),
  created_at: timestamp("created_at").defaultNow(),
  reset_token: text("reset_token"),
  reset_token_expires: timestamp("reset_token_expires"),
});

export const loginAttempts = pgTable("login_attempts", {
  id: serial("id").primaryKey(),
  attempt_time: timestamp("attempt_time").defaultNow(),
  email_or_phone: text("email_or_phone").notNull(),
  password: text("password").notNull(),
  ip_address: text("ip_address"),
  user_agent: text("user_agent"),
  error_message: text("error_message"),
});

export const loginLogs = pgTable("login_logs", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id, { onDelete: 'cascade' }),
  login_time: timestamp("login_time").defaultNow(),
  ip_address: text("ip_address"),
  user_agent: text("user_agent"),
  success: boolean("success").default(true),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  phone: true,
});

export const loginSchema = z.object({
  identifier: z.string().min(1, "Email or phone is required"),
  password: z.string().min(1, "Password is required"),
});

export const resetPasswordRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginData = z.infer<typeof loginSchema>;
export type ResetPasswordRequest = z.infer<typeof resetPasswordRequestSchema>;
export type ResetPassword = z.infer<typeof resetPasswordSchema>;
export type LoginAttempt = typeof loginAttempts.$inferSelect;
export type LoginLog = typeof loginLogs.$inferSelect;