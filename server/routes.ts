import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerImageRoutes } from "./replit_integrations/image";
import OpenAI from "openai";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Register integration routes
  registerChatRoutes(app);
  registerImageRoutes(app);

  const openai = new OpenAI({
    apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  });

  app.get(api.replies.list.path, async (req, res) => {
    const replies = await storage.getReplies();
    res.json(replies);
  });

  app.post(api.replies.create.path, async (req, res) => {
    try {
      const input = api.replies.create.input.parse(req.body);
      const reply = await storage.createReply(input);
      res.status(201).json(reply);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.post(api.replies.generate.path, async (req, res) => {
    try {
      const { message, platform } = api.replies.generate.input.parse(req.body);

      const systemPrompt = `You are an AI CRM assistant replying to customers on ${platform}.
Read the customer message carefully and reply in a casual, friendly, human-like tone.
Do not sound robotic or too salesy.

Guidelines:
- Keep the reply short (1–2 lines)
- Use simple English
- Use emojis only if natural (max 1)
- Ask a question if more details are needed
- If customer asks for price, ask about their requirement first
- If customer shows interest, guide them to next step

Generate only the reply text. Do not add explanations.`;

      const response = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        max_completion_tokens: 150,
      });

      const reply = response.choices[0]?.message?.content?.trim() || "Could not generate reply.";
      res.json({ reply });
    } catch (error) {
      console.error("Error generating reply:", error);
      res.status(500).json({ message: "Failed to generate reply" });
    }
  });

  // Seed data
  const existing = await storage.getReplies();
  if (existing.length === 0) {
    await storage.createReply({
      originalMessage: "How much is the premium plan?",
      generatedReply: "Hi! Thanks for asking. Could you tell me more about your team size so I can suggest the best plan for you? 😊",
      platform: "whatsapp",
    });
    await storage.createReply({
      originalMessage: "I love your product!",
      generatedReply: "Thanks so much! We're thrilled to hear that. Let us know if there's anything else we can do for you! 💜",
      platform: "instagram",
    });
  }

  return httpServer;
}
