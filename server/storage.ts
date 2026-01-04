import { savedReplies, type InsertReply, type Reply } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getReplies(): Promise<Reply[]>;
  createReply(reply: InsertReply): Promise<Reply>;
}

export class DatabaseStorage implements IStorage {
  async getReplies(): Promise<Reply[]> {
    return await db.select().from(savedReplies).orderBy(desc(savedReplies.createdAt));
  }

  async createReply(insertReply: InsertReply): Promise<Reply> {
    const [reply] = await db.insert(savedReplies).values(insertReply).returning();
    return reply;
  }
}

export const storage = new DatabaseStorage();
