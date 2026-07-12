export interface FinancialSummary {
  income: number;
  expenses: number;
  balance: number;
}

export interface TransactionPreview {
  transactionType: "expense" | "income";
  amount: number;
  currency: "USD";
  date: string;
  category: string;
  merchant: string;
  notes: string;
}

export interface BudgetPreview {
  category: string;
  monthlyLimit: number;
  thresholdPercent: number;
  month: string;
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

export interface TicketPreview {
  summary: string;
  category:
    | "fraud"
    | "complaint"
    | "regulatory"
    | "account_access"
    | "general";

  priority:
    | "low"
    | "medium"
    | "high"
    | "urgent";

  reasonForEscalation: string;

  conversationContext: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
}

export interface StoredTicket {
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

export type SupportResult =
  | {
      type: "knowledge_answer";
      reply: string;
      article: {
        articleId: string;
        title: string;
        answer: string;
        matchedKeywords: string[];
      };
    }
  | {
      type: "ticket_preview";
      reply: string;
      ticketPreview: TicketPreview;
    };

export interface ChatData {
  intent: string;
  reply: string;
  isSensitive: boolean;
  requiresConfirmation: boolean;
  transactionPreview: TransactionPreview | null;
  budgetPreview: BudgetPreview | null;
  supportResult: SupportResult | null;
}

export interface BudgetAlert {
  type: "threshold_reached" | "budget_exceeded";
  message: string;
}

export interface TransactionResponse {
  ok: true;
  message: string;
  transaction: {
    id: string;
    transactionType: "expense" | "income";
    amount: number;
    currency: "USD";
    date: string;
    category: string;
    merchant: string | null;
    notes: string | null;
    createdAt: string;
  };
  summary: FinancialSummary;
  budgetStatus: BudgetStatus | null;
  budgetAlert: BudgetAlert | null;
}

export interface BudgetResponse {
  ok: true;
  message: string;
  budget: {
    id: string;
    category: string;
    monthlyLimit: number;
    thresholdPercent: number;
    month: string;
  };
  status: BudgetStatus | null;
}

export interface TicketResponse {
  ok: true;
  message: string;
  ticket: StoredTicket;
}