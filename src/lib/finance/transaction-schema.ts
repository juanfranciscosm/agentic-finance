import { z } from "zod";

export const transactionCategoryValues = [
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
] as const;

export const CreateTransactionSchema = z.object({
  transactionType: z.enum(["expense", "income"]),

  amount: z
    .number()
    .refine(Number.isFinite, {
      message: "El monto debe ser un número finito.",
    })
    .positive("El monto debe ser mayor que cero.")
    .max(1_000_000, "El monto excede el límite permitido."),

  currency: z.literal("USD"),

  date: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "La fecha debe usar el formato YYYY-MM-DD.",
    ),

  category: z.enum(transactionCategoryValues),

  merchant: z
    .string()
    .trim()
    .max(120, "El nombre del comercio es demasiado largo.")
    .optional()
    .default(""),

  notes: z
    .string()
    .trim()
    .max(500, "Las notas son demasiado largas.")
    .optional()
    .default(""),
});

export type CreateTransactionInput = z.infer<
  typeof CreateTransactionSchema
>;