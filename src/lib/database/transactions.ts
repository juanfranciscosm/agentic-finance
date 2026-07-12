import "server-only";

import type { CreateTransactionInput } from "@/lib/finance/transaction-schema";

import {
  getDemoUserId,
  getSupabaseAdmin,
} from "@/lib/database/supabase-server";

export interface StoredTransaction {
  id: string;
  transactionType: "expense" | "income";
  amount: number;
  currency: "USD";
  date: string;
  category: string;
  merchant: string | null;
  notes: string | null;
  createdAt: string;
}

export interface FinancialSummary {
  income: number;
  expenses: number;
  balance: number;
}

interface TransactionRow {
  id: string;
  transaction_type: "expense" | "income";
  amount: number | string;
  currency: "USD";
  transaction_date: string;
  category: string;
  merchant: string | null;
  notes: string | null;
  created_at: string;
}

export async function createTransaction(
  input: CreateTransactionInput,
): Promise<StoredTransaction> {
  const supabase = getSupabaseAdmin();
  const userId = getDemoUserId();

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      user_id: userId,
      transaction_type: input.transactionType,
      amount: input.amount,
      currency: input.currency,
      transaction_date: input.date,
      category: input.category,
      merchant: input.merchant || null,
      notes: input.notes || null,
      source: "chat",
    })
    .select(
      `
        id,
        transaction_type,
        amount,
        currency,
        transaction_date,
        category,
        merchant,
        notes,
        created_at
      `,
    )
    .single<TransactionRow>();

  if (error) {
    throw new Error(
      `No fue posible guardar la transacción: ${error.message}`,
    );
  }

  return {
    id: data.id,
    transactionType: data.transaction_type,
    amount: Number(data.amount),
    currency: data.currency,
    date: data.transaction_date,
    category: data.category,
    merchant: data.merchant,
    notes: data.notes,
    createdAt: data.created_at,
  };
}

export async function getFinancialSummary(): Promise<FinancialSummary> {
  const supabase = getSupabaseAdmin();
  const userId = getDemoUserId();

  const { data, error } = await supabase
    .from("transactions")
    .select("transaction_type, amount")
    .eq("user_id", userId);

  if (error) {
    throw new Error(
      `No fue posible calcular el resumen: ${error.message}`,
    );
  }

  const summary = (data ?? []).reduce<FinancialSummary>(
    (accumulator, transaction) => {
      const amount = Number(transaction.amount);

      if (transaction.transaction_type === "income") {
        accumulator.income += amount;
      }

      if (transaction.transaction_type === "expense") {
        accumulator.expenses += amount;
      }

      accumulator.balance =
        accumulator.income - accumulator.expenses;

      return accumulator;
    },
    {
      income: 0,
      expenses: 0,
      balance: 0,
    },
  );

  return {
    income: Number(summary.income.toFixed(2)),
    expenses: Number(summary.expenses.toFixed(2)),
    balance: Number(summary.balance.toFixed(2)),
  };
}