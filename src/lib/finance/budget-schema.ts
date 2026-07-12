import { z } from "zod";

export const budgetCategoryValues = [
  "food",
  "transport",
  "housing",
  "health",
  "education",
  "entertainment",
  "services",
  "shopping",
  "other",
] as const;

export const CreateBudgetSchema = z.object({
  category: z.enum(budgetCategoryValues),

  monthlyLimit: z
    .number()
    .refine(Number.isFinite, {
      message: "El presupuesto debe ser un número finito.",
    })
    .positive("El presupuesto debe ser mayor que cero.")
    .max(
      1_000_000,
      "El presupuesto excede el límite permitido.",
    ),

  thresholdPercent: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(80),

  month: z
    .string()
    .regex(
      /^\d{4}-\d{2}$/,
      "El mes debe usar el formato YYYY-MM.",
    )
    .optional(),
});

export type CreateBudgetInput = z.infer<
  typeof CreateBudgetSchema
>;

export function getCurrentEcuadorMonth(): string {
  const currentDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Guayaquil",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  return currentDate.slice(0, 7);
}

export function normalizeBudgetMonth(
  month?: string,
): string {
  return `${month ?? getCurrentEcuadorMonth()}-01`;
}