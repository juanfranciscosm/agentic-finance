import {
  GEMINI_MODEL,
  getGeminiClient,
} from "@/lib/ai/gemini";

export async function GET(): Promise<Response> {
  try {
    const ai = getGeminiClient();

    const interaction = await ai.interactions.create({
      model: GEMINI_MODEL,
      input:
        "Responde únicamente con esta frase: Gemini conectado correctamente.",
      store: false,
    });

    if (!interaction.output_text) {
      throw new Error("Gemini devolvió una respuesta vacía.");
    }

    return Response.json({
      ok: true,
      model: GEMINI_MODEL,
      message: interaction.output_text,
    });
  } catch (error) {
    console.error("Error probando Gemini:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Error desconocido";

    return Response.json(
      {
        ok: false,
        error: message,
      },
      {
        status: 500,
      },
    );
  }
}