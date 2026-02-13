export { normalizeCategoryLabel } from "@/src/utils/categories/labels";
export { getCategoryIconName } from "@/src/utils/categories/icons";

export function formatPercent(value: number) {
  return Math.max(0, Math.round(value));
}
