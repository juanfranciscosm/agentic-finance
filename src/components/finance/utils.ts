import {
  CATEGORY_LABELS,
} from "./constants";

export function createId(): string {
  return (
    `${Date.now()}-` +
    Math.random().toString(16).slice(2)
  );
}

export function formatCurrency(
  value: number,
): string {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function getCategoryLabel(
  category: string,
): string {
  return (
    CATEGORY_LABELS[category] ??
    category
  );
}