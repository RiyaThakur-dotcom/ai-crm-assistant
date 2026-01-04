import { z } from 'zod';
import { insertReplySchema, savedReplies } from './schema';

export const api = {
  replies: {
    list: {
      method: 'GET' as const,
      path: '/api/replies',
      responses: {
        200: z.array(z.custom<typeof savedReplies.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/replies',
      input: insertReplySchema,
      responses: {
        201: z.custom<typeof savedReplies.$inferSelect>(),
      },
    },
    generate: {
      method: 'POST' as const,
      path: '/api/generate-reply',
      input: z.object({
        message: z.string(),
        platform: z.enum(['whatsapp', 'instagram']),
      }),
      responses: {
        200: z.object({ reply: z.string() }),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
