import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  decimal,
  date,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username").unique().notNull(),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  role: varchar("role").notNull().default("user"), // admin, user, investigator
  isActive: varchar("is_active").notNull().default("true"),
  profileImageUrl: varchar("profile_image_url"),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User sessions tracking table
export const userSessions = pgTable("user_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sessionId: varchar("session_id").notNull(),
  ipAddress: varchar("ip_address").notNull(),
  userAgent: text("user_agent"),
  deviceInfo: text("device_info"),
  browser: varchar("browser"),
  os: varchar("os"),
  location: varchar("location"),
  loginAt: timestamp("login_at").defaultNow(),
  logoutAt: timestamp("logout_at"),
  isActive: varchar("is_active").notNull().default("true"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Cyber crime cases table
export const cyberCases = pgTable("cyber_cases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  caseDate: date("case_date").notNull(),
  expedientNumber: varchar("expedient_number").notNull().unique(),
  crimeType: varchar("crime_type").notNull(),
  senderAccountData: text("sender_account_data").notNull(),
  victim: varchar("victim").notNull(),
  receiverAccountData: text("receiver_account_data").notNull(),
  receiverAccountResearch: text("receiver_account_research"),
  investigationStatus: varchar("investigation_status").notNull().default("Pendiente"),
  stolenAmount: decimal("stolen_amount", { precision: 15, scale: 2 }).notNull(),
  observations: text("observations"),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User settings table for personalization
export const userSettings = pgTable("user_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  primaryColor: varchar("primary_color").notNull().default("green"),
  transparency: varchar("transparency").notNull().default("85"),
  neonEffects: varchar("neon_effects").notNull().default("false"),
  fontSize: varchar("font_size").notNull().default("14"),
  animations: varchar("animations").notNull().default("false"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = typeof userSessions.$inferInsert;
export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = typeof userSettings.$inferInsert;

// Form schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
});

export const insertUserSessionSchema = createInsertSchema(userSessions).omit({
  id: true,
  createdAt: true,
});

export const insertCyberCaseSchema = createInsertSchema(cyberCases).omit({
  id: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCyberCase = z.infer<typeof insertCyberCaseSchema>;
export type CyberCase = typeof cyberCases.$inferSelect;
