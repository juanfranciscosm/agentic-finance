export interface KnowledgeArticle {
  articleId: string;
  title: string;
  answer: string;
  keywords: string[];
}

export interface KnowledgeSearchResult
  extends KnowledgeArticle {
  matchedKeywords: string[];
}

export const APPROVED_KNOWLEDGE_BASE: KnowledgeArticle[] = [
  {
    articleId: "account-access",
    title: "Acceso a la cuenta",
    answer:
      "Para ingresar a tu cuenta, utiliza el correo registrado y tu contraseña en la pantalla de inicio de sesión. Si olvidaste tu contraseña, selecciona la opción de recuperación de contraseña. Nunca compartas tu contraseña ni códigos de verificación.",
    keywords: [
      "como ingreso a mi cuenta",
      "cómo ingreso a mi cuenta",
      "ingresar a mi cuenta",
      "ingreso a mi cuenta",
      "entrar a mi cuenta",
      "acceder a mi cuenta",
      "acceso a mi cuenta",
      "iniciar sesion",
      "inicio de sesion",
      "iniciar sesión",
      "inicio de sesión",
      "como inicio sesion",
      "cómo inicio sesión",
      "olvide mi contraseña",
      "olvidé mi contraseña",
      "recuperar contraseña",
      "cambiar contraseña",
      "restablecer contraseña",
      "no puedo iniciar sesion",
      "no puedo iniciar sesión",
    ],
  },
  {
    articleId: "required-documents",
    title: "Documentos para abrir una cuenta",
    answer:
      "Para abrir una cuenta debes presentar un documento de identidad válido y completar la información solicitada en el formulario de registro. Dependiendo del tipo de cuenta, podrían solicitarse documentos adicionales.",
    keywords: [
      "documentos para abrir una cuenta",
      "que documentos necesito",
      "qué documentos necesito",
      "requisitos para abrir una cuenta",
      "requisitos de apertura",
      "abrir una cuenta",
      "crear una cuenta",
      "papeles para abrir una cuenta",
      "cedula para abrir una cuenta",
      "cédula para abrir una cuenta",
      "pasaporte para abrir una cuenta",
    ],
  },
  {
    articleId: "deposits-withdrawals",
    title: "Depósitos y retiros",
    answer:
      "Puedes consultar los métodos disponibles de depósito y retiro desde la sección de movimientos de la plataforma. Los tiempos de procesamiento pueden depender del método utilizado.",
    keywords: [
      "como deposito dinero",
      "cómo deposito dinero",
      "hacer un deposito",
      "hacer un depósito",
      "depositar dinero",
      "como retiro dinero",
      "cómo retiro dinero",
      "retirar dinero",
      "hacer un retiro",
      "metodos de deposito",
      "métodos de depósito",
      "tiempo de retiro",
      "cuanto demora un retiro",
      "cuánto demora un retiro",
    ],
  },
  {
    articleId: "fees",
    title: "Comisiones y tarifas",
    answer:
      "Las comisiones dependen del servicio y del tipo de operación. Antes de confirmar una transferencia, revisa la tarifa mostrada por la plataforma. El agente no proporcionará valores que no estén registrados en la base de conocimiento.",
    keywords: [
      "comisiones",
      "comision",
      "tarifas",
      "tarifa",
      "costos",
      "costo",
      "costo transferencia",
      "costo de transferencia",
      "costo de una transferencia",
      "cuanto cuesta transferir",
      "cuanto cuesta una transferencia",
      "precio de una transferencia",
      "tarifa de transferencia",
      "comision de transferencia",
      "cobran por transferir",
      "cobran por una transferencia",
      "costo de retiro",
      "cuanto cuesta retirar",
      "cuota mensual",
    ],
  },
  {
    articleId: "service-hours",
    title: "Horarios de atención",
    answer:
      "Puedes consultar los horarios vigentes en la sección de contacto o soporte. Las solicitudes enviadas fuera del horario de atención serán revisadas en el siguiente periodo disponible.",
    keywords: [
      "horario de atencion",
      "horario de atención",
      "horarios de atencion",
      "horarios de atención",
      "atienden los sabados",
      "atienden los sábados",
      "atienden los domingos",
      "hora de atencion",
      "hora de atención",
      "contactar soporte",
      "servicio al cliente",
    ],
  },
  {
    articleId: "personal-data",
    title: "Datos personales y privacidad",
    answer:
      "Puedes consultar, actualizar o solicitar la revisión de tus datos personales mediante los canales de soporte autorizados. La información debe manejarse de acuerdo con la política de privacidad aplicable.",
    keywords: [
      "datos personales",
      "mis datos",
      "actualizar mis datos",
      "eliminar mis datos",
      "privacidad",
      "politica de privacidad",
      "política de privacidad",
      "como usan mis datos",
      "cómo usan mis datos",
      "proteccion de datos",
      "protección de datos",
      "informacion personal",
      "información personal",
    ],
  },
];

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[¿?¡!.,;:()"']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const STOP_WORDS = new Set([
  "a",
  "al",
  "de",
  "del",
  "el",
  "es",
  "la",
  "las",
  "los",
  "para",
  "por",
  "que",
  "un",
  "una",
  "unos",
  "unas",
  "cual",
  "cuanto",
]);

function tokenize(value: string): string[] {
  return normalizeText(value)
    .split(" ")
    .filter(
      (token) =>
        token.length > 1 &&
        !STOP_WORDS.has(token),
    );
}

function getKeywordScore(
  normalizedMessage: string,
  messageTokens: Set<string>,
  keyword: string,
): number {
  const normalizedKeyword = normalizeText(keyword);

  /*
   * Coincidencia exacta de la frase.
   */
  if (
    normalizedMessage.includes(normalizedKeyword)
  ) {
    return 100 + normalizedKeyword.length;
  }

  /*
   * Coincidencia por palabras significativas.
   *
   * "costo de transferencia" puede coincidir con
   * "cuál es el costo de una transferencia".
   */
  const keywordTokens = tokenize(keyword);

  if (keywordTokens.length === 0) {
    return 0;
  }

  const allTokensPresent = keywordTokens.every(
    (token) => messageTokens.has(token),
  );

  if (!allTokensPresent) {
    return 0;
  }

  return 50 + keywordTokens.length * 10;
}

export function searchKnowledgeBase(
  message: string,
): KnowledgeSearchResult | null {
  const normalizedMessage = normalizeText(message);

  const messageTokens = new Set(
    tokenize(message),
  );

  const results = APPROVED_KNOWLEDGE_BASE.map(
    (article) => {
      const keywordResults = article.keywords
        .map((keyword) => ({
          keyword,
          score: getKeywordScore(
            normalizedMessage,
            messageTokens,
            keyword,
          ),
        }))
        .filter((result) => result.score > 0);

      return {
        article,
        matchedKeywords: keywordResults.map(
          (result) => result.keyword,
        ),
        score: keywordResults.reduce(
          (total, result) =>
            total + result.score,
          0,
        ),
      };
    },
  )
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score);

  const bestMatch = results[0];

  if (!bestMatch) {
    return null;
  }

  return {
    ...bestMatch.article,
    matchedKeywords:
      bestMatch.matchedKeywords,
  };
}