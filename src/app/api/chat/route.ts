import { z } from "zod";

import { parseFinancialMessage } from "@/lib/ai/parse-financial-message";
import { getCurrentEcuadorMonth } from "@/lib/finance/budget-schema";
import { routeSupportMessage } from "@/lib/support/support-router";
import { getFinancialSummary } from "@/lib/database/transactions";


const ConversationTurnSchema =
  z.object({
    role: z.enum([
      "user",
      "assistant",
    ]),
    content: z
      .string()
      .trim()
      .min(1)
      .max(2000),
  });

const ChatRequestSchema =
  z.object({
    message: z
      .string()
      .trim()
      .min(1)
      .max(2000),

    history: z
      .array(
        ConversationTurnSchema,
      )
      .max(10)
      .default([]),
  });


function formatUsd(value: number): string {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

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
          error:
            "La solicitud debe contener un JSON válido.",
        },
        {
          status: 400,
        },
      );
    }

    const requestResult =
      ChatRequestSchema.safeParse(body);

    if (!requestResult.success) {
      return Response.json(
        {
          ok: false,
          error:
            "El mensaje o el historial enviado no es válido.",
          details:
            requestResult.error.issues,
        },
        {
          status: 400,
        },
      );
    }

    const {
      message: userMessage,
      history,
    } = requestResult.data;

    /*
     * Gemini interpreta el mensaje actual utilizando
     * el historial reciente de la conversación.
     */
    const parsedMessage =
      await parseFinancialMessage(
        userMessage,
        history,
      );

    /*
     * Vista previa de una transacción.
     */
    const canConfirmTransaction =
      parsedMessage.intent ===
        "register_transaction" &&
      parsedMessage.transactionType !==
        "not_applicable" &&
      parsedMessage.amount > 0 &&
      parsedMessage.category !==
        "not_applicable" &&
      parsedMessage.missingFields.length === 0;

    const transactionPreview =
      canConfirmTransaction
        ? {
            transactionType:
              parsedMessage.transactionType,
            amount:
              parsedMessage.amount,
            currency:
              parsedMessage.currency,
            date:
              parsedMessage.date,
            category:
              parsedMessage.category,
            merchant:
              parsedMessage.merchant,
            notes: "",
          }
        : null;

    /*
     * Vista previa de un presupuesto.
     */
    const missingBudgetInformation =
      parsedMessage.missingFields.includes(
        "budgetAmount",
      ) ||
      parsedMessage.missingFields.includes(
        "budgetCategory",
      );

    const canConfirmBudget =
      parsedMessage.intent ===
        "create_budget" &&
      parsedMessage.budgetAmount > 0 &&
      parsedMessage.budgetCategory !==
        "not_applicable" &&
      !missingBudgetInformation;

    const budgetPreview =
      canConfirmBudget
        ? {
            category:
              parsedMessage.budgetCategory,
            monthlyLimit:
              parsedMessage.budgetAmount,
            thresholdPercent:
              parsedMessage
                .budgetThresholdPercent,
            month:
              getCurrentEcuadorMonth(),
          }
        : null;

    /*
     * Los valores del resumen financiero se obtienen
     * de Supabase, no son generados por Gemini.
     */
    const summaryData =
      parsedMessage.intent ===
      "get_financial_summary"
        ? await getFinancialSummary()
        : null;

    /*
     * Gemini clasifica la intención, pero las respuestas
     * de soporte se obtienen de la base aprobada.
     *
     * El historial permite comprender preguntas de
     * seguimiento como: "¿Y cuánto demora?".
     */
    const shouldRouteToSupport =
      parsedMessage.intent ===
        "support_question" ||
      parsedMessage.intent ===
        "unknown";

    const supportResult =
      shouldRouteToSupport
        ? routeSupportMessage(
            userMessage,
            parsedMessage.isSensitive,
            history,
          )
        : null;

    let finalReply =
      supportResult?.reply ??
      parsedMessage.reply;

    /*
     * Se reemplaza cualquier respuesta generada por
     * Gemini con el resumen determinista de Supabase.
     */
    if (summaryData) {
      finalReply =
        `Tu resumen financiero actual es: ` +
        `ingresos ${formatUsd(
          summaryData.income,
        )}, ` +
        `gastos ${formatUsd(
          summaryData.expenses,
        )} y ` +
        `saldo ${formatUsd(
          summaryData.balance,
        )}.`;
    }

    return Response.json({
      ok: true,
      data: {
        ...parsedMessage,
        reply: finalReply,
        transactionPreview,
        budgetPreview,
        supportResult,
        summaryData,
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
        error:
          "No fue posible procesar el mensaje.",
        details:
          process.env.NODE_ENV ===
          "development"
            ? details
            : undefined,
      },
      {
        status: 500,
      },
    );
  }
}