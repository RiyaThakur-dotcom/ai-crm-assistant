import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const savedReplies = pgTable("saved_replies", {
  id: serial("id").primaryKey(),
  originalMessage: text("original_message").notNull(),
  generatedReply: text("generated_reply").notNull(),
  platform: text("platform").notNull(), // 'whatsapp' | 'instagram'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertReplySchema = createInsertSchema(savedReplies).omit({ id: true, createdAt: true });

export type Reply = typeof savedReplies.$inferSelect;
export type InsertReply = z.infer<typeof insertReplySchema>;

export type GenerateReplyRequest = {
  message: string;
  platform: 'whatsapp' | 'instagram';
};

// Export blueprint models
export * from "./models/chat";
