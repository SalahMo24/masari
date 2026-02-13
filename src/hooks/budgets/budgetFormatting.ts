import type { MaterialIconName } from "./budgetTypes";
export { normalizeCategoryLabel } from "@/src/utils/categories/labels";

const categoryIconMap: Record<string, MaterialIconName> = {
  transportation: "directions-car",
  groceries: "shopping-basket",
  dining: "restaurant",
  bills: "receipt-long",
  loan: "payments",
};

export function formatPercent(value: number) {
  return Math.max(0, Math.round(value));
}

export function getCategoryIconName(
  name: string,
  icon: string | null
): MaterialIconName {
  return (icon ?? categoryIconMap[name] ?? "category") as MaterialIconName;
}
