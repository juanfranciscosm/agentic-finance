import { z } from "zod";

import { parseFinancialMessage } from "@/lib/ai/parse-financial-message";
import { getCurrentEcuadorMonth } from "@/lib/finance/budget-schema";
import { routeSupportMessage } from "@/lib/support/support-router";

const ChatRequestSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "El mensaje no puede estar vacío.")
    .max(1000, "El mensaje es demasiado largo."),
});

export async function POST(
  request: Request,
): Promise<Response> {
  try {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return Response.json(
        {
          ok: false,
          error: "La solicitud debe contener un JSON válido.",
        },
        {
          status: 400,
        },
      );
    }

    const requestResult = ChatRequestSchema.safeParse(body);

    if (!requestResult.success) {
      return Response.json(
        {
          ok: false,
          error: "El mensaje enviado no es válido.",
          details: requestResult.error.issues,
        },
        {
          status: 400,
        },
      );
    }

    const userMessage = requestResult.data.message;

    const parsedMessage =
      await parseFinancialMessage(userMessage);

    // Vista previa de una transacción.
    const canConfirmTransaction =
      parsedMessage.intent === "register_transaction" &&
      parsedMessage.transactionType !== "not_applicable" &&
      parsedMessage.amount > 0 &&
      parsedMessage.category !== "not_applicable" &&
      parsedMessage.missingFields.length === 0;

    const transactionPreview = canConfirmTransaction
      ? {
          transactionType: parsedMessage.transactionType,
          amount: parsedMessage.amount,
          currency: parsedMessage.currency,
          date: parsedMessage.date,
          category: parsedMessage.category,
          merchant: parsedMessage.merchant,
          notes: "",
        }
      : null;

    // Vista previa de un presupuesto.
    const missingBudgetInformation =
      parsedMessage.missingFields.includes(
        "budgetAmount",
      ) ||
      parsedMessage.missingFields.includes(
        "budgetCategory",
      );

    const canConfirmBudget =
      parsedMessage.intent === "create_budget" &&
      parsedMessage.budgetAmount > 0 &&
      parsedMessage.budgetCategory !==
        "not_applicable" &&
      !missingBudgetInformation;

    const budgetPreview = canConfirmBudget
      ? {
          category: parsedMessage.budgetCategory,
          monthlyLimit: parsedMessage.budgetAmount,
          thresholdPercent:
            parsedMessage.budgetThresholdPercent,
          month: getCurrentEcuadorMonth(),
        }
      : null;

    // Para soporte, Gemini solo clasifica.
    // La respuesta final proviene de la base aprobada.
    const shouldRouteToSupport =
      parsedMessage.intent === "support_question" ||
      parsedMessage.intent === "unknown";

    const supportResult = shouldRouteToSupport
      ? routeSupportMessage(
          userMessage,
          parsedMessage.isSensitive,
        )
      : null;

    const finalReply =
      supportResult?.reply ??
      parsedMessage.reply;

    return Response.json({
      ok: true,
      data: {
        ...parsedMessage,
        reply: finalReply,
        transactionPreview,
        budgetPreview,
        supportResult,
      },
    });
  } catch (error) {
    console.error(
      "Error en POST /api/chat:",
      error,
    );

    const details =
      error instanceof Error
        ? error.message
        : "Ocurrió un error desconocido.";

    return Response.json(
      {
        ok: false,
        error: "No fue posible procesar el mensaje.",
        details:
          process.env.NODE_ENV === "development"
            ? details
            : undefined,
      },
      {
        status: 500,
      },
    );
  }
}