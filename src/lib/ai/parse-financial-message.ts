import {
  financialMessageJsonSchema,
  ParsedFinancialMessageSchema,
  type ParsedFinancialMessage,
} from "@/lib/ai/schemas";

import {
  GEMINI_MODEL,
  getGeminiClient,
} from "@/lib/ai/gemini";

function getCurrentEcuadorDate(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Guayaquil",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export async function parseFinancialMessage(
  message: string,
): Promise<ParsedFinancialMessage> {
  const ai = getGeminiClient();
  const currentDate = getCurrentEcuadorDate();

  const interaction = await ai.interactions.create({
    model: GEMINI_MODEL,

    system_instruction: `
Eres la capa de comprensión de un agente de finanzas personales para Ecuador.

Tu función es interpretar el mensaje del usuario. Todavía no debes ejecutar,
guardar ni afirmar que una operación fue realizada.

Fecha actual en Ecuador: ${currentDate}.

REGLAS GENERALES:
- Responde siempre en español.
- La moneda predeterminada es USD.
- No inventes montos, comercios, categorías o datos bancarios.
- Usa textos breves y fáciles de entender.
- Cuando un campo no sea aplicable, usa 0, cadena vacía o "not_applicable",
  según corresponda.
- budgetThresholdPercent debe ser 80 si el usuario no indica otro umbral.

TRANSACCIONES:
- Detecta gastos e ingresos.
- Resuelve expresiones como "hoy", "ayer" y "el viernes".
- Si el usuario no indica fecha, usa ${currentDate}.
- Una transacción siempre requiere confirmación antes de guardarse.
- Si falta monto o categoría, inclúyelo en missingFields.
- Si no menciona comercio, incluye merchant en missingFields.
- No afirmes que el gasto o ingreso ya fue registrado.

PRESUPUESTOS:
- Detecta solicitudes como "pon un presupuesto de 150 para comida".
- Un presupuesto siempre requiere confirmación antes de guardarse.
- Si falta monto o categoría, inclúyelo en missingFields.
- No afirmes que el presupuesto ya fue creado.

SOPORTE SENSIBLE:
- Marca isSensitive=true para:
  fraude,
  movimientos no reconocidos,
  bloqueo de cuenta,
  reclamos,
  solicitudes regulatorias,
  o recomendaciones personalizadas de inversión.
- No prometas que una transferencia fue cancelada, bloqueada o investigada.
- Indica que el caso debe escalarse a una persona.

RESPUESTA:
- reply debe pedir los datos faltantes cuando missingFields no esté vacío.
- reply debe pedir confirmación cuando la información esté completa.
`,

    input: message,

    response_format: {
      type: "text",
      mime_type: "application/json",
      schema: financialMessageJsonSchema,
    },

    store: false,
  });

  if (!interaction.output_text) {
    throw new Error("Gemini devolvió una respuesta vacía.");
  }

  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(interaction.output_text);
  } catch {
    throw new Error("Gemini devolvió un JSON inválido.");
  }

  return ParsedFinancialMessageSchema.parse(parsedJson);
}