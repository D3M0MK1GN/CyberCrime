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
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertCyberCaseSchema = createInsertSchema(cyberCases).omit({
  id: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCyberCase = z.infer<typeof insertCyberCaseSchema>;
export type CyberCase = typeof cyberCases.$inferSelect;
