import { useFocusEffect } from "@react-navigation/native";
import {
  differenceInCalendarDays,
  endOfMonth,
  isToday,
  isYesterday,
  startOfMonth,
  subMonths,
} from "date-fns";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useMemo, useState } from "react";

import { useUserPreferences } from "@/src/context/UserPreferencesProvider";
import type { Budget, Category, Transaction } from "@/src/data/entities";
import {
  budgetRepository,
  categoryRepository,
  transactionRepository,
} from "@/src/data/repositories";
import { formatAmountForSummary } from "@/src/utils/amount";
import { getCategoryLabel } from "@/src/utils/categories/labels";
import { formatPercent, getCategoryIconName } from "./budgetFormatting";
import type { MaterialIconName } from "./budgetTypes";

export type BudgetDetailTransaction = {
  id: string;
  title: string;
  dateLabel: string;
  amountLabel: string;
  iconName: MaterialIconName;
  shareLabel?: string;
};

export type BudgetStatusLevel = "safe" | "caution" | "atRisk";

type UseBudgetDetailArgs = {
  budgetId: string | null;
  locale: string;
  t: (key: string) => string;
};

type BudgetDetailState = {
  loading: boolean;
  budget: Budget | null;
  category: Category | null;
  statusLevel: BudgetStatusLevel;
  spent: number;
  limit: number;
  summaryText: string;
  percentLabel: string;
  progressPercent: number;
  paceText: string;
  insightText: string;
  remainingBudget: number;
  remainingDays: number;
  dailyTarget: number;
  weeklyTarget: number;
  projectedTotal: number;
  projectedDelta: number;
  projectedPercent: number;
  isAdjustmentNeeded: boolean;
  transactions: BudgetDetailTransaction[];
};

const RISK_THRESHOLDS = {
  atRisk: 85,
  caution: 70,
};

const isWithinRange = (date: Date, start: Date, end: Date) =>
  date >= start && date <= end;

const formatShortDate = (locale: string, date: Date) =>
  new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" }).format(
    date,
  );

const formatTime = (locale: string, date: Date) =>
  new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);

export function useBudgetDetail({ budgetId, locale, t }: UseBudgetDetailArgs) {
  const db = useSQLiteContext();
  const { currency: currencyLabel } = useUserPreferences();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshData = useCallback(async () => {
    if (!budgetId) {
      setBudget(null);
      setCategory(null);
      setTransactions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [budgetData, categoriesData, transactionData] = await Promise.all([
        budgetRepository.getById(db, budgetId),
        categoryRepository.list(db),
        transactionRepository.list(db),
      ]);
      setBudget(budgetData);
      setCategory(
        budgetData
          ? (categoriesData.find(
              (item) => item.id === budgetData.category_id,
            ) ?? null)
          : null,
      );
      setTransactions(transactionData);
    } finally {
      setLoading(false);
    }
  }, [budgetId, db]);

  useFocusEffect(
    useCallback(() => {
      refreshData();
      return () => undefined;
    }, [refreshData]),
  );

  const today = useMemo(() => new Date(), []);
  const monthStart = useMemo(() => startOfMonth(today), [today]);
  const monthEnd = useMemo(() => endOfMonth(today), [today]);
  const daysInPeriod = useMemo(
    () => differenceInCalendarDays(monthEnd, monthStart) + 1,
    [monthEnd, monthStart],
  );
  const daysElapsed = useMemo(() => {
    const todayClamped = today > monthEnd ? monthEnd : today;
    return Math.max(1, differenceInCalendarDays(todayClamped, monthStart) + 1);
  }, [monthEnd, monthStart, today]);
  const lastMonthStart = useMemo(
    () => startOfMonth(subMonths(today, 1)),
    [today],
  );
  const lastMonthEnd = useMemo(() => endOfMonth(subMonths(today, 1)), [today]);

  const filteredTransactions = useMemo(() => {
    if (!budget?.category_id) return [];
    return transactions.filter(
      (tx) =>
        tx.type === "expense" &&
        tx.category_id === budget.category_id &&
        isWithinRange(new Date(tx.occurred_at), monthStart, monthEnd),
    );
  }, [budget?.category_id, monthEnd, monthStart, transactions]);

  const spent = useMemo(
    () => filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0),
    [filteredTransactions],
  );
  const limit = budget?.monthly_limit ?? 0;
  const percentUsed = limit > 0 ? (spent / limit) * 100 : 0;
  const progressPercent = Math.min(100, Math.max(0, percentUsed));
  const statusLevel: BudgetStatusLevel =
    percentUsed >= RISK_THRESHOLDS.atRisk
      ? "atRisk"
      : percentUsed >= RISK_THRESHOLDS.caution
        ? "caution"
        : "safe";

  const projectedTotal = useMemo(() => {
    return daysElapsed > 0 ? (spent / daysElapsed) * daysInPeriod : spent;
  }, [daysElapsed, daysInPeriod, spent]);
  const remainingBudget = Math.max(0, limit - spent);
  const remainingDays = Math.max(1, daysInPeriod - daysElapsed);
  const dailyTarget = remainingBudget / remainingDays;
  const weeklyTarget = dailyTarget * 7;
  const projectedDelta = limit - projectedTotal;
  const projectedPercent = limit > 0 ? (projectedTotal / limit) * 100 : 0;
  const isAdjustmentNeeded = projectedTotal > limit;

  const lastMonthSpent = useMemo(() => {
    if (!budget?.category_id) return 0;
    return transactions.reduce((total, tx) => {
      if (tx.type !== "expense" || tx.category_id !== budget.category_id)
        return total;
      if (
        !isWithinRange(new Date(tx.occurred_at), lastMonthStart, lastMonthEnd)
      ) {
        return total;
      }
      return total + tx.amount;
    }, 0);
  }, [budget?.category_id, lastMonthEnd, lastMonthStart, transactions]);

  const categoryLabel = getCategoryLabel(category, locale, t);

  const summaryText = t("budget.detail.summary")
    .replace("{spent}", formatAmountForSummary(spent))
    .replace("{limit}", formatAmountForSummary(limit))
    .replaceAll("{currency}", currencyLabel);

  const percentLabel = `${formatPercent(percentUsed)}%`;
  const paceText = t("budget.detail.pace")
    .replace("{amount}", formatAmountForSummary(projectedTotal))
    .replace("{currency}", currencyLabel);

  const insightText = useMemo(() => {
    if (lastMonthSpent <= 0) {
      return t("budget.detail.insight.onTrack").replace(
        "{category}",
        categoryLabel,
      );
    }
    const deltaRatio = (spent - lastMonthSpent) / lastMonthSpent;
    const deltaPercent = Math.round(deltaRatio * 100);
    if (Math.abs(deltaPercent) < 5) {
      return t("budget.detail.insight.onTrack").replace(
        "{category}",
        categoryLabel,
      );
    }
    if (deltaPercent > 0) {
      return t("budget.detail.insight.more")
        .replace("{percent}", `${deltaPercent}%`)
        .replace("{category}", categoryLabel);
    }
    return t("budget.detail.insight.less")
      .replace("{percent}", `${Math.abs(deltaPercent)}%`)
      .replace("{category}", categoryLabel);
  }, [categoryLabel, lastMonthSpent, spent, t]);

  const transactionItems = useMemo<BudgetDetailTransaction[]>(() => {
    const localeTag = locale === "ar" ? "ar-EG" : "en-US";
    return [...filteredTransactions]
      .sort(
        (a, b) =>
          new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime(),
      )
      .map((tx) => {
        const occurredAt = new Date(tx.occurred_at);
        const timeLabel = formatTime(localeTag, occurredAt);
        const dateLabel = isToday(occurredAt)
          ? `${t("budget.detail.today")}, ${timeLabel}`
          : isYesterday(occurredAt)
            ? `${t("budget.detail.yesterday")}, ${timeLabel}`
            : `${formatShortDate(localeTag, occurredAt)}, ${timeLabel}`;
        const iconName = getCategoryIconName(
          category?.name ?? "category",
          category?.icon ?? null,
        );
        const amountLabel = `${t("budget.detail.amountPrefix")} ${currencyLabel} ${formatAmountForSummary(
          tx.amount,
        )}`;
        const sharePercent =
          limit > 0 ? Math.round((tx.amount / limit) * 100) : 0;
        const shareLabel =
          sharePercent >= 20
            ? t("budget.detail.transactionShare").replace(
                "{percent}",
                `${sharePercent}%`,
              )
            : undefined;
        return {
          id: tx.id,
          title: tx.note ?? categoryLabel,
          dateLabel,
          amountLabel,
          iconName,
          shareLabel,
        };
      });
  }, [
    category?.icon,
    category?.name,
    categoryLabel,
    currencyLabel,
    filteredTransactions,
    limit,
    locale,
    t,
  ]);

  return {
    loading,
    budget,
    category,
    statusLevel,
    spent,
    limit,
    summaryText,
    percentLabel,
    progressPercent,
    paceText,
    insightText,
    remainingBudget,
    remainingDays,
    dailyTarget,
    weeklyTarget,
    projectedTotal,
    projectedDelta,
    projectedPercent,
    isAdjustmentNeeded,
    transactions: transactionItems,
  } satisfies BudgetDetailState;
}
