import { CreateTransactionSchema } from "@/lib/finance/transaction-schema";

import {
  getBudgetStatus,
} from "@/lib/database/budget";

import {
  createTransaction,
  getFinancialSummary,
} from "@/lib/database/transactions";

export async function POST(
  request: Request,
): Promise<Response> {
  try {
    const body: unknown = await request.json();

    const validationResult =
      CreateTransactionSchema.safeParse(body);

    if (!validationResult.success) {
      return Response.json(
        {
          ok: false,
          error:
            "La transacción contiene información inválida.",
          details: validationResult.error.issues,
        },
        {
          status: 400,
        },
      );
    }

    const transaction = await createTransaction(
      validationResult.data,
    );

    const summary = await getFinancialSummary();

    const budgetStatus =
        transaction.transactionType === "expense"
            ? await getBudgetStatus(
                transaction.category,
                transaction.date.slice(0, 7),
            )
        : null;

    const budgetAlert =
        budgetStatus?.alertTriggered
            ? {
                type: budgetStatus.overBudget
                    ? "budget_exceeded"
                    : "threshold_reached",

                message: budgetStatus.overBudget
                    ? `Superaste tu presupuesto de ${budgetStatus.category}. Has gastado $${budgetStatus.spent} de $${budgetStatus.monthlyLimit}.`
                    : `Has utilizado el ${budgetStatus.percentage}% de tu presupuesto de ${budgetStatus.category}.`,
            }
        : null;

    return Response.json(
      {
        ok: true,
        message: "Transacción registrada correctamente.",
        transaction,
        summary,
        budgetStatus,
        budgetAlert,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "Error en POST /api/transactions:",
      error,
    );

    const details =
      error instanceof Error
        ? error.message
        : "Error desconocido.";

    return Response.json(
      {
        ok: false,
        error: "No fue posible registrar la transacción.",
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