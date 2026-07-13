import {
  financialMessageJsonSchema,
  ParsedFinancialMessageSchema,
  type ParsedFinancialMessage,
} from "@/lib/ai/schemas";

import type {
  ConversationTurn,
} from "@/types/finance-ui";

import {
  GEMINI_FALLBACK_MODEL,
  GEMINI_MODEL,
  getGeminiClient,
} from "@/lib/ai/gemini";

/**
 * Caché temporal en memoria.
 *
 * Evita consumir nuevamente la API cuando se repite exactamente
 * el mismo mensaje mientras el servidor permanece encendido.
 */
const interpretationCache = new Map<
  string,
  ParsedFinancialMessage
>();

function buildConversationContext(
    history: ConversationTurn[],
  ): string {
    const recentHistory =
      history.slice(-10);

    if (recentHistory.length === 0) {
      return "No hay mensajes anteriores.";
    }

    return recentHistory
      .map((turn) => {
        const speaker =
          turn.role === "user"
            ? "Usuario"
            : "Asistente";

        return `${speaker}: ${turn.content}`;
      })
      .join("\n");
}

function getCurrentEcuadorDate(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Guayaquil",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function normalizeCacheKey(message: string): string {
  return message
    .trim()
    .toLocaleLowerCase("es");
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

function isQuotaError(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase();

  return (
    message.includes("429") ||
    message.includes("resource_exhausted") ||
    message.includes("quota") ||
    message.includes("rate limit") ||
    message.includes("too many requests")
  );
}

function parseGeminiJson(outputText: string): unknown {
  try {
    return JSON.parse(outputText);
  } catch {
    throw new Error(
      "Gemini devolvió una respuesta que no contiene un JSON válido.",
    );
  }
}

export async function parseFinancialMessage(
  message: string,
  history: ConversationTurn[] = [],
): Promise<ParsedFinancialMessage> {
  const cleanMessage = message.trim();

  const recentHistory =
    history.slice(-10);

  const conversationContext =
    buildConversationContext(
      recentHistory,
    );

  if (!cleanMessage) {
    throw new Error("El mensaje no puede estar vacío.");
  }

  const cacheKey =
  normalizeCacheKey(
    [
      conversationContext,
      `Mensaje actual: ${cleanMessage}`,
    ].join("\n"),
  );
  const cachedResult = interpretationCache.get(cacheKey);

  if (cachedResult) {
    return cachedResult;
  }

  const ai = getGeminiClient();
  const currentDate = getCurrentEcuadorDate();

  async function requestInterpretation(model: string) {
    return ai.interactions.create({
      model,

      system_instruction: `
Eres la capa de comprensión de un agente de finanzas personales para Ecuador.

Tu trabajo es interpretar el mensaje del usuario y devolver únicamente
información estructurada. No debes guardar datos, ejecutar operaciones ni
afirmar que una acción ya fue realizada.

Fecha actual en Ecuador: ${currentDate}.

REGLAS GENERALES:
- Responde siempre en español.
- La moneda predeterminada es USD.
- No inventes montos, fechas, comercios, categorías ni datos bancarios.
- Usa respuestas breves, claras y fáciles de entender.
- Para campos no aplicables usa:
  - 0 para montos.
  - cadena vacía para textos y fechas.
  - "not_applicable" para categorías o tipos.
- budgetThresholdPercent debe ser 80 cuando el usuario no indique otro valor.

TRANSACCIONES:
- Detecta gastos e ingresos.
- Expresiones como "gasté", "pagué", "compré" o "me cobraron"
  normalmente representan gastos.
- Expresiones como "me pagaron", "recibí", "cobré", "gané",
  "salario" o "venta" normalmente representan ingresos.
- Resuelve fechas relativas como "hoy", "ayer" y "el viernes".
- Si el usuario no indica fecha para una transacción, usa ${currentDate}.
- Toda transacción válida requiere confirmación antes de guardarse.
- Si falta monto, agrega "amount" a missingFields.
- Si falta categoría, agrega "category" a missingFields.
- Si no se menciona un comercio o contraparte, usa merchant vacío.
- No afirmes que la transacción ya fue registrada.

CATEGORÍAS:
- food: alimentos, restaurantes, almuerzo, cena, supermercado.
- transport: taxi, bus, Uber, gasolina, transporte.
- housing: alquiler, hipoteca, vivienda.
- health: medicina, hospital, farmacia, salud.
- education: cursos, universidad, libros, estudios.
- entertainment: cine, juegos, entretenimiento.
- services: luz, agua, internet, teléfono y servicios.
- shopping: ropa, muebles, artículos y compras generales.
- salary: salario, sueldo o nómina.
- other: cualquier transacción que no encaje en las anteriores.

PRESUPUESTOS:
- Detecta solicitudes como:
  "Crea un presupuesto mensual de 150 dólares para comida".
- Todo presupuesto requiere confirmación antes de guardarse.
- Si falta el monto, agrega "budgetAmount" a missingFields.
- Si falta la categoría, agrega "budgetCategory" a missingFields.
- No afirmes que el presupuesto ya fue creado.

RESUMEN FINANCIERO:
- Mensajes como "¿cuánto he gastado?", "ver mi saldo" o
  "muéstrame mi situación financiera" corresponden a
  get_financial_summary.
- No inventes valores del resumen. El código consultará la base de datos.

USO DEL HISTORIAL:
- Utiliza el historial únicamente para interpretar referencias y completar solicitudes pendientes.
- El mensaje actual es la instrucción principal.
- Si el usuario responde con información breve como "comida", "$100", "ayer" o "al 75%", completa la operación pendiente más reciente.
- No recuperes datos de una operación que ya fue confirmada, completada o cancelada.
- No mezcles dos transacciones o presupuestos diferentes.
- No inventes datos que no aparezcan en el mensaje actual o en el historial.
- Si existe ambigüedad entre varias operaciones anteriores, solicita aclaración.

SOPORTE Y CONSULTAS SENSIBLES:
- Marca isSensitive=true cuando el mensaje trate sobre:
  - fraude;
  - transferencias u operaciones no reconocidas;
  - robo o acceso no autorizado;
  - bloqueo de cuenta;
  - reclamos o denuncias;
  - solicitudes regulatorias;
  - recomendaciones personalizadas de inversión.
- Para estas consultas usa intent="support_question".
- No afirmes que una operación fue bloqueada, cancelada, investigada
  o reembolsada.
- Indica solamente que el caso requiere revisión humana.
- Las respuestas definitivas de soporte provendrán de una base de
  conocimiento aprobada, no de tu conocimiento general.
- NO marques isSensitive=true para preguntas informativas como:
  - cómo ingresar a una cuenta;
  - cómo iniciar sesión;
  - cómo recuperar una contraseña;
  - qué documentos se necesitan;
  - cuáles son los horarios;
  - cuáles son las comisiones;
  - cómo realizar un depósito o retiro.
- Una pregunta sobre acceso solo es sensible cuando menciona fraude,
  hackeo, suplantación, acceso no autorizado, robo o bloqueo.

RESPUESTA:
- reply debe pedir los datos faltantes cuando missingFields tenga elementos.
- reply debe pedir confirmación cuando una transacción o presupuesto esté
  completo.
- No uses markdown dentro de reply.
`,

      input: `
        HISTORIAL RECIENTE:
        ${conversationContext}

        MENSAJE ACTUAL DEL USUARIO:
        ${cleanMessage}
        `,

      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: financialMessageJsonSchema,
      },

      generation_config: {
        temperature: 0.1,
      },

      store: false,
    });
  }

  let interaction;

  try {
    interaction = await requestInterpretation(
      GEMINI_MODEL,
    );
  } catch (error) {
    const canUseFallback =
      isQuotaError(error) &&
      Boolean(GEMINI_FALLBACK_MODEL) &&
      GEMINI_FALLBACK_MODEL !== GEMINI_MODEL;

    if (!canUseFallback) {
      throw error;
    }

    console.warn(
      `Cuota agotada para ${GEMINI_MODEL}. ` +
        `Intentando con ${GEMINI_FALLBACK_MODEL}.`,
    );

    interaction = await requestInterpretation(
      GEMINI_FALLBACK_MODEL,
    );
  }

  if (!interaction.output_text) {
    throw new Error(
      "Gemini devolvió una respuesta vacía.",
    );
  }

  const parsedJson = parseGeminiJson(
    interaction.output_text,
  );

  const validationResult =
    ParsedFinancialMessageSchema.safeParse(parsedJson);

  if (!validationResult.success) {
    console.error(
      "Respuesta estructurada inválida de Gemini:",
      validationResult.error.issues,
    );

    throw new Error(
      "Gemini devolvió datos que no cumplen el formato financiero esperado.",
    );
  }

  interpretationCache.set(
    cacheKey,
    validationResult.data,
  );

  return ParsedFinancialMessageSchema.parse(parsedJson);
}