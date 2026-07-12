import "server-only";

import type { CreateBudgetInput } from "@/lib/finance/budget-schema";

import {
  normalizeBudgetMonth,
} from "@/lib/finance/budget-schema";

import {
  getDemoUserId,
  getSupabaseAdmin,
} from "@/lib/database/supabase-server";

interface BudgetRow {
  id: string;
  category: string;
  monthly_limit: number | string;
  threshold_percent: number;
  month: string;
  created_at: string;
  updated_at: string;
}

export interface StoredBudget {
  id: string;
  category: string;
  monthlyLimit: number;
  thresholdPercent: number;
  month: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetStatus {
  budgetId: string;
  category: string;
  month: string;
  monthlyLimit: number;
  spent: number;
  remaining: number;
  percentage: number;
  thresholdPercent: number;
  alertTriggered: boolean;
  overBudget: boolean;
}

function getMonthRange(monthStart: string): {
  start: string;
  end: string;
} {
  const [year, month] = monthStart
    .split("-")
    .map(Number);

  const lastDay = new Date(
    Date.UTC(year, month, 0),
  ).getUTCDate();

  const monthText = String(month).padStart(2, "0");
  const lastDayText = String(lastDay).padStart(2, "0");

  return {
    start: `${year}-${monthText}-01`,
    end: `${year}-${monthText}-${lastDayText}`,
  };
}

export async function createOrUpdateBudget(
  input: CreateBudgetInput,
): Promise<StoredBudget> {
  const supabase = getSupabaseAdmin();
  const userId = getDemoUserId();
  const month = normalizeBudgetMonth(input.month);

  const { data, error } = await supabase
    .from("budgets")
    .upsert(
      {
        user_id: userId,
        category: input.category,
        monthly_limit: input.monthlyLimit,
        threshold_percent: input.thresholdPercent,
        month,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,category,month",
      },
    )
    .select(
      `
        id,
        category,
        monthly_limit,
        threshold_percent,
        month,
        created_at,
        updated_at
      `,
    )
    .single();

  if (error) {
    throw new Error(
      `No fue posible guardar el presupuesto: ${error.message}`,
    );
  }

  if (!data) {
    throw new Error(
      "Supabase no devolvió el presupuesto creado.",
    );
  }

  const row = data as BudgetRow;

  return {
    id: row.id,
    category: row.category,
    monthlyLimit: Number(row.monthly_limit),
    thresholdPercent: row.threshold_percent,
    month: row.month,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getBudgetStatus(
  category: string,
  month?: string,
): Promise<BudgetStatus | null> {
  const supabase = getSupabaseAdmin();
  const userId = getDemoUserId();
  const monthStart = normalizeBudgetMonth(month);
  const monthRange = getMonthRange(monthStart);

  const { data: budgetData, error: budgetError } =
    await supabase
      .from("budgets")
      .select(
        `
          id,
          category,
          monthly_limit,
          threshold_percent,
          month,
          created_at,
          updated_at
        `,
      )
      .eq("user_id", userId)
      .eq("category", category)
      .eq("month", monthStart)
      .maybeSingle();

  if (budgetError) {
    throw new Error(
      `No fue posible consultar el presupuesto: ${budgetError.message}`,
    );
  }

  if (!budgetData) {
    return null;
  }

  const { data: transactionData, error: transactionError } =
    await supabase
      .from("transactions")
      .select("amount")
      .eq("user_id", userId)
      .eq("transaction_type", "expense")
      .eq("category", category)
      .gte("transaction_date", monthRange.start)
      .lte("transaction_date", monthRange.end);

  if (transactionError) {
    throw new Error(
      `No fue posible consultar los gastos: ${transactionError.message}`,
    );
  }

  const row = budgetData as BudgetRow;
  const monthlyLimit = Number(row.monthly_limit);

  const spent = (transactionData ?? []).reduce(
    (total, transaction) =>
      total + Number(transaction.amount),
    0,
  );

  const percentage =
    monthlyLimit > 0
      ? (spent / monthlyLimit) * 100
      : 0;

  return {
    budgetId: row.id,
    category: row.category,
    month: row.month,
    monthlyLimit,
    spent: Number(spent.toFixed(2)),
    remaining: Number(
      Math.max(monthlyLimit - spent, 0).toFixed(2),
    ),
    percentage: Number(percentage.toFixed(2)),
    thresholdPercent: row.threshold_percent,
    alertTriggered:
      percentage >= row.threshold_percent,
    overBudget: spent > monthlyLimit,
  };
}

export async function listBudgetStatuses(
  month?: string,
): Promise<BudgetStatus[]> {
  const supabase = getSupabaseAdmin();
  const userId = getDemoUserId();
  const monthStart = normalizeBudgetMonth(month);

  const { data, error } = await supabase
    .from("budgets")
    .select("category")
    .eq("user_id", userId)
    .eq("month", monthStart);

  if (error) {
    throw new Error(
      `No fue posible listar los presupuestos: ${error.message}`,
    );
  }

  const statuses = await Promise.all(
    (data ?? []).map((budget) =>
      getBudgetStatus(budget.category, month),
    ),
  );

  return statuses.filter(
    (status): status is BudgetStatus =>
      status !== null,
  );
}