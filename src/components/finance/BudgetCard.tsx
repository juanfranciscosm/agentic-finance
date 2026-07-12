import type {
  BudgetStatus,
} from "@/types/finance-ui";

import {
  formatCurrency,
  getCategoryLabel,
} from "./utils";

interface BudgetCardProps {
  budget: BudgetStatus;
}

export default function BudgetCard({
  budget,
}: BudgetCardProps) {
  const progress = Math.min(
    Math.max(budget.percentage, 0),
    100,
  );

  const thresholdAmount =
    budget.monthlyLimit *
    (budget.thresholdPercent / 100);

  const amountUntilThreshold =
    thresholdAmount - budget.spent;

  const amountOverThreshold =
    budget.spent - thresholdAmount;

  const amountOverBudget =
    budget.spent - budget.monthlyLimit;

  function getBudgetMessage(): {
    text: string;
    className: string;
  } {
    if (budget.overBudget) {
      return {
        text:
          `Has excedido este presupuesto por ` +
          `${formatCurrency(amountOverBudget)}. ` +
          `Considera reducir gastos en esta categoría.`,
        className:
          "border-red-200 bg-red-50 text-red-700",
      };
    }

    if (budget.alertTriggered) {
      return {
        text:
          `Superaste el Límite máximo por ` +
          `${formatCurrency(amountOverThreshold)}. ` +
          `Todavía dispones de ` +
          `${formatCurrency(
            Math.max(
              budget.remaining,
              0,
            ),
          )}.`,
        className:
          "border-amber-200 bg-amber-50 text-amber-800",
      };
    }

    return {
      text:
        `Puedes gastar ` +
        `${formatCurrency(
          Math.max(
            amountUntilThreshold,
            0,
          ),
        )} más antes de alcanzar tu alerta del ` +
        `${budget.thresholdPercent}%.`,
      className:
        "border-[#53c5e966] bg-[#53c5e914] text-[#2a5970]",
    };
  }

  const budgetMessage =
    getBudgetMessage();

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-[#53c5e980] hover:shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-medium text-[#2f3841]">
            {getCategoryLabel(
              budget.category,
            )}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Presupuesto mensual
          </p>
        </div>

        <span
          className={
            budget.overBudget
              ? "rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700"
              : budget.alertTriggered
                ? "rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800"
                : "rounded-full bg-[#53c5e926] px-2 py-1 text-xs font-semibold text-[#2a5970]"
          }
        >
          {budget.percentage}% utilizado
        </span>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className={
            budget.overBudget
              ? "h-full rounded-full bg-red-500"
              : budget.alertTriggered
                ? "h-full rounded-full bg-amber-500"
                : "h-full rounded-full bg-[#53c5e9]"
          }
          style={{
            width: `${progress}%`,
          }}
        />
      </div>

      <div className="mt-3 flex justify-between text-xs text-slate-500">
        <span>
          {formatCurrency(
            budget.spent,
          )}{" "}
          gastados
        </span>

        <span>
          Límite:{" "}
          {formatCurrency(
            budget.monthlyLimit,
          )}
        </span>
      </div>

      <div className="mt-4 rounded-xl bg-[#f3f7f9] p-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            Límite máximo
          </span>

          <span className="text-sm font-semibold text-[#2a5970]">
            {budget.thresholdPercent}% ·{" "}
            {formatCurrency(
              thresholdAmount,
            )}
          </span>
        </div>

        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            Disponible
          </span>

          <span
            className={
              budget.remaining < 0
                ? "text-sm font-semibold text-red-600"
                : "text-sm font-semibold text-[#2f3841]"
            }
          >
            {formatCurrency(
              Math.max(
                budget.remaining,
                0,
              ),
            )}
          </span>
        </div>
      </div>

      <div
        className={`mt-3 rounded-xl border p-3 text-xs font-medium leading-relaxed ${budgetMessage.className}`}
      >
        {budgetMessage.text}
      </div>
    </article>
  );
}