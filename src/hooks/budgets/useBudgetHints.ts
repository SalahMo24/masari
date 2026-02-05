import { useCallback } from "react";

import type { BudgetOverviewCategory } from "./useBudgetOverview";
import type { MaterialIconName } from "./budgetTypes";
import { formatAmountForSummary } from "@/src/utils/amount";

type BudgetHint = {
  icon: MaterialIconName;
  text: string;
};

type UseBudgetHintsParams = {
  locale: string;
  hideAmounts: boolean;
  t: (key: string) => string;
};

export function useBudgetHints({ locale, hideAmounts, t }: UseBudgetHintsParams) {
  return useCallback(
    (item: BudgetOverviewCategory): BudgetHint => {
      const currencyLabel = t("dashboard.currency");
      const projectedLabel = hideAmounts
        ? t("budget.amount.hidden")
        : formatAmountForSummary(item.projectedOverage);

      if (item.percentUsed >= 100) {
        if (locale === "ar") {
          return {
            icon: "warning",
            text: `${t("budget.hint.overLimitPrefix")} ${projectedLabel} ${currencyLabel}`,
          };
        }
        return {
          icon: "warning",
          text: `${t("budget.hint.overLimitPrefix")} ${projectedLabel} ${currencyLabel}.`,
        };
      }

      if (item.riskLevel === "atRisk") {
        if (item.projectedOverage > 0) {
          if (locale === "ar") {
            return {
              icon: "warning",
              text: `${t("budget.hint.atRiskPrefix")} ${projectedLabel} ${currencyLabel}`,
            };
          }
          return {
            icon: "warning",
            text: `${t("budget.hint.atRiskPrefix")} ${projectedLabel} ${currencyLabel}.`,
          };
        }
        return {
          icon: "warning",
          text: t("budget.hint.nearLimit"),
        };
      }

      if (item.riskLevel === "caution") {
        return {
          icon: "info",
          text: t("budget.hint.caution"),
        };
      }

      return {
        icon: "check-circle",
        text: t("budget.hint.safe"),
      };
    },
    [hideAmounts, locale, t]
  );
}
