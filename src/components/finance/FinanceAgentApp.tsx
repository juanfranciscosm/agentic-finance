"use client";

import {
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  createTicket,
  getBudgets,
  getFinancialSummary,
  getRecentTransactions,
  getTickets,
  registerTransaction,
  saveBudget,
  sendChatMessage,
} from "@/lib/api/finance-api";

import type {
  BudgetStatus,
  ChatData,
  FinancialSummary,
  RecentTransaction,
  StoredTicket,
} from "@/types/finance-ui";

type MessageRole = "user" | "assistant";

type ActionState =
  | "idle"
  | "saving"
  | "completed"
  | "cancelled"
  | "error";

interface UiMessage {
  id: string;
  role: MessageRole;
  content: string;
  data?: ChatData;
  actionState?: ActionState;
}

const CATEGORY_LABELS: Record<string, string> = {
  food: "Alimentación",
  transport: "Transporte",
  housing: "Vivienda",
  health: "Salud",
  education: "Educación",
  entertainment: "Entretenimiento",
  services: "Servicios",
  shopping: "Compras",
  salary: "Salario",
  other: "Otros",
};

const PRIORITY_LABELS: Record<string, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
  urgent: "Urgente",
};

const QUICK_ACTIONS = [
  "Gasté $12 en almuerzo",
  "Ver mi situación financiera",
  "Crea un presupuesto de $150 para comida",
  "No reconozco una transferencia",
];

function createId(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category;
}

export default function FinanceAgentApp() {
  const [messages, setMessages] = useState<UiMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hola, soy Saldo AI. Puedo registrar tus gastos, crear presupuestos y ayudarte con consultas financieras.",
    },
  ]);

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const [summary, setSummary] = useState<FinancialSummary>({
    income: 0,
    expenses: 0,
    balance: 0,
  });

  const [budgets, setBudgets] = useState<BudgetStatus[]>([]);
  const [tickets, setTickets] = useState<StoredTicket[]>([]);
  const [recentTransactions, setRecentTransactions,] = useState<RecentTransaction[]>([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  
  const messagesEndRef = useRef<HTMLDivElement | null>(null);


  useEffect(() => {
    let cancelled = false;

    async function loadDashboard(): Promise<void> {
      try {
        const [
            financialSummary,
            budgetStatuses,
            supportTickets,
            transactions,
        ] = await Promise.all([
            getFinancialSummary(),
            getBudgets(),
            getTickets(),
            getRecentTransactions(),
        ]);

        if (cancelled) {
          return;
        }

        setSummary(financialSummary);
        setBudgets(budgetStatuses);
        setTickets(supportTickets);
        setRecentTransactions(transactions);
      } catch (error) {
        if (!cancelled) {
          setDashboardError(
            error instanceof Error
              ? error.message
              : "No se pudo cargar el dashboard.",
          );
        }
      } finally {
        if (!cancelled) {
          setDashboardLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, sending]);

  function appendAssistantMessage(content: string): void {
    setMessages((current) => [
      ...current,
      {
        id: createId(),
        role: "assistant",
        content,
      },
    ]);
  }

  function updateActionState(
    messageId: string,
    actionState: ActionState,
  ): void {
    setMessages((current) =>
      current.map((message) =>
        message.id === messageId
          ? {
              ...message,
              actionState,
            }
          : message,
      ),
    );
  }

  async function refreshBudgets(): Promise<void> {
    const updatedBudgets = await getBudgets();
    setBudgets(updatedBudgets);
  }

  async function handleSendMessage(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    const messageText = input.trim();

    if (!messageText || sending) {
      return;
    }

    setMessages((current) => [
      ...current,
      {
        id: createId(),
        role: "user",
        content: messageText,
      },
    ]);

    setInput("");
    setSending(true);

    try {
      const response = await sendChatMessage(messageText);

      if (response.summaryData) {
        setSummary(response.summaryData);
      }

      setMessages((current) => [
        ...current,
        {
          id: createId(),
          role: "assistant",
          content: response.reply,
          data: response,
          actionState: "idle",
        },
      ]);
    } catch (error) {
      appendAssistantMessage(
        error instanceof Error
          ? `No pude procesar el mensaje: ${error.message}`
          : "No pude procesar el mensaje.",
      );
    } finally {
      setSending(false);
    }
  }

  async function handleTransactionConfirmation(
    message: UiMessage,
  ): Promise<void> {
    const preview = message.data?.transactionPreview;

    if (!preview) {
      return;
    }

    updateActionState(message.id, "saving");

    try {
      const response = await registerTransaction(preview);

      setSummary(response.summary);
      setRecentTransactions((current) => [
        response.transaction,
        ...current.filter(
            (item) =>
            item.id !== response.transaction.id,
        ),
      ].slice(0, 8));
      await refreshBudgets();

      updateActionState(message.id, "completed");

      appendAssistantMessage(
        response.budgetAlert
          ? `${response.message} ${response.budgetAlert.message}`
          : response.message,
      );
    } catch (error) {
      updateActionState(message.id, "error");

      appendAssistantMessage(
        error instanceof Error
          ? error.message
          : "No fue posible guardar la transacción.",
      );
    }
  }

  async function handleBudgetConfirmation(
    message: UiMessage,
  ): Promise<void> {
    const preview = message.data?.budgetPreview;

    if (!preview) {
      return;
    }

    updateActionState(message.id, "saving");

    try {
      const response = await saveBudget(preview);

      await refreshBudgets();
      updateActionState(message.id, "completed");

      const statusMessage = response.status?.alertTriggered
        ? ` Actualmente has utilizado el ${response.status.percentage}% de este presupuesto.`
        : "";

      appendAssistantMessage(
        `${response.message}${statusMessage}`,
      );
    } catch (error) {
      updateActionState(message.id, "error");

      appendAssistantMessage(
        error instanceof Error
          ? error.message
          : "No fue posible guardar el presupuesto.",
      );
    }
  }

  async function handleTicketConfirmation(
    message: UiMessage,
  ): Promise<void> {
    const supportResult = message.data?.supportResult;

    if (
      !supportResult ||
      supportResult.type !== "ticket_preview"
    ) {
      return;
    }

    updateActionState(message.id, "saving");

    try {
      const response = await createTicket(
        supportResult.ticketPreview,
      );

      setTickets((current) => [
        response.ticket,
        ...current,
      ]);

      updateActionState(message.id, "completed");

      appendAssistantMessage(
        `Ticket ${response.ticket.code} creado con prioridad ${PRIORITY_LABELS[response.ticket.priority] ?? response.ticket.priority}.`,
      );
    } catch (error) {
      updateActionState(message.id, "error");

      appendAssistantMessage(
        error instanceof Error
          ? error.message
          : "No fue posible crear el ticket.",
      );
    }
  }

  function cancelAction(messageId: string): void {
    updateActionState(messageId, "cancelled");
    appendAssistantMessage("La operación fue cancelada.");
  }

  function renderAction(message: UiMessage) {
    const data = message.data;

    if (!data) {
      return null;
    }

    const disabled =
      message.actionState === "saving" ||
      message.actionState === "completed" ||
      message.actionState === "cancelled";

    if (data.transactionPreview) {
      const preview = data.transactionPreview;

      return (
        <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Confirmar transacción
          </p>

          <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <dt className="text-slate-500">Tipo</dt>
            <dd className="text-right font-medium">
              {preview.transactionType === "expense"
                ? "Gasto"
                : "Ingreso"}
            </dd>

            <dt className="text-slate-500">Monto</dt>
            <dd className="text-right font-semibold">
              {formatCurrency(preview.amount)}
            </dd>

            <dt className="text-slate-500">Categoría</dt>
            <dd className="text-right font-medium">
              {getCategoryLabel(preview.category)}
            </dd>

            <dt className="text-slate-500">Comercio</dt>
            <dd className="text-right font-medium">
              {preview.merchant || "No especificado"}
            </dd>

            <dt className="text-slate-500">Fecha</dt>
            <dd className="text-right font-medium">
              {preview.date}
            </dd>
          </dl>

          <ActionButtons
            state={message.actionState}
            disabled={disabled}
            confirmText="Confirmar"
            onConfirm={() =>
              void handleTransactionConfirmation(message)
            }
            onCancel={() => cancelAction(message.id)}
          />
        </div>
      );
    }

    if (data.budgetPreview) {
      const preview = data.budgetPreview;

      return (
        <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Confirmar presupuesto
          </p>

          <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <dt className="text-slate-500">Categoría</dt>
            <dd className="text-right font-medium">
              {getCategoryLabel(preview.category)}
            </dd>

            <dt className="text-slate-500">Límite mensual</dt>
            <dd className="text-right font-semibold">
              {formatCurrency(preview.monthlyLimit)}
            </dd>

            <dt className="text-slate-500">Umbral de alerta</dt>
            <dd className="text-right font-medium">
              {preview.thresholdPercent}%
            </dd>

            <dt className="text-slate-500">Mes</dt>
            <dd className="text-right font-medium">
              {preview.month}
            </dd>
          </dl>

          <ActionButtons
            state={message.actionState}
            disabled={disabled}
            confirmText="Crear presupuesto"
            onConfirm={() =>
              void handleBudgetConfirmation(message)
            }
            onCancel={() => cancelAction(message.id)}
          />
        </div>
      );
    }

    if (
      data.supportResult?.type === "ticket_preview"
    ) {
      const preview =
        data.supportResult.ticketPreview;

      return (
        <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-slate-900">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
            Escalamiento requerido
          </p>

          <p className="mt-2 text-sm font-medium">
            {preview.summary}
          </p>

          <div className="mt-3 flex gap-2 text-xs">
            <span className="rounded-full bg-white px-3 py-1">
              {preview.category}
            </span>

            <span className="rounded-full bg-amber-200 px-3 py-1 font-semibold text-amber-900">
              Prioridad{" "}
              {PRIORITY_LABELS[preview.priority] ??
                preview.priority}
            </span>
          </div>

          <ActionButtons
            state={message.actionState}
            disabled={disabled}
            confirmText="Crear ticket"
            onConfirm={() =>
              void handleTicketConfirmation(message)
            }
            onCancel={() => cancelAction(message.id)}
          />
        </div>
      );
    }

    return null;
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              Agente financiero con Gemini
            </p>

            <h1 className="text-3xl font-bold tracking-tight">
              Saldo AI
            </h1>

            <p className="mt-1 text-sm text-slate-600">
              Registra gastos, controla presupuestos y recibe soporte.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Sistema disponible
          </div>
        </header>

          <div className="grid items-start gap-6 lg:grid-cols-[1.45fr_1fr]">
          <section className="flex h-[75dvh] min-h-[560px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:sticky lg:top-6 lg:h-[calc(100dvh-3rem)] lg:min-h-0">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="font-semibold">
                Conversación
              </h2>

              <p className="text-sm text-slate-500">
                Describe una operación usando lenguaje natural.
              </p>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain bg-slate-50 p-4 sm:p-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={
                    message.role === "user"
                      ? "ml-auto max-w-[88%]"
                      : "mr-auto max-w-[92%]"
                  }
                >
                  <div
                    className={
                      message.role === "user"
                        ? "rounded-3xl rounded-br-md bg-blue-600 px-4 py-3 text-sm leading-relaxed text-white"
                        : "rounded-3xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-sm leading-relaxed text-slate-800 shadow-sm"
                    }
                  >
                    {message.content}
                    {renderAction(message)}
                  </div>
                </div>
              ))}

              {sending && (
                <div className="mr-auto rounded-3xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                  Saldo AI está analizando…
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="shrink-0 border-t border-slate-200 bg-white p-4">
              <div
                className={
                  messages.length > 2
                    ? "hidden"
                    : "mb-3 flex gap-2 overflow-x-auto pb-1"
                }
              >
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action}
                    type="button"
                    onClick={() => setInput(action)}
                    className="whitespace-nowrap rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-blue-300 hover:bg-blue-50"
                  >
                    {action}
                  </button>
                ))}
              </div>

              <form
                onSubmit={(event) =>
                  void handleSendMessage(event)
                }
                className="flex gap-2"
              >
                <label
                  htmlFor="financial-message"
                  className="sr-only"
                >
                  Mensaje para el agente
                </label>

                <input
                  id="financial-message"
                  value={input}
                  onChange={(event) =>
                    setInput(event.target.value)
                  }
                  disabled={sending}
                  placeholder="Ej.: Ayer gasté $25 en comida"
                  className="min-w-0 flex-1 rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                />

                <button
                  type="submit"
                  disabled={sending || !input.trim()}
                  className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  Enviar
                </button>
              </form>
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4">
                <h2 className="font-semibold">
                  Resumen financiero
                </h2>
                <p className="text-sm text-slate-500">
                  Datos registrados en Supabase.
                </p>
              </div>

              {dashboardLoading ? (
                <p className="text-sm text-slate-500">
                  Cargando información…
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                  <SummaryCard
                    label="Saldo"
                    value={summary.balance}
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

              {dashboardError && (
                <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                  {dashboardError}
                </p>
              )}
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold">
                Presupuestos
              </h2>

              <p className="mb-4 text-sm text-slate-500">
                Uso mensual por categoría.
              </p>

              <div className="space-y-4">
                {budgets.length === 0 ? (
                  <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                    Todavía no tienes presupuestos.
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
            </section>
            
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="font-semibold">
                    Transacciones recientes
                </h2>

                <p className="mb-4 text-sm text-slate-500">
                    Últimos ingresos y gastos confirmados.
                </p>

                <div className="space-y-3">
                    {recentTransactions.length === 0 ? (
                    <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                        Todavía no existen transacciones.
                    </p>
                    ) : (
                    recentTransactions.map((transaction) => (
                        <div
                        key={transaction.id}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 p-4"
                        >
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">
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
                            {formatCurrency(transaction.amount)}
                        </p>
                        </div>
                    ))
                    )}
                </div>
            </section>

        

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold">
                Tickets recientes
              </h2>

              <p className="mb-4 text-sm text-slate-500">
                Casos derivados al equipo humano.
              </p>

              <div className="space-y-3">
                {tickets.length === 0 ? (
                  <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                    No existen tickets abiertos.
                  </p>
                ) : (
                  tickets.slice(0, 5).map((ticket) => (
                    <div
                      key={ticket.id}
                      className="rounded-2xl border border-slate-200 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold">
                            {ticket.code}
                          </p>
                          <p className="mt-1 text-sm text-slate-600">
                            {ticket.summary}
                          </p>
                        </div>

                        <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">
                          {PRIORITY_LABELS[ticket.priority] ??
                            ticket.priority}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-xl font-bold">
        {formatCurrency(value)}
      </p>
    </div>
  );
}

function BudgetCard({
  budget,
}: {
  budget: BudgetStatus;
}) {
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
          `Superaste el umbral de alerta por ` +
          `${formatCurrency(amountOverThreshold)}. ` +
          `Todavía dispones de ` +
          `${formatCurrency(budget.remaining)}.`,
        className:
          "border-amber-200 bg-amber-50 text-amber-800",
      };
    }

    return {
      text:
        `Puedes gastar ${formatCurrency(amountUntilThreshold)} ` +
        `más antes de alcanzar tu alerta del ` +
        `${budget.thresholdPercent}%.`,
      className:
        "border-blue-200 bg-blue-50 text-blue-700",
    };
  }

  const budgetMessage = getBudgetMessage();

  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-medium">
            {getCategoryLabel(budget.category)}
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
                : "rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800"
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
                : "h-full rounded-full bg-blue-600"
          }
          style={{
            width: `${progress}%`,
          }}
        />
      </div>

      <div className="mt-3 flex justify-between text-xs text-slate-500">
        <span>
          {formatCurrency(budget.spent)} gastados
        </span>

        <span>
          Límite: {formatCurrency(budget.monthlyLimit)}
        </span>
      </div>

      <div className="mt-4 rounded-xl bg-slate-50 p-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            Umbral de alerta
          </span>

          <span className="text-sm font-semibold text-slate-800">
            {budget.thresholdPercent}% ·{" "}
            {formatCurrency(thresholdAmount)}
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
                : "text-sm font-semibold text-slate-800"
            }
          >
            {formatCurrency(
              Math.max(budget.remaining, 0),
            )}
          </span>
        </div>
      </div>

      <div
        className={`mt-3 rounded-xl border p-3 text-xs font-medium leading-relaxed ${budgetMessage.className}`}
      >
        {budgetMessage.text}
      </div>
    </div>
  );
}


function ActionButtons({
  state,
  disabled,
  confirmText,
  onConfirm,
  onCancel,
}: {
  state?: ActionState;
  disabled: boolean;
  confirmText: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (state === "completed") {
    return (
      <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
        Operación completada.
      </p>
    );
  }

  if (state === "cancelled") {
    return (
      <p className="mt-4 rounded-xl bg-slate-100 p-3 text-sm text-slate-600">
        Operación cancelada.
      </p>
    );
  }

  return (
    <div className="mt-4 flex justify-end gap-2">
      <button
        type="button"
        disabled={disabled}
        onClick={onCancel}
        className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
      >
        Cancelar
      </button>

      <button
        type="button"
        disabled={disabled}
        onClick={onConfirm}
        className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {state === "saving"
          ? "Guardando…"
          : confirmText}
      </button>
    </div>
  );
}