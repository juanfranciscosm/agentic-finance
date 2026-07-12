import {
  CreateBudgetSchema,
} from "@/lib/finance/budget-schema";

import {
  createOrUpdateBudget,
  getBudgetStatus,
  listBudgetStatuses,
} from "@/lib/database/budget";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

    const validationResult =
      CreateBudgetSchema.safeParse(body);

    if (!validationResult.success) {
      return Response.json(
        {
          ok: false,
          error:
            "El presupuesto contiene información inválida.",
          details: validationResult.error.issues,
        },
        {
          status: 400,
        },
      );
    }

    const budget = await createOrUpdateBudget(
      validationResult.data,
    );

    const status = await getBudgetStatus(
      budget.category,
      validationResult.data.month,
    );

    return Response.json(
      {
        ok: true,
        message: "Presupuesto guardado correctamente.",
        budget,
        status,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "Error en POST /api/budgets:",
      error,
    );

    const details =
      error instanceof Error
        ? error.message
        : "Error desconocido.";

    return Response.json(
      {
        ok: false,
        error: "No fue posible guardar el presupuesto.",
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

export async function GET(
  request: Request,
): Promise<Response> {
  try {
    const url = new URL(request.url);
    const month =
      url.searchParams.get("month") ?? undefined;

    if (
      month !== undefined &&
      !/^\d{4}-\d{2}$/.test(month)
    ) {
      return Response.json(
        {
          ok: false,
          error:
            "El mes debe utilizar el formato YYYY-MM.",
        },
        {
          status: 400,
        },
      );
    }

    const budgets = await listBudgetStatuses(month);

    return Response.json({
      ok: true,
      budgets,
    });
  } catch (error) {
    console.error(
      "Error en GET /api/budgets:",
      error,
    );

    const details =
      error instanceof Error
        ? error.message
        : "Error desconocido.";

    return Response.json(
      {
        ok: false,
        error:
          "No fue posible consultar los presupuestos.",
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