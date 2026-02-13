import { useMemo } from "react";

import type { Category, Transaction } from "@/src/data/entities";
import { formatAmountForSummary } from "@/src/utils/amount";
import { getCategoryLabel } from "@/src/utils/categories/labels";

type CategoryDatum = {
  id: string;
  label: string;
  subtitle: string;
  amount: string;
  percent: string;
  color: string;
};

const fallbackCategoryColors = ["primary", "nileGreen", "gold"] as const;

export interface UseCategoryBreakdownResult {
  categoryData: CategoryDatum[];
  spendingSegments: { percent: number; color: string }[];
  totalAmountLabel: string;
}

export function useCategoryBreakdown(
  expenseTransactions: Transaction[],
  totalExpenses: number,
  categories: Category[],
  locale: string,
  t: (key: string) => string,
  colors: { primary: string; nileGreen: string; gold: string; border: string }
): UseCategoryBreakdownResult {
  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories]
  );

  const topCategoryTotals = useMemo(() => {
    if (!expenseTransactions.length) return [];
    const totals = new Map<string, number>();
    for (const tx of expenseTransactions) {
      const key = tx.category_id ?? "uncategorized";
      totals.set(key, (totals.get(key) ?? 0) + tx.amount);
    }

    return Array.from(totals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([key, amount], index) => {
        const category = key === "uncategorized" ? null : categoryMap.get(key);
        const colorKey = fallbackCategoryColors[index];
        return {
          key,
          amount,
          category,
          color: category?.color ?? colors[colorKey],
        };
      });
  }, [categoryMap, colors, expenseTransactions]);

  const categoryData = useMemo<CategoryDatum[]>(
    () =>
      topCategoryTotals.map((item) => ({
        id: item.key,
        label: getCategoryLabel(item.category, locale, t),
        subtitle: t("dashboard.monthly"),
        amount: `${t("dashboard.currency")} ${formatAmountForSummary(item.amount)}`,
        percent: `${
          totalExpenses > 0 ? Math.round((item.amount / totalExpenses) * 100) : 0
        }%`,
        color: item.color,
      })),
    [locale, t, topCategoryTotals, totalExpenses]
  );

  const spendingSegments = useMemo(() => {
    if (!topCategoryTotals.length || totalExpenses <= 0) return [];
    const segments = topCategoryTotals.map((item) => ({
      percent: item.amount / totalExpenses,
      color: item.color,
    }));

    const remainder =
      1 - segments.reduce((sum, segment) => sum + segment.percent, 0);
    if (remainder > 0.01) {
      segments.push({ percent: remainder, color: colors.border });
    }
    return segments;
  }, [colors.border, topCategoryTotals, totalExpenses]);

  const totalAmountLabel = `${t("dashboard.currency")} ${formatAmountForSummary(
    totalExpenses
  )}`;

  return { categoryData, spendingSegments, totalAmountLabel };
}
