import {
  users,
  cyberCases,
  type User,
  type UpsertUser,
  type CyberCase,
  type InsertCyberCase,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, ilike, and, gte, lte, count, sql } from "drizzle-orm";

export interface IStorage {
  // User operations for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

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
