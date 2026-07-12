import { describe, expect, it } from "vitest";

import { searchKnowledgeBase } from "./knowledge-base";
import { routeSupportMessage } from "./support-router";

describe("support router", () => {
  it("responde una consulta conocida desde la base aprobada", () => {
    const result = routeSupportMessage(
      "¿Qué documentos necesito para abrir una cuenta?",
      false,
    );

    expect(result.type).toBe("knowledge_answer");

    if (result.type === "knowledge_answer") {
      expect(result.article.articleId).toBe(
        "required-documents",
      );
    }
  });

  it("no encuentra una respuesta inventada", () => {
    const result = searchKnowledgeBase(
      "¿Cuál será el precio del bitcoin mañana?",
    );

    expect(result).toBeNull();
  });

  it("escala una transferencia no reconocida", () => {
    const result = routeSupportMessage(
      "No reconozco una transferencia",
      true,
    );

    expect(result.type).toBe("ticket_preview");

    if (result.type === "ticket_preview") {
      expect(result.ticketPreview.category).toBe("fraud");
      expect(result.ticketPreview.priority).toBe("urgent");
    }
  });

  it("asigna prioridad alta a un reclamo", () => {
    const result = routeSupportMessage(
      "Quiero presentar un reclamo formal",
      true,
    );

    expect(result.type).toBe("ticket_preview");

    if (result.type === "ticket_preview") {
      expect(result.ticketPreview.category).toBe(
        "complaint",
      );
      expect(result.ticketPreview.priority).toBe("high");
    }
  });

  it("responde cómo ingresar a la cuenta sin crear ticket", () => {
    const result = routeSupportMessage(
      "¿Cómo ingreso a mi cuenta?",
      true,
    );

    expect(result.type).toBe("knowledge_answer");

    if (result.type === "knowledge_answer") {
      expect(result.article.articleId).toBe(
        "account-access",
      );
    }
  });

  it("responde recuperación de contraseña sin crear ticket", () => {
    const result = routeSupportMessage(
      "Olvidé mi contraseña, ¿cómo la recupero?",
      false,
    );

    expect(result.type).toBe("knowledge_answer");

    if (result.type === "knowledge_answer") {
      expect(result.article.articleId).toBe(
        "account-access",
      );
    }
  });

  it("escala un acceso no autorizado", () => {
    const result = routeSupportMessage(
      "Alguien ingresó a mi cuenta sin autorización",
      false,
    );

    expect(result.type).toBe("ticket_preview");
  });

  it("escala una cuenta hackeada aunque coincida con acceso", () => {
    const result = routeSupportMessage(
      "No puedo ingresar porque mi cuenta fue hackeada",
      false,
    );

    expect(result.type).toBe("ticket_preview");
  });

  it("escala un ingreso a la cuenta sin autorización", () => {
  const result = routeSupportMessage(
    "Alguien ingresó a mi cuenta sin autorización",
    false,
  );

  expect(result.type).toBe("ticket_preview");
});

it("escala cuando el usuario indica que no fue él", () => {
  const result = routeSupportMessage(
    "Hubo un acceso a mi cuenta y no fui yo",
    false,
  );

  expect(result.type).toBe("ticket_preview");
});

it("responde una pregunta informativa de acceso", () => {
  const result = routeSupportMessage(
    "¿Cómo ingreso a mi cuenta?",
    false,
  );

  expect(result.type).toBe("knowledge_answer");
});
it("responde el costo de una transferencia desde la base aprobada", () => {
  const result = routeSupportMessage(
    "¿Cuál es el costo de una transferencia?",
    false,
  );

  expect(result.type).toBe(
    "knowledge_answer",
  );

  if (
    result.type === "knowledge_answer"
  ) {
    expect(
      result.article.articleId,
    ).toBe("fees");
  }
});

it("clasifica un intento de hackeo como prioridad alta", () => {
  const result = routeSupportMessage(
    "Están intentando hackear mi cuenta",
    false,
  );

  expect(result.type).toBe(
    "ticket_preview",
  );

  if (result.type === "ticket_preview") {
    expect(
      result.ticketPreview.category,
    ).toBe("account_access");

    expect(
      result.ticketPreview.priority,
    ).toBe("high");
  }
});

it("clasifica una cuenta ya comprometida como urgente", () => {
  const result = routeSupportMessage(
    "Alguien ingresó a mi cuenta sin autorización",
    false,
  );

  expect(result.type).toBe(
    "ticket_preview",
  );

  if (result.type === "ticket_preview") {
    expect(
      result.ticketPreview.category,
    ).toBe("account_access");

    expect(
      result.ticketPreview.priority,
    ).toBe("urgent");
  }
});

it("mantiene como informativa una pregunta normal de acceso", () => {
  const result = routeSupportMessage(
    "¿Cómo ingreso a mi cuenta?",
    true,
  );

  expect(result.type).toBe(
    "knowledge_answer",
  );
});
});