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
      title: "Acceso y recuperación de cuenta",
      answer: `Para ingresar a tu cuenta de demostración:

  1. Abre AIROS Financial Agent.
  2. Ingresa el correo electrónico registrado.
  3. Escribe tu contraseña.
  4. Presiona “Iniciar sesión”.

  Si olvidaste tu contraseña:

  1. Selecciona “Olvidé mi contraseña”.
  2. Ingresa tu correo registrado.
  3. Recibirás un código de recuperación válido durante 10 minutos.
  4. Crea una nueva contraseña de al menos 8 caracteres.

  Después de 5 intentos fallidos, el acceso se bloquea temporalmente durante 15 minutos. Nunca compartas tu contraseña ni códigos de verificación.`,
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
        "codigo de recuperacion",
        "código de recuperación",
      ],
    },
    {
      articleId: "required-documents",
      title: "Documentos para abrir una cuenta",
      answer: `Para abrir una cuenta en la demostración de AIROS Financial Agent necesitas:

  • Cédula ecuatoriana vigente o pasaporte válido.
  • Número de teléfono personal.
  • Correo electrónico activo.
  • Comprobante de domicilio emitido durante los últimos 3 meses.
  • Fotografía del rostro para validación de identidad.

  El registro normalmente tarda entre 5 y 10 minutos. La validación automática puede completarse de inmediato; si los datos no coinciden, el caso pasa a revisión manual.`,
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
        "comprobante de domicilio",
        "registrarme",
        "crear usuario",
      ],
    },
    {
      articleId: "deposits-withdrawals",
      title: "Depósitos y retiros",
      answer: `En la demostración puedes registrar depósitos mediante:

  • Transferencia bancaria.
  • Tarjeta de débito.
  • Depósito manual registrado por el usuario.

  Tiempos estimados:

  • Tarjeta de débito: acreditación inmediata.
  • Transferencia bancaria: hasta 1 día laborable.
  • Retiro a una cuenta bancaria: entre 1 y 2 días laborables.

  Condiciones de demostración:

  • Monto mínimo de retiro: $5.
  • Límite diario de retiro: $2.000.
  • El estado puede ser “pendiente”, “procesando”, “completado” o “rechazado”.

  Antes de confirmar un retiro, el sistema muestra el monto, la cuenta de destino y cualquier comisión aplicable.`,
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
        "limite de retiro",
        "límite de retiro",
        "monto minimo de retiro",
        "monto mínimo de retiro",
        "estado de retiro",
      ],
    },
    {
      articleId: "fees",
      title: "Comisiones y tarifas",
      answer: `Las tarifas ficticias utilizadas en la demostración son:

  • Apertura de cuenta: sin costo.
  • Mantenimiento mensual: sin costo.
  • Transferencias entre usuarios de AIROS: sin costo.
  • Transferencia a otra institución: $0,50.
  • Depósito con tarjeta de débito: sin costo.
  • Retiro a una cuenta bancaria: $1,00.
  • Cancelación de una operación pendiente: sin costo.

  Toda comisión debe mostrarse antes de que el usuario confirme la operación. AIROS Financial Agent no debe agregar cargos que no estén indicados en esta política.`,
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
        "mantenimiento mensual",
        "apertura de cuenta",
      ],
    },
    {
      articleId: "service-hours",
      title: "Horarios de atención",
      answer: `AIROS Financial Agent está disponible las 24 horas para:

  • Registrar ingresos y gastos.
  • Consultar el resumen financiero.
  • Crear presupuestos.
  • Revisar alertas.
  • Consultar la base de conocimiento.

  El equipo humano de soporte atiende en el siguiente horario de demostración:

  • Lunes a viernes: 08:00 a 18:00.
  • Sábados: 09:00 a 13:00.
  • Domingos y feriados: sin atención regular.

  Los incidentes de seguridad, fraude o acceso no autorizado pueden registrarse las 24 horas y reciben prioridad alta o urgente.`,
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
        "atencion 24 horas",
        "atención 24 horas",
        "feriados",
      ],
    },
    {
      articleId: "personal-data",
      title: "Datos personales y privacidad",
      answer: `Para la demostración, AIROS Financial Agent utiliza los siguientes datos:

  • Nombre e identificación.
  • Correo electrónico y teléfono.
  • Transacciones registradas.
  • Presupuestos y categorías de gasto.
  • Tickets y mensajes enviados al soporte.
  • Información técnica básica del dispositivo.

  Estos datos se utilizan para autenticar al usuario, calcular resúmenes financieros, generar alertas, prevenir fraude y conservar el contexto de soporte.

  El usuario puede solicitar:

  • Consultar sus datos.
  • Corregir información incorrecta.
  • Descargar su historial.
  • Eliminar datos que no deban conservarse.
  • Revocar permisos opcionales.

  Las credenciales, claves secretas y códigos de verificación nunca deben mostrarse en el chat.`,
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
        "descargar mis datos",
        "historial de datos",
        "borrar mi informacion",
        "borrar mi información",
      ],
    },
    {
      articleId: "account-security-guidance",
      title: "Recomendaciones para proteger la cuenta",
      answer: `Para proteger tu cuenta:

  • Utiliza una contraseña única de al menos 8 caracteres.
  • No compartas códigos de verificación.
  • Evita iniciar sesión desde dispositivos públicos.
  • Revisa periódicamente tus movimientos.
  • Cierra sesión cuando utilices un equipo compartido.
  • No abras enlaces recibidos desde remitentes desconocidos.
  • Cambia tu contraseña si recibes una alerta inesperada.

  Esta respuesta aplica únicamente a consultas preventivas. Si alguien ya ingresó a tu cuenta, existe un movimiento no reconocido o están intentando hackearla, el sistema debe crear un ticket de seguridad.`,
      keywords: [
        "como proteger mi cuenta",
        "cómo proteger mi cuenta",
        "seguridad de mi cuenta",
        "proteger mi contraseña",
        "consejos de seguridad",
        "evitar que hackeen mi cuenta",
        "mantener segura mi cuenta",
        "codigo de verificacion",
        "código de verificación",
        "contraseña segura",
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