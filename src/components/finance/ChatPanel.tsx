"use client";

import {
  type FormEvent,
  useEffect,
  useRef,
} from "react";

import ChatMessage from "./ChatMessage";

import {
  QUICK_ACTIONS,
} from "./constants";

import type {
  UiMessage,
} from "./types";

interface ChatPanelProps {
  messages: UiMessage[];
  input: string;
  sending: boolean;

  onInputChange: (
    value: string,
  ) => void;

  onSubmit: (
    event: FormEvent<HTMLFormElement>,
  ) => void;

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

export default function ChatPanel({
  messages,
  input,
  sending,
  onInputChange,
  onSubmit,
  onConfirmTransaction,
  onConfirmBudget,
  onConfirmTicket,
  onCancel,
}: ChatPanelProps) {
  const messagesEndRef =
    useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, sending]);

  return (
    <section className="flex h-[75dvh] min-h-[560px] flex-col overflow-hidden rounded-3xl border border-[#2a597033] bg-white shadow-[0_18px_50px_rgba(47,56,65,0.10)] lg:sticky lg:top-6 lg:h-[calc(100dvh-3rem)] lg:min-h-0">
      <div className="shrink-0 border-b border-slate-200 bg-white px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="h-9 w-1 rounded-full bg-[#53c5e9]" />

          <div>
            <h2 className="font-semibold text-[#2f3841]">
              Chat
            </h2>

            <p className="text-sm text-slate-500">
              Describe una operación que quieras realizar.
            </p>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain bg-[#f7fafb] p-4 sm:p-6">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            onConfirmTransaction={
              onConfirmTransaction
            }
            onConfirmBudget={
              onConfirmBudget
            }
            onConfirmTicket={
              onConfirmTicket
            }
            onCancel={onCancel}
          />
        ))}

        {sending && (
          <div className="mr-auto rounded-3xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
            <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-[#53c5e9]" />
            AIROS Financial Agent está
            analizando…
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
              onClick={() =>
                onInputChange(action)
              }
              className="whitespace-nowrap rounded-full border border-[#2a597033] bg-[#53c5e914] px-3 py-2 text-xs font-medium text-[#2a5970] transition hover:border-[#53c5e9] hover:bg-[#53c5e926]"
            >
              {action}
            </button>
          ))}
        </div>

        <form
          onSubmit={onSubmit}
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
              onInputChange(
                event.target.value,
              )
            }
            disabled={sending}
            placeholder="Ej.: Ayer gasté $25 en comida"
            className="min-w-0 flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-[#2f3841] outline-none transition placeholder:text-slate-400 focus:border-[#53c5e9] focus:ring-4 focus:ring-[#53c5e933] disabled:bg-slate-100"
          />

          <button
            type="submit"
            disabled={
              sending ||
              !input.trim()
            }
            className="rounded-2xl bg-[#2a5970] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2f3841] focus:outline-none focus:ring-4 focus:ring-[#53c5e94d] disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Enviar
          </button>
        </form>
      </div>
    </section>
  );
}