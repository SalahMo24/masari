import { useMemo, useState } from "react";

import { useBudgetOverview } from "./useBudgetOverview";
import type { BudgetPeriod } from "./useBudgetOverview";

export const SAFE_PREVIEW_COUNT = 2;

type UseBudgetScreenStateParams = {
  pendingBudgetId: string | null;
};

export function useBudgetScreenState({
  pendingBudgetId,
}: UseBudgetScreenStateParams) {
  const [period, setPeriod] = useState<BudgetPeriod>("current");
  const [showAllSafe, setShowAllSafe] = useState(false);
  const [hideAmounts, setHideAmounts] = useState(false);

  const {
    totals,
    groupedByRisk,
    insight,
    hasBudgets,
    loading,
  } = useBudgetOverview(period);

  const visibleSafe = useMemo(() => {
    if (
      showAllSafe ||
      groupedByRisk.safe.length <= SAFE_PREVIEW_COUNT ||
      (pendingBudgetId &&
        groupedByRisk.safe.some((item) => item.budgetId === pendingBudgetId))
    ) {
      return groupedByRisk.safe;
    }
    return groupedByRisk.safe.slice(0, SAFE_PREVIEW_COUNT);
  }, [groupedByRisk.safe, pendingBudgetId, showAllSafe]);

  const allBudgets = useMemo(
    () => [
      ...groupedByRisk.atRisk,
      ...groupedByRisk.caution,
      ...groupedByRisk.safe,
    ],
    [groupedByRisk.atRisk, groupedByRisk.caution, groupedByRisk.safe]
  );

  const pendingBudget = useMemo(
    () =>
      allBudgets.find((item) => item.budgetId === pendingBudgetId) ?? null,
    [allBudgets, pendingBudgetId]
  );

  return {
    period,
    setPeriod,
    showAllSafe,
    setShowAllSafe,
    hideAmounts,
    setHideAmounts,
    totals,
    groupedByRisk,
    insight,
    hasBudgets,
    loading,
    visibleSafe,
    allBudgets,
    pendingBudget,
  };
}

