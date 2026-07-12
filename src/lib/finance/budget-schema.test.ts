import {
  describe,
  expect,
  it,
} from "vitest";

import {
  CreateBudgetSchema,
} from "./budget-schema";

describe("CreateBudgetSchema", () => {
  it("acepta un presupuesto válido", () => {
    const result = CreateBudgetSchema.safeParse({
      category: "food",
      monthlyLimit: 150,
      thresholdPercent: 80,
      month: "2026-07",
    });

    expect(result.success).toBe(true);
  });

  it("rechaza montos negativos", () => {
    const result = CreateBudgetSchema.safeParse({
      category: "food",
      monthlyLimit: -150,
      thresholdPercent: 80,
      month: "2026-07",
    });

    expect(result.success).toBe(false);
  });

  it("rechaza umbrales mayores a 100", () => {
    const result = CreateBudgetSchema.safeParse({
      category: "food",
      monthlyLimit: 150,
      thresholdPercent: 120,
      month: "2026-07",
    });

    expect(result.success).toBe(false);
  });

  it("rechaza meses con formato incorrecto", () => {
    const result = CreateBudgetSchema.safeParse({
      category: "food",
      monthlyLimit: 150,
      thresholdPercent: 80,
      month: "julio",
    });

    expect(result.success).toBe(false);
  });
});