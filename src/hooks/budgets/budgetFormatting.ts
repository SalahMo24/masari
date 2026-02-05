import type { MaterialIconName } from "./budgetTypes";

const categoryIconMap: Record<string, MaterialIconName> = {
  transportation: "directions-car",
  groceries: "shopping-basket",
  dining: "restaurant",
  bills: "receipt-long",
  loan: "payments",
};

export function normalizeCategoryLabel(name: string, locale: string) {
  if (locale === "ar") return name;
  const hasLatin = /[a-zA-Z]/.test(name);
  const cleaned = name.replace(/[-_]/g, " ");
  if (!hasLatin) return cleaned;
  return cleaned.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatPercent(value: number) {
  return Math.max(0, Math.round(value));
}

export function getCategoryIconName(
  name: string,
  icon: string | null
): MaterialIconName {
  return (icon ?? categoryIconMap[name] ?? "category") as MaterialIconName;
}
