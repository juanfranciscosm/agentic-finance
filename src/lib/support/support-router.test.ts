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
});