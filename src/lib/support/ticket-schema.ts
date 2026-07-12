import { z } from "zod";

export const ConversationContextItemSchema = z.object({
  role: z.enum(["user", "assistant"]),

  content: z
    .string()
    .trim()
    .min(1)
    .max(2000),
});

export const CreateSupportTicketSchema = z.object({
  summary: z
    .string()
    .trim()
    .min(5)
    .max(200),

  category: z.enum([
    "fraud",
    "complaint",
    "regulatory",
    "account_access",
    "general",
  ]),

  priority: z.enum([
    "low",
    "medium",
    "high",
    "urgent",
  ]),

  reasonForEscalation: z
    .string()
    .trim()
    .min(5)
    .max(500),

  conversationContext: z
    .array(ConversationContextItemSchema)
    .min(1)
    .max(20),
});

export type CreateSupportTicketInput = z.infer<
  typeof CreateSupportTicketSchema
>;