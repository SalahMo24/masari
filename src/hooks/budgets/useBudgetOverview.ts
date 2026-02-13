import { useFocusEffect } from "@react-navigation/native";
import {
  differenceInCalendarDays,
  endOfMonth,
  startOfMonth,
  subMonths,
} from "date-fns";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { Budget, Category, Transaction } from "@/src/data/entities";
import {
  budgetRepository,
  categoryRepository,
  transactionRepository,
} from "@/src/data/repositories";

export type BudgetPeriod = "current" | "previous";
export type RiskLevel = "atRisk" | "caution" | "safe";

export type BudgetOverviewCategory = {
  budgetId: string;
  categoryId: string;
  name: string;
  isCustom: boolean;
  icon: string | null;
  color: string | null;
  limit: number;
  spent: number;
  percentUsed: number;
  progressPercent: number;
  riskLevel: RiskLevel;
  projectedOverage: number;
};

type Insight =
  | {
      type: "aboveAverage";
      categoryId: string;
      budgetId: string;
      categoryName: string;
      categoryIsCustom: boolean;
      deltaPercent: number;
    }
  | {
      type: "onTrack";
      budgetId: string | null;
    }
  | {
      type: "empty";
      budgetId: string | null;
    };

type BudgetTotals = {
  totalLimit: number;
  totalSpent: number;
  remaining: number;
  percentUsed: number;
  remainingPercent: number;
};

const isWithinRange = (date: Date, start: Date, end: Date) =>
  date >= start && date <= end;

const RISK_THRESHOLDS = {
  atRisk: 85,
  caution: 70,
};

export function useBudgetOverview(period: BudgetPeriod) {
  const db = useSQLiteContext();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const [budgetData, categoryData, transactionData] = await Promise.all([
        budgetRepository.list(db),
        categoryRepository.list(db),
        transactionRepository.list(db),
      ]);
      setBudgets(budgetData);
      setCategories(categoryData);
      setTransactions(transactionData);
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useFocusEffect(
    useCallback(() => {
      refreshData();
      return () => undefined;
    }, [refreshData])
  );

  const today = useMemo(() => new Date(), []);
  const monthBase = useMemo(
    () => (period === "current" ? today : subMonths(today, 1)),
    [period, today]
  );
  const monthStart = useMemo(() => startOfMonth(monthBase), [monthBase]);
  const monthEnd = useMemo(() => endOfMonth(monthBase), [monthBase]);
  const daysInPeriod = useMemo(
    () => differenceInCalendarDays(monthEnd, monthStart) + 1,
    [monthEnd, monthStart]
  );
  const daysElapsed = useMemo(() => {
    if (period === "previous") return daysInPeriod;
    const todayClamped = today > monthEnd ? monthEnd : today;
    return Math.max(1, differenceInCalendarDays(todayClamped, monthStart) + 1);
  }, [daysInPeriod, monthEnd, monthStart, period, today]);

  const expenseTransactions = useMemo(
    () =>
      transactions.filter(
        (tx) =>
          tx.type === "expense" &&
          isWithinRange(new Date(tx.occurred_at), monthStart, monthEnd)
      ),
    [monthEnd, monthStart, transactions]
  );

  const spentByCategory = useMemo(() => {
    const totals = new Map<string, number>();
    for (const tx of expenseTransactions) {
      if (!tx.category_id) continue;
      totals.set(tx.category_id, (totals.get(tx.category_id) ?? 0) + tx.amount);
    }
    return totals;
  }, [expenseTransactions]);

  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>();
    for (const category of categories) {
      map.set(category.id, category);
    }
    return map;
  }, [categories]);

  const overviewCategories = useMemo<BudgetOverviewCategory[]>(() => {
    return budgets
      .map((budget) => {
        const category = categoryMap.get(budget.category_id);
        const spent = spentByCategory.get(budget.category_id) ?? 0;
        const limit = budget.monthly_limit;
        const percentUsed = limit > 0 ? (spent / limit) * 100 : 0;
        const progressPercent = Math.min(100, Math.max(0, percentUsed));
        const projectedTotal =
          daysElapsed > 0 ? (spent / daysElapsed) * daysInPeriod : spent;
        const projectedOverage = Math.max(0, projectedTotal - limit);
        const riskLevel: RiskLevel =
          percentUsed >= RISK_THRESHOLDS.atRisk
            ? "atRisk"
            : percentUsed >= RISK_THRESHOLDS.caution
              ? "caution"
              : "safe";

        return {
          budgetId: budget.id,
          categoryId: budget.category_id,
          name: category?.name ?? "Uncategorized",
          isCustom: category?.is_custom ?? true,
          icon: category?.icon ?? null,
          color: category?.color ?? null,
          limit,
          spent,
          percentUsed,
          progressPercent,
          riskLevel,
          projectedOverage,
        };
      })
      .sort((a, b) => b.percentUsed - a.percentUsed);
  }, [budgets, categoryMap, daysElapsed, daysInPeriod, spentByCategory]);

  const totals = useMemo<BudgetTotals>(() => {
    const totalLimit = overviewCategories.reduce(
      (sum, item) => sum + item.limit,
      0
    );
    const totalSpent = overviewCategories.reduce(
      (sum, item) => sum + item.spent,
      0
    );
    const percentUsed = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;
    const remaining = Math.max(0, totalLimit - totalSpent);
    const remainingPercent =
      totalLimit > 0 ? Math.max(0, 100 - percentUsed) : 100;

    return {
      totalLimit,
      totalSpent,
      remaining,
      percentUsed,
      remainingPercent,
    };
  }, [overviewCategories]);

  const insight = useMemo<Insight>(() => {
    if (!overviewCategories.length) {
      return { type: "empty", budgetId: null };
    }
    const ratioEntries = overviewCategories
      .filter((item) => item.limit > 0)
      .map((item) => ({
        ...item,
        ratio: item.spent / item.limit,
      }));
    if (!ratioEntries.length) {
      return { type: "onTrack", budgetId: overviewCategories[0]?.budgetId ?? null };
    }
    const averageRatio =
      ratioEntries.reduce((sum, item) => sum + item.ratio, 0) /
      ratioEntries.length;
    const mostPressured = ratioEntries.reduce((max, item) =>
      item.ratio > max.ratio ? item : max
    );
    const deltaRatio = mostPressured.ratio - averageRatio;
    const deltaPercent = Math.round(deltaRatio * 100);

    if (deltaPercent >= 5) {
      return {
        type: "aboveAverage",
        categoryId: mostPressured.categoryId,
        budgetId: mostPressured.budgetId,
        categoryName: mostPressured.name,
        categoryIsCustom: mostPressured.isCustom,
        deltaPercent,
      };
    }

    return {
      type: "onTrack",
      budgetId: mostPressured.budgetId ?? null,
    };
  }, [overviewCategories]);

  const groupedByRisk = useMemo(() => {
    const atRisk = overviewCategories.filter((item) => item.riskLevel === "atRisk");
    const caution = overviewCategories.filter(
      (item) => item.riskLevel === "caution"
    );
    const safe = overviewCategories.filter((item) => item.riskLevel === "safe");
    return { atRisk, caution, safe };
  }, [overviewCategories]);

  return {
    loading,
    period,
    monthStart,
    monthEnd,
    totals,
    overviewCategories,
    groupedByRisk,
    insight,
    refreshData,
    hasBudgets: overviewCategories.length > 0,
  };
}
