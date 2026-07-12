import "server-only";

import { randomUUID } from "crypto";

import type {
  CreateSupportTicketInput,
} from "@/lib/support/ticket-schema";

import {
  getDemoUserId,
  getSupabaseAdmin,
} from "@/lib/database/supabase-server";

interface SupportTicketRow {
  id: string;
  code: string;
  summary: string;
  category: string;
  priority: "low" | "medium" | "high" | "urgent";
  status:
    | "open"
    | "in_progress"
    | "resolved"
    | "closed";
  reason_for_escalation: string;
  conversation_context: unknown;
  created_at: string;
  updated_at: string;
}

export interface StoredSupportTicket {
  id: string;
  code: string;
  summary: string;
  category: string;
  priority: "low" | "medium" | "high" | "urgent";
  status:
    | "open"
    | "in_progress"
    | "resolved"
    | "closed";
  reasonForEscalation: string;
  conversationContext: unknown;
  createdAt: string;
  updatedAt: string;
}

function createTicketCode(): string {
  const timestamp = Date.now()
    .toString()
    .slice(-6);

  const randomPart = randomUUID()
    .slice(0, 4)
    .toUpperCase();

  return `FIN-${timestamp}-${randomPart}`;
}

function mapTicketRow(
  row: SupportTicketRow,
): StoredSupportTicket {
  return {
    id: row.id,
    code: row.code,
    summary: row.summary,
    category: row.category,
    priority: row.priority,
    status: row.status,
    reasonForEscalation:
      row.reason_for_escalation,
    conversationContext:
      row.conversation_context,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createSupportTicket(
  input: CreateSupportTicketInput,
): Promise<StoredSupportTicket> {
  const supabase = getSupabaseAdmin();
  const userId = getDemoUserId();

  const { data, error } = await supabase
    .from("support_tickets")
    .insert({
      user_id: userId,
      code: createTicketCode(),
      summary: input.summary,
      category: input.category,
      priority: input.priority,
      status: "open",
      reason_for_escalation:
        input.reasonForEscalation,
      conversation_context:
        input.conversationContext,
    })
    .select(
      `
        id,
        code,
        summary,
        category,
        priority,
        status,
        reason_for_escalation,
        conversation_context,
        created_at,
        updated_at
      `,
    )
    .single();

  if (error) {
    throw new Error(
      `No fue posible crear el ticket: ${error.message}`,
    );
  }

  if (!data) {
    throw new Error(
      "Supabase no devolvió el ticket creado.",
    );
  }

  return mapTicketRow(
    data as SupportTicketRow,
  );
}

export async function listSupportTickets(): Promise<
  StoredSupportTicket[]
> {
  const supabase = getSupabaseAdmin();
  const userId = getDemoUserId();

  const { data, error } = await supabase
    .from("support_tickets")
    .select(
      `
        id,
        code,
        summary,
        category,
        priority,
        status,
        reason_for_escalation,
        conversation_context,
        created_at,
        updated_at
      `,
    )
    .eq("user_id", userId)
    .order("created_at", {
      ascending: false,
    })
    .limit(20);

  if (error) {
    throw new Error(
      `No fue posible consultar los tickets: ${error.message}`,
    );
  }

  return (data ?? []).map((row) =>
    mapTicketRow(row as SupportTicketRow),
  );
}