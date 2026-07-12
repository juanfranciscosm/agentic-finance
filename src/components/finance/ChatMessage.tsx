import ActionButtons from "./ActionButtons";

import {
  PRIORITY_LABELS,
} from "./constants";

import type {
  UiMessage,
} from "./types";

import {
  formatCurrency,
  getCategoryLabel,
} from "./utils";

interface ChatMessageProps {
  message: UiMessage;

  onConfirmTransaction: (
    message: UiMessage,
  ) => void;

  onConfirmBudget: (
    message: UiMessage,
  ) => void;

  onConfirmTicket: (
    message: UiMessage,
  ) => void;

  onCancel: (
    messageId: string,
  ) => void;
}

export default function ChatMessage({
  message,
  onConfirmTransaction,
  onConfirmBudget,
  onConfirmTicket,
  onCancel,
}: ChatMessageProps) {
  const data = message.data;

  const disabled =
    message.actionState === "saving" ||
    message.actionState === "completed" ||
    message.actionState === "cancelled";

  function renderAction() {
    if (!data) {
      return null;
    }

    if (data.transactionPreview) {
      const preview =
        data.transactionPreview;

      return (
        <div className="mt-3 rounded-2xl border border-[#53c5e966] bg-white p-4 text-[#2f3841] shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2a5970]">
            Confirmar transacción
          </p>

          <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <dt className="text-slate-500">
              Tipo
            </dt>
            <dd className="text-right font-medium">
              {preview.transactionType ===
              "expense"
                ? "Gasto"
                : "Ingreso"}
            </dd>

            <dt className="text-slate-500">
              Monto
            </dt>
            <dd className="text-right font-semibold text-[#2a5970]">
              {formatCurrency(
                preview.amount,
              )}
            </dd>

            <dt className="text-slate-500">
              Categoría
            </dt>
            <dd className="text-right font-medium">
              {getCategoryLabel(
                preview.category,
              )}
            </dd>

            <dt className="text-slate-500">
              Comercio
            </dt>
            <dd className="text-right font-medium">
              {preview.merchant ||
                "No especificado"}
            </dd>

            <dt className="text-slate-500">
              Fecha
            </dt>
            <dd className="text-right font-medium">
              {preview.date}
            </dd>
          </dl>

          <ActionButtons
            state={message.actionState}
            disabled={disabled}
            confirmText="Confirmar"
            onConfirm={() =>
              onConfirmTransaction(message)
            }
            onCancel={() =>
              onCancel(message.id)
            }
          />
        </div>
      );
    }

    if (data.budgetPreview) {
      const preview =
        data.budgetPreview;

      return (
        <div className="mt-3 rounded-2xl border border-[#53c5e966] bg-white p-4 text-[#2f3841] shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2a5970]">
            Confirmar presupuesto
          </p>

          <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <dt className="text-slate-500">
              Categoría
            </dt>
            <dd className="text-right font-medium">
              {getCategoryLabel(
                preview.category,
              )}
            </dd>

            <dt className="text-slate-500">
              Límite mensual
            </dt>
            <dd className="text-right font-semibold text-[#2a5970]">
              {formatCurrency(
                preview.monthlyLimit,
              )}
            </dd>

            <dt className="text-slate-500">
              Límite máximo
            </dt>
            <dd className="text-right font-medium">
              {preview.thresholdPercent}%
            </dd>

            <dt className="text-slate-500">
              Mes
            </dt>
            <dd className="text-right font-medium">
              {preview.month}
            </dd>
          </dl>

          <ActionButtons
            state={message.actionState}
            disabled={disabled}
            confirmText="Crear presupuesto"
            onConfirm={() =>
              onConfirmBudget(message)
            }
            onCancel={() =>
              onCancel(message.id)
            }
          />
        </div>
      );
    }

    if (
      data.supportResult?.type ===
      "ticket_preview"
    ) {
      const preview =
        data.supportResult.ticketPreview;

      return (
        <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-[#2f3841]">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-700">
            Escalamiento requerido
          </p>

          <p className="mt-2 text-sm font-medium">
            {preview.summary}
          </p>

          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-white px-3 py-1">
              {preview.category}
            </span>

            <span className="rounded-full bg-amber-200 px-3 py-1 font-semibold text-amber-900">
              Prioridad{" "}
              {PRIORITY_LABELS[
                preview.priority
              ] ?? preview.priority}
            </span>
          </div>

          <ActionButtons
            state={message.actionState}
            disabled={disabled}
            confirmText="Crear ticket"
            onConfirm={() =>
              onConfirmTicket(message)
            }
            onCancel={() =>
              onCancel(message.id)
            }
          />
        </div>
      );
    }

    return null;
  }

  return (
    <div
      className={
        message.role === "user"
          ? "ml-auto max-w-[88%]"
          : "mr-auto max-w-[92%]"
      }
    >
      <div
        className={
          message.role === "user"
            ? "rounded-3xl rounded-br-md bg-[#2a5970] px-4 py-3 text-sm leading-relaxed text-white shadow-sm"
            : "rounded-3xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-sm leading-relaxed text-[#2f3841] shadow-sm"
        }
      >
        {message.content}
        {renderAction()}
      </div>
    </div>
  );
}