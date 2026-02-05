import { useMemo } from "react";
import { useRouter } from "expo-router";

import { normalizeCategoryLabel } from "./budgetFormatting";
import type { useBudgetOverview } from "./useBudgetOverview";

type BudgetInsight = ReturnType<typeof useBudgetOverview>["insight"];

type UseBudgetInsightParams = {
  insight: BudgetInsight;
  locale: string;
  t: (key: string) => string;
};

export function useBudgetInsight({ insight, locale, t }: UseBudgetInsightParams) {
  const router = useRouter();

  const insightText = useMemo(() => {
    if (insight.type === "aboveAverage" && insight.categoryName) {
      const categoryLabel = normalizeCategoryLabel(insight.categoryName, locale);
      if (locale === "ar") {
        return `${t("budget.insight.aboveAveragePrefix")} ${categoryLabel} ${t(
          "budget.insight.aboveAverageMiddle"
        )} ${Math.abs(insight.deltaPercent ?? 0)}%`;
      }
      return `${t("budget.insight.aboveAveragePrefix")} ${Math.abs(
        insight.deltaPercent ?? 0
      )}% ${t("budget.insight.aboveAverageMiddle")} ${categoryLabel} ${t(
        "budget.insight.aboveAverageSuffix"
      )}`;
    }
    if (insight.type === "onTrack") {
      return t("budget.insight.onTrack");
    }
    return t("budget.insight.empty");
  }, [insight, locale, t]);

  const handleInsightPress = () => {
    if (insight.budgetId) {
      router.push(`/(features)/budgets/${insight.budgetId}`);
      return;
    }
    router.push("/(features)/budgets/new");
  };

  return { insightText, handleInsightPress };
}

export type { BudgetInsight };
