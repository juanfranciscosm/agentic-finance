import { z } from "zod";

import { parseFinancialMessage } from "@/lib/ai/parse-financial-message";

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
    const body: unknown = await request.json();

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

    const parsedMessage = await parseFinancialMessage(
      requestResult.data.message,
    );

    return Response.json({
      ok: true,
      data: parsedMessage,
    });
  } catch (error) {
    console.error("Error en POST /api/chat:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Ocurrió un error desconocido.";

    return Response.json(
      {
        ok: false,
        error: "No fue posible procesar el mensaje.",
        details:
          process.env.NODE_ENV === "development"
            ? message
            : undefined,
      },
      {
        status: 500,
      },
    );
  }
}