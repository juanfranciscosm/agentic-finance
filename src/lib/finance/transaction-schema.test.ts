import { describe, expect, it } from "vitest";

import { CreateTransactionSchema } from "./transaction-schema";

describe("CreateTransactionSchema", () => {
  it("acepta una transacción válida", () => {
    const result = CreateTransactionSchema.safeParse({
      transactionType: "expense",
      amount: 25,
      currency: "USD",
      date: "2026-07-10",
      category: "food",
      merchant: "Sweet & Coffee",
      notes: "",
    });

    expect(result.success).toBe(true);
  });

  it("rechaza un monto negativo", () => {
    const result = CreateTransactionSchema.safeParse({
      transactionType: "expense",
      amount: -25,
      currency: "USD",
      date: "2026-07-10",
      category: "food",
      merchant: "Sweet & Coffee",
      notes: "",
    });

    expect(result.success).toBe(false);
  });

  it("rechaza un monto igual a cero", () => {
    const result = CreateTransactionSchema.safeParse({
      transactionType: "expense",
      amount: 0,
      currency: "USD",
      date: "2026-07-10",
      category: "food",
      merchant: "Sweet & Coffee",
      notes: "",
    });

    expect(result.success).toBe(false);
  });

  it("rechaza una moneda diferente de USD", () => {
    const result = CreateTransactionSchema.safeParse({
      transactionType: "expense",
      amount: 25,
      currency: "EUR",
      date: "2026-07-10",
      category: "food",
      merchant: "Sweet & Coffee",
      notes: "",
    });

    expect(result.success).toBe(false);
  });

  it("rechaza una categoría desconocida", () => {
    const result = CreateTransactionSchema.safeParse({
      transactionType: "expense",
      amount: 25,
      currency: "USD",
      date: "2026-07-10",
      category: "cryptocurrency",
      merchant: "Prueba",
      notes: "",
    });

    expect(result.success).toBe(false);
  });

  it("rechaza una fecha con formato incorrecto", () => {
    const result = CreateTransactionSchema.safeParse({
      transactionType: "expense",
      amount: 25,
      currency: "USD",
      date: "10-07-2026",
      category: "food",
      merchant: "Prueba",
      notes: "",
    });

    expect(result.success).toBe(false);
  });
});