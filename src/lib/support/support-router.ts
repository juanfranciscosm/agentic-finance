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

function includesAny(
  normalizedMessage: string,
  expressions: string[],
): boolean {
  return expressions.some((expression) =>
    normalizedMessage.includes(
      normalizeText(expression),
    ),
  );
}

function isExplicitlySensitive(
  message: string,
): boolean {
  const normalized = normalizeText(message);

  const sensitiveExpressions = [
    "no reconozco",
    "no reconocido",
    "no reconocida",
    "cargo desconocido",
    "movimiento desconocido",
    "transferencia desconocida",

    "fraude",
    "fraudulento",
    "fraudulenta",

    "me hackearon",
    "cuenta hackeada",
    "cuenta comprometida",

    "acceso no autorizado",
    "sin autorizacion",
    "sin mi autorizacion",
    "sin permiso",
    "sin mi permiso",
    "no fui yo",

    "entraron a mi cuenta",
    "ingresaron a mi cuenta",

    "robo de cuenta",
    "suplantacion",
    "filtracion de datos",

    "denuncia formal",
    "reclamo formal",
    "cuenta bloqueada",
    "actividad sospechosa",
  ];

  /*
   * Detecta palabras como:
   * hack, hacker, hackear, hackeo,
   * hackeada, hackearon, hackeando.
   */
  const mentionsHack =
    normalized.includes("hack");

  const containsSensitiveExpression =
    includesAny(
      normalized,
      sensitiveExpressions,
    );

  const mentionsAccountAccess =
    normalized.includes("cuenta") &&
    (
      normalized.includes("ingreso") ||
      normalized.includes("ingresaron") ||
      normalized.includes("entraron") ||
      normalized.includes("acceso")
    );

  const mentionsLackOfAuthorization =
    normalized.includes("sin autorizacion") ||
    normalized.includes("sin mi autorizacion") ||
    normalized.includes("sin permiso") ||
    normalized.includes("sin mi permiso") ||
    normalized.includes("no fui yo");

  return (
    mentionsHack ||
    containsSensitiveExpression ||
    (
      mentionsAccountAccess &&
      mentionsLackOfAuthorization
    )
  );
}

function detectTicketPriority(
  message: string,
): TicketPriority {
  const normalized = normalizeText(message);

  /*
   * Casos donde el acceso o fraude ya ocurrió.
   * Requieren atención inmediata.
   */
  const confirmedCompromiseExpressions = [
    "me hackearon",
    "hackearon mi cuenta",
    "cuenta hackeada",
    "cuenta comprometida",

    "entraron a mi cuenta",
    "ingresaron a mi cuenta",
    "alguien ingreso a mi cuenta",
    "alguien entro a mi cuenta",

    "acceso no autorizado",
    "sin autorizacion",
    "sin mi autorizacion",
    "sin permiso",
    "sin mi permiso",
    "no fui yo",

    "robo de cuenta",
    "robaron mi cuenta",
    "suplantaron mi identidad",

    "no reconozco",
    "cargo desconocido",
    "movimiento desconocido",
    "transferencia desconocida",
  ];

  const confirmedCompromise = includesAny(
    normalized,
    confirmedCompromiseExpressions,
  );

  /*
   * Regla adicional para detectar distintas formas
   * de describir un acceso ya realizado.
   */
  const mentionsCompletedAccess =
    normalized.includes("cuenta") &&
    (
      normalized.includes("ingreso") ||
      normalized.includes("ingresaron") ||
      normalized.includes("entro") ||
      normalized.includes("entraron") ||
      normalized.includes("acceso")
    );

  const mentionsNoAuthorization =
    normalized.includes("sin autorizacion") ||
    normalized.includes("sin mi autorizacion") ||
    normalized.includes("sin permiso") ||
    normalized.includes("sin mi permiso") ||
    normalized.includes("no fui yo");

  if (
    confirmedCompromise ||
    (
      mentionsCompletedAccess &&
      mentionsNoAuthorization
    )
  ) {
    return "urgent";
  }

  /*
   * Casos donde existe una amenaza o intento,
   * pero no está confirmado que el atacante haya entrado.
   */
  const attemptedCompromiseExpressions = [
    "intentando hackear",
    "intento de hackeo",
    "intento de acceso",
    "quieren hackear",
    "tratan de hackear",
    "estan hackeando",
    "actividad sospechosa",
    "posible fraude",
  ];

  if (
    includesAny(
      normalized,
      attemptedCompromiseExpressions,
    ) ||
    normalized.includes("hack")
  ) {
    return "high";
  }

  const highPriorityExpressions = [
    "cuenta bloqueada",
    "denuncia formal",
    "reclamo formal",
    "filtracion de datos",
  ];

  if (
    includesAny(
      normalized,
      highPriorityExpressions,
    )
  ) {
    return "high";
  }

  const mediumPriorityExpressions = [
    "reclamo",
    "queja",
    "problema con mi cuenta",
    "no puedo ingresar",
    "no puedo acceder",
  ];

  if (
    includesAny(
      normalized,
      mediumPriorityExpressions,
    )
  ) {
    return "medium";
  }

  return "medium";
}

function detectTicketCategory(
  message: string,
): TicketCategory {
  const normalized = normalizeText(message);

  const accountSecurityExpressions = [
    "hack",
    "acceso no autorizado",
    "sin autorizacion",
    "sin mi autorizacion",
    "sin mi permiso",
    "entraron a mi cuenta",
    "ingresaron a mi cuenta",
    "cuenta comprometida",
    "cuenta bloqueada",
    "actividad sospechosa",
  ];

  if (
    includesAny(
      normalized,
      accountSecurityExpressions,
    )
  ) {
    return "account_access";
  }

  const fraudExpressions = [
    "no reconozco",
    "no reconocido",
    "no reconocida",
    "cargo desconocido",
    "movimiento desconocido",
    "transferencia desconocida",
    "fraude",
    "fraudulento",
    "robo",
    "suplantacion",
  ];

  if (
    includesAny(
      normalized,
      fraudExpressions,
    )
  ) {
    return "fraud";
  }

  if (
    includesAny(normalized, [
      "reclamo",
      "queja",
    ])
  ) {
    return "complaint";
  }

  if (
    includesAny(normalized, [
      "regulator",
      "denuncia",
    ])
  ) {
    return "regulatory";
  }

  if (
    includesAny(normalized, [
      "acceso",
      "contrasena",
      "inicio de sesion",
      "bloqueo",
    ])
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

  const explicitlySensitive =
    isExplicitlySensitive(message);

  /*
  * Una respuesta aprobada tiene prioridad sobre un posible
  * falso positivo de Gemini, siempre que el texto no contenga
  * señales explícitas de fraude o riesgo.
  */
  if (article && !explicitlySensitive) {
    return {
      type: "knowledge_answer",
      article,
      reply: article.answer,
    };
  }

  const requiresHumanReview =
    explicitlySensitive || isSensitive;

  const priority = detectTicketPriority(message);
  const category = detectTicketCategory(message);

  const reply = requiresHumanReview
    ? "Esta solicitud requiere revisión humana. Puedo crear un ticket con el contexto de la conversación."
    : "No encontré una respuesta aprobada para esta consulta. Puedo escalarla al equipo de soporte.";

  return {
    type: "ticket_preview",
    reply,
    ticketPreview: {
      summary: buildSummary(message),
      category,
      priority,
      reasonForEscalation: requiresHumanReview
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