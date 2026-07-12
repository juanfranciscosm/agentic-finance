import {
  createSupportTicket,
  listSupportTickets,
} from "@/lib/database/support-tickets";

import {
  CreateSupportTicketSchema,
} from "@/lib/support/ticket-schema";

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
          error:
            "La solicitud debe contener un JSON válido.",
        },
        {
          status: 400,
        },
      );
    }

    const validationResult =
      CreateSupportTicketSchema.safeParse(body);

    if (!validationResult.success) {
      return Response.json(
        {
          ok: false,
          error:
            "El ticket contiene información inválida.",
          details:
            validationResult.error.issues,
        },
        {
          status: 400,
        },
      );
    }

    const ticket = await createSupportTicket(
      validationResult.data,
    );

    return Response.json(
      {
        ok: true,
        message:
          "Ticket creado correctamente.",
        ticket,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "Error en POST /api/tickets:",
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
          "No fue posible crear el ticket.",
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

export async function GET(): Promise<Response> {
  try {
    const tickets = await listSupportTickets();

    return Response.json({
      ok: true,
      tickets,
    });
  } catch (error) {
    console.error(
      "Error en GET /api/tickets:",
      error,
    );

    return Response.json(
      {
        ok: false,
        error:
          "No fue posible consultar los tickets.",
      },
      {
        status: 500,
      },
    );
  }
}