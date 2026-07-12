import {
  searchKnowledgeBase,
  type KnowledgeSearchResult,
} from "./knowledge-base";

export type TicketPriority =
  | "low"
  | "medium"
  | "high"
  | "urgent";

export type TicketCategory =
  | "fraud"
  | "complaint"
  | "regulatory"
  | "account_access"
  | "general";

export interface ConversationContextItem {
  role: "user" | "assistant";
  content: string;
}

export interface KnowledgeSupportResult {
  type: "knowledge_answer";
  article: KnowledgeSearchResult;
  reply: string;
}

export interface TicketSupportResult {
  type: "ticket_preview";
  reply: string;
  ticketPreview: {
    summary: string;
    category: TicketCategory;
    priority: TicketPriority;
    reasonForEscalation: string;
    conversationContext: ConversationContextItem[];
  };
}

export type SupportResult =
  | KnowledgeSupportResult
  | TicketSupportResult;

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function detectTicketPriority(
  message: string,
): TicketPriority {
  const normalized = normalizeText(message);

  if (
    normalized.includes("no reconozco") ||
    normalized.includes("fraude") ||
    normalized.includes("robo") ||
    normalized.includes("hackearon") ||
    normalized.includes("hackeada")
  ) {
    return "urgent";
  }

  if (
    normalized.includes("reclamo") ||
    normalized.includes("denuncia") ||
    normalized.includes("regulator") ||
    normalized.includes("bloqueo")
  ) {
    return "high";
  }

  return "medium";
}

function detectTicketCategory(
  message: string,
): TicketCategory {
  const normalized = normalizeText(message);

  if (
    normalized.includes("no reconozco") ||
    normalized.includes("fraude") ||
    normalized.includes("robo")
  ) {
    return "fraud";
  }

  if (
    normalized.includes("reclamo") ||
    normalized.includes("queja")
  ) {
    return "complaint";
  }

  if (
    normalized.includes("regulator") ||
    normalized.includes("denuncia")
  ) {
    return "regulatory";
  }

  if (
    normalized.includes("acceso") ||
    normalized.includes("contrasena") ||
    normalized.includes("bloqueo")
  ) {
    return "account_access";
  }

  return "general";
}

function buildSummary(message: string): string {
  const cleanMessage = message.trim();

  if (cleanMessage.length <= 120) {
    return cleanMessage;
  }

  return `${cleanMessage.slice(0, 117)}...`;
}

export function routeSupportMessage(
  message: string,
  isSensitive: boolean,
): SupportResult {
  const article = searchKnowledgeBase(message);

  if (!isSensitive && article) {
    return {
      type: "knowledge_answer",
      article,
      reply: article.answer,
    };
  }

  const priority = detectTicketPriority(message);
  const category = detectTicketCategory(message);

  const reply = isSensitive
    ? "Esta solicitud requiere revisión humana. Puedo crear un ticket con el contexto de la conversación."
    : "No encontré una respuesta aprobada para esta consulta. Puedo escalarla al equipo de soporte.";

  return {
    type: "ticket_preview",
    reply,
    ticketPreview: {
      summary: buildSummary(message),
      category,
      priority,
      reasonForEscalation: isSensitive
        ? "Consulta sensible que requiere revisión humana."
        : "No existe una respuesta aprobada en la base de conocimiento.",
      conversationContext: [
        {
          role: "user",
          content: message,
        },
        {
          role: "assistant",
          content: reply,
        },
      ],
    },
  };
}