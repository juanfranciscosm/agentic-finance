export interface KnowledgeArticle {
  id: string;
  title: string;
  keywords: string[];
  answer: string;
}

export interface KnowledgeSearchResult {
  articleId: string;
  title: string;
  answer: string;
  matchedKeywords: string[];
}

export const knowledgeBase: KnowledgeArticle[] = [
  {
    id: "account-access",
    title: "Problemas de acceso a la cuenta",
    keywords: [
      "no puedo ingresar",
      "no puedo entrar",
      "olvide mi contraseña",
      "olvidé mi contraseña",
      "recuperar contraseña",
      "acceso a mi cuenta",
    ],
    answer:
      "Para recuperar el acceso, solicita el restablecimiento de contraseña desde la pantalla de inicio de sesión. Si no tienes acceso al correo registrado, el caso debe ser revisado por el equipo de soporte.",
  },
  {
    id: "required-documents",
    title: "Documentos requeridos",
    keywords: [
      "documentos",
      "requisitos",
      "abrir una cuenta",
      "crear una cuenta",
      "registro de cuenta",
    ],
    answer:
      "Para esta demostración, los documentos requeridos son una identificación vigente, comprobante de domicilio y formulario de datos del cliente. La validación definitiva debe realizarla el equipo responsable.",
  },
  {
    id: "deposits-withdrawals",
    title: "Depósitos y retiros",
    keywords: [
      "deposito",
      "depósito",
      "depositar",
      "retiro",
      "retirar",
      "transferir dinero",
    ],
    answer:
      "Los depósitos y retiros deben realizarse únicamente desde cuentas registradas a nombre del cliente. Los tiempos y validaciones pueden variar según el proceso operativo de la institución.",
  },
  {
    id: "fees",
    title: "Comisiones y costos",
    keywords: [
      "comision",
      "comisión",
      "comisiones",
      "tarifa",
      "costo",
      "costos",
    ],
    answer:
      "Las comisiones dependen del producto y de la operación solicitada. Antes de confirmar una operación, el sistema debe mostrar el costo aplicable. Para valores específicos se debe consultar el tarifario aprobado.",
  },
  {
    id: "service-hours",
    title: "Horarios de atención",
    keywords: [
      "horario",
      "horarios",
      "cuando atienden",
      "cuándo atienden",
      "atencion al cliente",
      "atención al cliente",
    ],
    answer:
      "El asistente está disponible las 24 horas. Los casos escalados son atendidos por el equipo humano durante el horario operativo configurado para esta demostración.",
  },
  {
    id: "personal-data",
    title: "Actualización de datos personales",
    keywords: [
      "actualizar datos",
      "cambiar mis datos",
      "cambiar correo",
      "cambiar telefono",
      "cambiar teléfono",
      "datos personales",
    ],
    answer:
      "La actualización de datos personales requiere validar la identidad del cliente. El asistente puede iniciar la solicitud, pero el cambio debe ser aprobado por el equipo responsable.",
  },
];

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function searchKnowledgeBase(
  query: string,
): KnowledgeSearchResult | null {
  const normalizedQuery = normalizeText(query);

  let bestResult: KnowledgeSearchResult | null = null;
  let bestScore = 0;

  for (const article of knowledgeBase) {
    const matchedKeywords = article.keywords.filter((keyword) =>
      normalizedQuery.includes(normalizeText(keyword)),
    );

    if (matchedKeywords.length > bestScore) {
      bestScore = matchedKeywords.length;

      bestResult = {
        articleId: article.id,
        title: article.title,
        answer: article.answer,
        matchedKeywords,
      };
    }
  }

  return bestScore > 0 ? bestResult : null;
}
