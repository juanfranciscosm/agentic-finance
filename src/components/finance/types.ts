import type {
  ChatData,
} from "@/types/finance-ui";

export type MessageRole =
  | "user"
  | "assistant";

export type ActionState =
  | "idle"
  | "saving"
  | "completed"
  | "cancelled"
  | "error";

export interface UiMessage {
  id: string;
  role: MessageRole;
  content: string;
  data?: ChatData;
  actionState?: ActionState;
}