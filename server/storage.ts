import {
  users,
  cyberCases,
  userSettings,
  userSessions,
  type User,
  type UpsertUser,
  type CyberCase,
  type InsertCyberCase,
  type UserSettings,
  type InsertUserSettings,
  type UserSession,
  type InsertUserSession,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, ilike, and, gte, lte, count, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: Omit<UpsertUser, 'id'>): Promise<User>;
  updateUser(id: string, user: Partial<UpsertUser>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  getAllUsers(): Promise<User[]>;
  upsertUser(user: UpsertUser): Promise<User>;

  // User session operations
  createUserSession(session: Omit<InsertUserSession, 'id'>): Promise<UserSession>;
  getUserSessions(userId: string): Promise<UserSession[]>;
  getAllActiveSessions(): Promise<(UserSession & { user: User })[]>;
  updateSessionLogout(sessionId: string): Promise<void>;

  // User settings operations
  getUserSettings(userId: string): Promise<UserSettings | undefined>;
  upsertUserSettings(userId: string, settings: Partial<InsertUserSettings>): Promise<UserSettings>;

  // Cyber case operations
  getCyberCases(params: {
    page?: number;
    limit?: number;
    search?: string;
    crimeType?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<{ cases: CyberCase[]; total: number }>;
  getCyberCase(id: string): Promise<CyberCase | undefined>;
  createCyberCase(caseData: InsertCyberCase, userId: string): Promise<CyberCase>;
  updateCyberCase(id: string, caseData: Partial<InsertCyberCase>, userId: string): Promise<CyberCase>;
  deleteCyberCase(id: string, userId: string): Promise<void>;
  getDashboardStats(userId: string): Promise<{
    totalCases: number;
    totalAmount: string;
    activeCases: number;
    resolvedCases: number;
    monthlyCases: number[];
    crimeTypeStats: { type: string; count: number }[];
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: Omit<UpsertUser, 'id'>): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUser(id: string, userData: Partial<UpsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async createUserSession(sessionData: Omit<InsertUserSession, 'id'>): Promise<UserSession> {
    const [session] = await db.insert(userSessions).values(sessionData).returning();
    return session;
  }

  async getUserSessions(userId: string): Promise<UserSession[]> {
    return await db
      .select()
      .from(userSessions)
      .where(eq(userSessions.userId, userId))
      .orderBy(desc(userSessions.loginAt));
  }

  async getAllActiveSessions(): Promise<(UserSession & { user: User })[]> {
    const sessions = await db
      .select({
        session: userSessions,
        user: users
      })
      .from(userSessions)
      .innerJoin(users, eq(userSessions.userId, users.id))
      .where(eq(userSessions.isActive, "true"))
      .orderBy(desc(userSessions.loginAt));
    
    return sessions.map(row => ({ ...row.session, user: row.user }));
  }

  async updateSessionLogout(sessionId: string): Promise<void> {
    await db
      .update(userSessions)
      .set({ 
        isActive: "false", 
        logoutAt: new Date() 
      })
      .where(eq(userSessions.sessionId, sessionId));
  }

  async getUserSettings(userId: string): Promise<UserSettings | undefined> {
    const [settings] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId));
    return settings;
  }

  async upsertUserSettings(userId: string, settingsData: Partial<InsertUserSettings>): Promise<UserSettings> {
    const [settings] = await db
      .insert(userSettings)
      .values({
        userId,
        ...settingsData,
      })
      .onConflictDoUpdate({
        target: userSettings.userId,
        set: {
          ...settingsData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return settings;
  }

  async getCyberCases(params: {
    page?: number;
    limit?: number;
    search?: string;
    crimeType?: string;
    dateFrom?: string;
    dateTo?: string;
  } = {}): Promise<{ cases: CyberCase[]; total: number }> {
    const { page = 1, limit = 10, search = "", crimeType = "", dateFrom = "", dateTo = "" } = params;
    const offset = (page - 1) * limit;

    let whereConditions = [];

    if (search) {
      whereConditions.push(
        sql`(${cyberCases.expedientNumber} ILIKE ${`%${search}%`} OR ${cyberCases.crimeType} ILIKE ${`%${search}%`} OR ${cyberCases.victim} ILIKE ${`%${search}%`})`
      );
    }

    if (crimeType) {
      whereConditions.push(eq(cyberCases.crimeType, crimeType));
    }

    if (dateFrom) {
      whereConditions.push(gte(cyberCases.caseDate, dateFrom));
    }

    if (dateTo) {
      whereConditions.push(lte(cyberCases.caseDate, dateTo));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const [cases, totalResult] = await Promise.all([
      db
        .select()
        .from(cyberCases)
        .where(whereClause)
        .orderBy(desc(cyberCases.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: count() })
        .from(cyberCases)
        .where(whereClause),
    ]);

    return {
      cases,
      total: totalResult[0].count,
    };
  }

  async getCyberCase(id: string): Promise<CyberCase | undefined> {
    const [cyberCase] = await db
      .select()
      .from(cyberCases)
      .where(eq(cyberCases.id, id));
    return cyberCase;
  }

  async createCyberCase(caseData: InsertCyberCase, userId: string): Promise<CyberCase> {
    const [cyberCase] = await db
      .insert(cyberCases)
      .values({
        ...caseData,
        createdBy: userId,
      })
      .returning();
    return cyberCase;
  }

  async updateCyberCase(
    id: string,
    caseData: Partial<InsertCyberCase>,
    userId: string
  ): Promise<CyberCase> {
    const [cyberCase] = await db
      .update(cyberCases)
      .set({
        ...caseData,
        updatedAt: new Date(),
      })
      .where(eq(cyberCases.id, id))
      .returning();
    return cyberCase;
  }

  async deleteCyberCase(id: string, userId: string): Promise<void> {
    await db.delete(cyberCases).where(eq(cyberCases.id, id));
  }

  async getDashboardStats(userId: string): Promise<{
    totalCases: number;
    totalAmount: string;
    activeCases: number;
    resolvedCases: number;
    monthlyCases: number[];
    crimeTypeStats: { type: string; count: number }[];
  }> {
    // Get total cases and amount
    const [totalStats] = await db
      .select({
        totalCases: count(),
        totalAmount: sql<string>`COALESCE(SUM(${cyberCases.stolenAmount}), 0)`,
      })
      .from(cyberCases);

    // Get active cases (pending, in process)
    const [activeStats] = await db
      .select({ count: count() })
      .from(cyberCases)
      .where(
        sql`${cyberCases.investigationStatus} IN ('Pendiente', 'En proceso')`
      );

    // Get resolved cases
    const [resolvedStats] = await db
      .select({ count: count() })
      .from(cyberCases)
      .where(eq(cyberCases.investigationStatus, "Completado"));

    // Get monthly cases for the current year
    const monthlyCases = await db
      .select({
        month: sql<number>`EXTRACT(MONTH FROM ${cyberCases.caseDate})`,
        count: count(),
      })
      .from(cyberCases)
      .where(sql`EXTRACT(YEAR FROM ${cyberCases.caseDate}) = EXTRACT(YEAR FROM CURRENT_DATE)`)
      .groupBy(sql`EXTRACT(MONTH FROM ${cyberCases.caseDate})`)
      .orderBy(sql`EXTRACT(MONTH FROM ${cyberCases.caseDate})`);

    // Get crime type statistics
    const crimeTypeStats = await db
      .select({
        type: cyberCases.crimeType,
        count: count(),
      })
      .from(cyberCases)
      .groupBy(cyberCases.crimeType)
      .orderBy(desc(count()));

    // Fill monthly data for all 12 months
    const monthlyData = Array(12).fill(0);
    monthlyCases.forEach((item) => {
      monthlyData[item.month - 1] = item.count;
    });

    return {
      totalCases: totalStats.totalCases,
      totalAmount: totalStats.totalAmount,
      activeCases: activeStats.count,
      resolvedCases: resolvedStats.count,
      monthlyCases: monthlyData,
      crimeTypeStats,
    };
  }
}

export const storage = new DatabaseStorage();
