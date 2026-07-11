import { z } from "zod";

export const intentValues = [
  "register_transaction",
  "create_budget",
  "get_financial_summary",
  "support_question",
  "greeting",
  "unknown",
] as const;

export const transactionTypeValues = [
  "expense",
  "income",
  "not_applicable",
] as const;

export const categoryValues = [
  "food",
  "transport",
  "housing",
  "health",
  "education",
  "entertainment",
  "services",
  "shopping",
  "salary",
  "other",
  "not_applicable",
] as const;

export const missingFieldValues = [
  "amount",
  "category",
  "merchant",
  "budgetAmount",
  "budgetCategory",
] as const;

export const ParsedFinancialMessageSchema = z.object({
  intent: z.enum(intentValues),

  transactionType: z.enum(transactionTypeValues),

  amount: z.number().min(0),

  currency: z.literal("USD"),

  date: z.string(),

  category: z.enum(categoryValues),

  merchant: z.string(),

  budgetAmount: z.number().min(0),

  budgetCategory: z.enum(categoryValues),

  budgetThresholdPercent: z.number().int().min(1).max(100),

  missingFields: z.array(z.enum(missingFieldValues)),

  requiresConfirmation: z.boolean(),

  isSensitive: z.boolean(),

  reply: z.string().min(1),
});

export type ParsedFinancialMessage = z.infer<
  typeof ParsedFinancialMessageSchema
>;

export const financialMessageJsonSchema = {
  type: "object",

  properties: {
    intent: {
      type: "string",
      enum: [...intentValues],
      description: "Intención principal del mensaje.",
    },

    transactionType: {
      type: "string",
      enum: [...transactionTypeValues],
      description: "Tipo de transacción detectada.",
    },

    amount: {
      type: "number",
      minimum: 0,
      description:
        "Monto de la transacción. Usar 0 cuando no sea aplicable.",
    },

    currency: {
      type: "string",
      enum: ["USD"],
      description: "Moneda de la transacción.",
    },

    date: {
      type: "string",
      description:
        "Fecha en formato YYYY-MM-DD o cadena vacía cuando no sea aplicable.",
    },

    category: {
      type: "string",
      enum: [...categoryValues],
      description: "Categoría de la transacción.",
    },

    merchant: {
      type: "string",
      description:
        "Nombre del comercio o cadena vacía cuando no se mencione.",
    },

    budgetAmount: {
      type: "number",
      minimum: 0,
      description:
        "Límite del presupuesto. Usar 0 cuando no sea aplicable.",
    },

    budgetCategory: {
      type: "string",
      enum: [...categoryValues],
      description: "Categoría del presupuesto.",
    },

    budgetThresholdPercent: {
      type: "integer",
      minimum: 1,
      maximum: 100,
      description:
        "Porcentaje que activará una alerta. Usar 80 por defecto.",
    },

    missingFields: {
      type: "array",
      items: {
        type: "string",
        enum: [...missingFieldValues],
      },
      description:
        "Datos importantes que el usuario todavía debe proporcionar.",
    },

    requiresConfirmation: {
      type: "boolean",
      description:
        "Indica si la acción necesita confirmación antes de ejecutarse.",
    },

    isSensitive: {
      type: "boolean",
      description:
        "Verdadero para fraude, reclamos, regulación o asesoría personalizada.",
    },

    reply: {
      type: "string",
      description:
        "Respuesta breve en español que se mostrará al usuario.",
    },
  },

  required: [
    "intent",
    "transactionType",
    "amount",
    "currency",
    "date",
    "category",
    "merchant",
    "budgetAmount",
    "budgetCategory",
    "budgetThresholdPercent",
    "missingFields",
    "requiresConfirmation",
    "isSensitive",
    "reply",
  ],
};