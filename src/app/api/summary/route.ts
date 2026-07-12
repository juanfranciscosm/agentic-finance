import { getFinancialSummary } from "@/lib/database/transactions";

export async function GET(): Promise<Response> {
  try {
    const summary = await getFinancialSummary();

    return Response.json({
      ok: true,
      summary,
    });
  } catch (error) {
    console.error(
      "Error en GET /api/summary:",
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
          "No fue posible obtener el resumen financiero.",
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