import type {
  BudgetStatus,
  FinancialSummary,
  RecentTransaction,
  StoredTicket,
} from "@/types/finance-ui";

import BudgetCard from "./BudgetCard";

import {
  PRIORITY_LABELS,
} from "./constants";

import {
  formatCurrency,
  getCategoryLabel,
} from "./utils";

interface DashboardSidebarProps {
  summary: FinancialSummary;
  budgets: BudgetStatus[];
  tickets: StoredTicket[];
  recentTransactions:
    RecentTransaction[];

  loading: boolean;
  error: string;
}

function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-[#2a597026] bg-white p-5 shadow-[0_12px_35px_rgba(47,56,65,0.07)]">
      <div className="mb-4">
        <h2 className="font-semibold text-[#2f3841]">
          {title}
        </h2>

        <p className="text-sm text-slate-500">
          {description}
        </p>
      </div>

      {children}
    </section>
  );
}

function SummaryCard({
  label,
  value,
  featured = false,
}: {
  label: string;
  value: number;
  featured?: boolean;
}) {
  return (
    <div
      className={
        featured
          ? "rounded-2xl bg-[#2f3841] p-4 text-white"
          : "rounded-2xl border border-[#2a59701f] bg-[#f3f7f9] p-4 text-[#2f3841]"
      }
    >
      <p
        className={
          featured
            ? "text-xs font-medium uppercase tracking-wide text-[#53c5e9]"
            : "text-xs font-medium uppercase tracking-wide text-slate-500"
        }
      >
        {label}
      </p>

      <p className="mt-2 text-xl font-bold">
        {formatCurrency(value)}
      </p>
    </div>
  );
}

function getPriorityClass(
  priority: string,
): string {
  if (priority === "urgent") {
    return "bg-red-100 text-red-700";
  }

  if (priority === "high") {
    return "bg-amber-100 text-amber-800";
  }

  return "bg-[#53c5e926] text-[#2a5970]";
}

export default function DashboardSidebar({
  summary,
  budgets,
  tickets,
  recentTransactions,
  loading,
  error,
}: DashboardSidebarProps) {
  return (
    <aside className="space-y-6">
      <Panel
        title="Resumen financiero"
        description="Información de tu situación financiera."
      >
        {loading ? (
          <p className="text-sm text-slate-500">
            Cargando información…
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <SummaryCard
              label="Saldo"
              value={summary.balance}
              featured
            />

            <SummaryCard
              label="Ingresos"
              value={summary.income}
            />

            <SummaryCard
              label="Gastos"
              value={summary.expenses}
            />
          </div>
        )}

        {error && (
          <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}
      </Panel>

      <Panel
        title="Presupuestos"
        description="Uso mensual y límites de gasto por categoría."
      >
        <div className="space-y-4">
          {budgets.length === 0 ? (
            <p className="rounded-2xl bg-[#f3f7f9] p-4 text-sm text-slate-500">
              Todavía no tienes
              presupuestos.
            </p>
          ) : (
            budgets.map((budget) => (
              <BudgetCard
                key={budget.budgetId}
                budget={budget}
              />
            ))
          )}
        </div>
      </Panel>

      <Panel
        title="Transacciones recientes"
        description="Últimos ingresos y gastos confirmados."
      >
        <div className="space-y-3">
          {recentTransactions.length ===
          0 ? (
            <p className="rounded-2xl bg-[#f3f7f9] p-4 text-sm text-slate-500">
              Todavía no existen
              transacciones.
            </p>
          ) : (
            recentTransactions.map(
              (transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 p-4 transition hover:border-[#53c5e980]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#2f3841]">
                      {transaction.merchant ||
                        getCategoryLabel(
                          transaction.category,
                        )}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {getCategoryLabel(
                        transaction.category,
                      )}{" "}
                      · {transaction.date}
                    </p>
                  </div>

                  <p
                    className={
                      transaction.transactionType ===
                      "income"
                        ? "whitespace-nowrap text-sm font-bold text-emerald-600"
                        : "whitespace-nowrap text-sm font-bold text-red-600"
                    }
                  >
                    {transaction.transactionType ===
                    "income"
                      ? "+"
                      : "-"}
                    {formatCurrency(
                      transaction.amount,
                    )}
                  </p>
                </div>
              ),
            )
          )}
        </div>
      </Panel>

      <Panel
        title="Tickets recientes"
        description="Casos derivados al equipo humano."
      >
        <div className="space-y-3">
          {tickets.length === 0 ? (
            <p className="rounded-2xl bg-[#f3f7f9] p-4 text-sm text-slate-500">
              No existen tickets abiertos.
            </p>
          ) : (
            tickets
              .slice(0, 5)
              .map((ticket) => (
                <div
                  key={ticket.id}
                  className="rounded-2xl border border-slate-200 p-4 transition hover:border-[#53c5e980]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#2f3841]">
                        {ticket.code}
                      </p>

                      <p className="mt-1 text-sm text-slate-600">
                        {ticket.summary}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${getPriorityClass(ticket.priority)}`}
                    >
                      {PRIORITY_LABELS[
                        ticket.priority
                      ] ??
                        ticket.priority}
                    </span>
                  </div>
                </div>
              ))
          )}
        </div>
      </Panel>
      <p className="mt-2 text-xs text-slate-500">
            Prototipo demostrativo. Las tarifas, límites y políticas mostradas
            son datos ficticios y no representan una institución financiera real.
          </p>
    </aside>
  );
}