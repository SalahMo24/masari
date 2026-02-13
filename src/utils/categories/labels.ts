import type { Category } from "@/src/data/entities";

type Translator = (key: string) => string;

export const DEFAULT_CATEGORY_TRANSLATION_KEY: Record<string, string> = {
  transportation: "category.default.transportation",
  groceries: "category.default.groceries",
  dining: "category.default.dining",
  bills: "category.default.bills",
  subscription: "category.default.subscription",
  utilities: "category.default.utilities",
  rent: "category.default.rent",
  loan: "category.default.loan",
  gym: "category.default.gym",
  salary: "category.default.salary",
  gift: "category.default.gift",
  "side-hustle": "category.default.sideHustle",
  refund: "category.default.refund",
  payback: "category.default.payback",
};

export function normalizeCategoryLabel(name: string, locale: string) {
  if (locale === "ar") return name;
  const hasLatin = /[a-zA-Z]/.test(name);
  const cleaned = name.replace(/[-_]/g, " ");
  if (!hasLatin) return cleaned;
  return cleaned.replace(/\b\w/g, (char) => char.toUpperCase());
}

function localizeDefaultCategory(
  name: string,
  isCustom: boolean,
  t: Translator,
) {
  if (isCustom) return null;
  const key = DEFAULT_CATEGORY_TRANSLATION_KEY[name];
  return key ? t(key) : null;
}

export function getCategoryLabelByName(
  name: string,
  isCustom: boolean,
  locale: string,
  t: Translator,
) {
  return (
    localizeDefaultCategory(name, isCustom, t) ??
    normalizeCategoryLabel(name, locale)
  );
}

export function getCategoryLabel(
  category: Pick<Category, "name" | "is_custom"> | null | undefined,
  locale: string,
  t: Translator,
  emptyKey = "transaction.category.none",
) {
  if (!category) return t(emptyKey);

  return getCategoryLabelByName(category.name, category.is_custom, locale, t);
}
