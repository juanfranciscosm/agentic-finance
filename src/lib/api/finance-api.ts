import type {
  BudgetPreview,
  BudgetResponse,
  BudgetStatus,
  ChatData,
  FinancialSummary,
  RecentTransaction,
  StoredTicket,
  TicketPreview,
  TicketResponse,
  TransactionPreview,
  TransactionResponse,
} from "@/types/finance-ui";

interface ApiErrorBody {
  error?: string;
  details?: unknown;
}

async function apiRequest<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    cache: "no-store",
  });

  const body = (await response.json().catch(() => null)) as
    | ApiErrorBody
    | T
    | null;

  if (!response.ok) {
    const errorBody = body as ApiErrorBody | null;

    throw new Error(
      errorBody?.error ??
        `La solicitud falló con código ${response.status}.`,
    );
  }

  if (!body) {
    throw new Error("El servidor devolvió una respuesta vacía.");
  }

  return body as T;
}

export async function sendChatMessage(
  message: string,
): Promise<ChatData> {
  const response = await apiRequest<{
    ok: true;
    data: ChatData;
  }>("/api/chat", {
    method: "POST",
    body: JSON.stringify({ message }),
  });

  return response.data;
}

export async function registerTransaction(
  transaction: TransactionPreview,
): Promise<TransactionResponse> {
  return apiRequest<TransactionResponse>(
    "/api/transactions",
    {
      method: "POST",
      body: JSON.stringify(transaction),
    },
  );
}

export async function getFinancialSummary(): Promise<FinancialSummary> {
  const response = await apiRequest<{
    ok: true;
    summary: FinancialSummary;
  }>("/api/summary");

  return response.summary;
}

export async function saveBudget(
  budget: BudgetPreview,
): Promise<BudgetResponse> {
  return apiRequest<BudgetResponse>("/api/budgets", {
    method: "POST",
    body: JSON.stringify(budget),
  });
}

export async function getBudgets(): Promise<BudgetStatus[]> {
  const response = await apiRequest<{
    ok: true;
    budgets: BudgetStatus[];
  }>("/api/budgets");

  return response.budgets;
}

export async function createTicket(
  ticket: TicketPreview,
): Promise<TicketResponse> {
  return apiRequest<TicketResponse>("/api/tickets", {
    method: "POST",
    body: JSON.stringify(ticket),
  });
}

export async function getTickets(): Promise<StoredTicket[]> {
  const response = await apiRequest<{
    ok: true;
    tickets: StoredTicket[];
  }>("/api/tickets");

  return response.tickets;
}

export async function getRecentTransactions(
  limit = 8,
): Promise<RecentTransaction[]> {
  const response = await apiRequest<{
    ok: true;
    transactions: RecentTransaction[];
  }>(`/api/transactions?limit=${limit}`);

  return response.transactions;
}


