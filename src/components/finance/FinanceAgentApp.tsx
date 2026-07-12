"use client";

import {
  type FormEvent,
  useEffect,
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
  FinancialSummary,
  RecentTransaction,
  StoredTicket,
} from "@/types/finance-ui";

import ChatPanel from "./ChatPanel";
import DashboardSidebar from "./DashboardSidebar";
import FinanceHeader from "./FinanceHeader";

import {
  PRIORITY_LABELS,
} from "./constants";

import type {
  ActionState,
  UiMessage,
} from "./types";

import {
  createId,
} from "./utils";

export default function FinanceAgentApp() {
  const [messages, setMessages] =
    useState<UiMessage[]>([
      {
        id: "welcome",
        role: "assistant",
        content:
          "Hola, soy AIROS Financial Agent. Puedo registrar tus ingresos y gastos, crear presupuestos, explicar tus alertas financieras y ayudarte con consultas de soporte.",
      },
    ]);

  const [input, setInput] =
    useState("");

  const [sending, setSending] =
    useState(false);

  const [summary, setSummary] =
    useState<FinancialSummary>({
      income: 0,
      expenses: 0,
      balance: 0,
    });

  const [budgets, setBudgets] =
    useState<BudgetStatus[]>([]);

  const [tickets, setTickets] =
    useState<StoredTicket[]>([]);

  const [
    recentTransactions,
    setRecentTransactions,
  ] = useState<RecentTransaction[]>([]);

  const [
    dashboardLoading,
    setDashboardLoading,
  ] = useState(true);

  const [
    dashboardError,
    setDashboardError,
  ] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard():
      Promise<void> {
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
        setRecentTransactions(
          transactions,
        );
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

  function appendAssistantMessage(
    content: string,
  ): void {
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

  async function refreshBudgets():
    Promise<void> {
    const updatedBudgets =
      await getBudgets();

    setBudgets(updatedBudgets);
  }

  async function handleSendMessage(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    const messageText =
      input.trim();

    if (
      !messageText ||
      sending
    ) {
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
      const response =
        await sendChatMessage(
          messageText,
        );

      if (response.summaryData) {
        setSummary(
          response.summaryData,
        );
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
    const preview =
      message.data
        ?.transactionPreview;

    if (!preview) {
      return;
    }

    updateActionState(
      message.id,
      "saving",
    );

    try {
      const response =
        await registerTransaction(
          preview,
        );

      setSummary(response.summary);

      setRecentTransactions(
        (current) =>
          [
            response.transaction,
            ...current.filter(
              (item) =>
                item.id !==
                response.transaction.id,
            ),
          ].slice(0, 8),
      );

      await refreshBudgets();

      updateActionState(
        message.id,
        "completed",
      );

      appendAssistantMessage(
        response.budgetAlert
          ? `${response.message} ${response.budgetAlert.message}`
          : response.message,
      );
    } catch (error) {
      updateActionState(
        message.id,
        "error",
      );

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
    const preview =
      message.data?.budgetPreview;

    if (!preview) {
      return;
    }

    updateActionState(
      message.id,
      "saving",
    );

    try {
      const response =
        await saveBudget(preview);

      await refreshBudgets();

      updateActionState(
        message.id,
        "completed",
      );

      const statusMessage =
        response.status
          ?.alertTriggered
          ? ` Actualmente has utilizado el ${response.status.percentage}% de este presupuesto.`
          : "";

      appendAssistantMessage(
        `${response.message}${statusMessage}`,
      );
    } catch (error) {
      updateActionState(
        message.id,
        "error",
      );

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
    const supportResult =
      message.data?.supportResult;

    if (
      !supportResult ||
      supportResult.type !==
        "ticket_preview"
    ) {
      return;
    }

    updateActionState(
      message.id,
      "saving",
    );

    try {
      const response =
        await createTicket(
          supportResult.ticketPreview,
        );

      setTickets((current) => [
        response.ticket,
        ...current,
      ]);

      updateActionState(
        message.id,
        "completed",
      );

      appendAssistantMessage(
        `Ticket ${response.ticket.code} creado con prioridad ${
          PRIORITY_LABELS[
            response.ticket.priority
          ] ??
          response.ticket.priority
        }.`,
      );
    } catch (error) {
      updateActionState(
        message.id,
        "error",
      );

      appendAssistantMessage(
        error instanceof Error
          ? error.message
          : "No fue posible crear el ticket.",
      );
    }
  }

  function cancelAction(
    messageId: string,
  ): void {
    updateActionState(
      messageId,
      "cancelled",
    );

    appendAssistantMessage(
      "La operación fue cancelada.",
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(83,197,233,0.16),transparent_32%),linear-gradient(to_bottom,#f8fbfc,#edf3f6)] px-4 py-6 text-[#2f3841] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <FinanceHeader />

        <div className="grid items-start gap-6 lg:grid-cols-[1.45fr_1fr]">
          <ChatPanel
            messages={messages}
            input={input}
            sending={sending}
            onInputChange={setInput}
            onSubmit={(event) =>
              void handleSendMessage(
                event,
              )
            }
            onConfirmTransaction={(
              message,
            ) =>
              void handleTransactionConfirmation(
                message,
              )
            }
            onConfirmBudget={(
              message,
            ) =>
              void handleBudgetConfirmation(
                message,
              )
            }
            onConfirmTicket={(
              message,
            ) =>
              void handleTicketConfirmation(
                message,
              )
            }
            onCancel={cancelAction}
          />

          <DashboardSidebar
            summary={summary}
            budgets={budgets}
            tickets={tickets}
            recentTransactions={
              recentTransactions
            }
            loading={
              dashboardLoading
            }
            error={dashboardError}
          />
        </div>
      </div>
    </main>
  );
}