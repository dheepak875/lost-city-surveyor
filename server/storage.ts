import { users, scores, type User, type InsertUser, type Score, type InsertScore, type LeaderboardEntry } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

interface SubmitScoreData {
  userId: string;
  finalFunds: number;
  structuresFound: number;
  actionsUsed: number;
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByGamertag(gamertag: string): Promise<User | undefined>;
  createUser(passwordHash: string, gamertag: string): Promise<User>;
  submitScore(score: SubmitScoreData): Promise<Score>;
  getLeaderboard(limit?: number): Promise<LeaderboardEntry[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByGamertag(gamertag: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.gamertag, gamertag));
    return user || undefined;
  }

  async createUser(passwordHash: string, gamertag: string): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({ passwordHash, gamertag })
      .returning();
    return user;
  }

  async submitScore(score: SubmitScoreData): Promise<Score> {
    const [newScore] = await db
      .insert(scores)
      .values(score)
      .returning();
    return newScore;
  }

  async getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
    const results = await db
      .select({
        gamertag: users.gamertag,
        finalFunds: scores.finalFunds,
        structuresFound: scores.structuresFound,
        actionsUsed: scores.actionsUsed,
        completedAt: scores.completedAt,
      })
      .from(scores)
      .innerJoin(users, eq(scores.userId, users.id))
      .orderBy(desc(scores.finalFunds), desc(scores.structuresFound))
      .limit(limit);
    
    return results;
  }
}

export const storage = new DatabaseStorage();
