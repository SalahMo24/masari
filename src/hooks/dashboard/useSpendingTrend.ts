import { useCallback, useMemo, useState } from "react";

import type { Transaction } from "@/src/data/entities";
import { formatAmountForSummary } from "@/src/utils/amount";

type BarDatum = { label: string; value: number; highlight?: boolean };

const dayOrder = [6, 0, 1, 2, 3, 4, 5];
const dayIndexMap = new Map(dayOrder.map((day, index) => [day, index]));
const weekStartDay = 6;

const dayLabelKeys = [
  "dashboard.dayShort.sat",
  "dashboard.dayShort.sun",
  "dashboard.dayShort.mon",
  "dashboard.dayShort.tue",
  "dashboard.dayShort.wed",
  "dashboard.dayShort.thu",
  "dashboard.dayShort.fri",
];

const formatShortDate = (date: Date) =>
  new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(
    date
  );

const formatRangeLabel = (start: Date, end: Date) => {
  if (start.getMonth() === end.getMonth()) {
    const monthText = new Intl.DateTimeFormat(undefined, {
      month: "short",
    }).format(start);
    return `${monthText} ${start.getDate()} - ${end.getDate()}`;
  }

  return `${formatShortDate(start)} - ${formatShortDate(end)}`;
};

const startOfMonth = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), 1);

const endOfMonth = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

const addDays = (date: Date, days: number) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
};

const clampDate = (date: Date, min: Date, max: Date) => {
  if (date < min) return min;
  if (date > max) return max;
  return date;
};

const startOfWeek = (date: Date, weekStart: number) => {
  const copy = new Date(date);
  const diff = (copy.getDay() - weekStart + 7) % 7;
  copy.setDate(copy.getDate() - diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const endOfWeek = (weekStart: Date) => {
  const end = addDays(weekStart, 6);
  end.setHours(23, 59, 59, 999);
  return end;
};

const getWeekStartsInMonth = (monthStart: Date, monthEnd: Date) => {
  const starts: Date[] = [];
  let cursor = startOfWeek(monthStart, weekStartDay);
  while (cursor <= monthEnd) {
    starts.push(new Date(cursor));
    cursor = addDays(cursor, 7);
  }
  return starts;
};

const startOfDay = (date: Date) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const endOfDay = (date: Date) => {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
};

const isWithinRange = (date: Date, start: Date, end: Date) =>
  date >= start && date <= end;

export interface UseSpendingTrendResult {
  barData: BarDatum[];
  rangeLabel: string;
  todayValueLabel: string;
  averageValueLabel: string;
  trendLabel: string;
  trendDirection: "up" | "down" | "flat";
  canGoPrevWeek: boolean;
  canGoNextWeek: boolean;
  handlePrevWeek: () => void;
  handleNextWeek: () => void;
  monthStart: Date;
  monthEnd: Date;
  totalExpenses: number;
  expenseTransactions: Transaction[];
}

export function useSpendingTrend(
  transactions: Transaction[],
  t: (key: string) => string
): UseSpendingTrendResult {
  const today = useMemo(() => new Date(), []);
  const monthStart = useMemo(() => startOfMonth(today), [today]);
  const monthEnd = useMemo(() => endOfMonth(today), [today]);
  const weekStarts = useMemo(
    () => getWeekStartsInMonth(monthStart, monthEnd),
    [monthStart, monthEnd]
  );

  const initialWeekIndex = useMemo(() => {
    const currentWeekStart = startOfWeek(today, weekStartDay).getTime();
    const index = weekStarts.findIndex(
      (weekStart) => weekStart.getTime() === currentWeekStart
    );
    return index === -1 ? weekStarts.length - 1 : index;
  }, [today, weekStarts]);

  const [weekIndex, setWeekIndex] = useState(initialWeekIndex);
  const activeWeekStart = weekStarts[weekIndex] ?? monthStart;
  const activeWeekEnd = useMemo(
    () => endOfWeek(activeWeekStart),
    [activeWeekStart]
  );
  const displayWeekStart = useMemo(
    () => clampDate(activeWeekStart, monthStart, monthEnd),
    [activeWeekStart, monthStart, monthEnd]
  );
  const displayWeekEnd = useMemo(
    () => clampDate(activeWeekEnd, monthStart, monthEnd),
    [activeWeekEnd, monthStart, monthEnd]
  );
  const weekLabel = useMemo(
    () => formatRangeLabel(displayWeekStart, displayWeekEnd),
    [displayWeekEnd, displayWeekStart]
  );
  const canGoPrevWeek = weekIndex > 0;
  const canGoNextWeek = weekIndex < weekStarts.length - 1;
  const handlePrevWeek = useCallback(() => {
    if (!canGoPrevWeek) return;
    setWeekIndex((index) => Math.max(0, index - 1));
  }, [canGoPrevWeek]);
  const handleNextWeek = useCallback(() => {
    if (!canGoNextWeek) return;
    setWeekIndex((index) => Math.min(weekStarts.length - 1, index + 1));
  }, [canGoNextWeek, weekStarts.length]);

  const monthTransactions = useMemo(
    () =>
      transactions.filter((tx) =>
        isWithinRange(new Date(tx.occurred_at), monthStart, monthEnd)
      ),
    [transactions, monthStart, monthEnd]
  );

  const expenseTransactions = useMemo(
    () => monthTransactions.filter((tx) => tx.type === "expense"),
    [monthTransactions]
  );

  const totalExpenses = useMemo(
    () =>
      expenseTransactions.reduce((total, tx) => total + tx.amount, 0),
    [expenseTransactions]
  );

  const weekExpenseTransactions = useMemo(() => {
    return expenseTransactions.filter((tx) => {
      const date = new Date(tx.occurred_at);
      return (
        isWithinRange(date, activeWeekStart, activeWeekEnd) &&
        isWithinRange(date, monthStart, monthEnd)
      );
    });
  }, [activeWeekEnd, activeWeekStart, expenseTransactions, monthEnd, monthStart]);

  const weekTotalExpenses = useMemo(
    () => weekExpenseTransactions.reduce((total, tx) => total + tx.amount, 0),
    [weekExpenseTransactions]
  );

  const barData = useMemo<BarDatum[]>(() => {
    const totals = dayOrder.map(() => 0);
    for (const tx of weekExpenseTransactions) {
      const dayIndex = dayIndexMap.get(new Date(tx.occurred_at).getDay());
      if (dayIndex === undefined) continue;
      totals[dayIndex] += tx.amount;
    }

    const maxValue = Math.max(0, ...totals);
    return totals.map((value, index) => {
      const labelKey = dayLabelKeys[index];
      const isMax = maxValue > 0 && value === maxValue;
      return {
        label: t(labelKey),
        value: maxValue > 0 ? value / maxValue : 0,
        highlight: isMax,
      };
    });
  }, [weekExpenseTransactions, t]);

  const daysInWeek = useMemo(() => {
    const msInDay = 24 * 60 * 60 * 1000;
    const start = displayWeekStart.getTime();
    const end = displayWeekEnd.getTime();
    return Math.max(1, Math.round((end - start) / msInDay) + 1);
  }, [displayWeekEnd, displayWeekStart]);

  const averagePerDay = weekTotalExpenses / Math.max(1, daysInWeek);
  const averageValueLabel = `${t("dashboard.currency")} ${formatAmountForSummary(
    averagePerDay
  )}`;

  const previousWeekStart = useMemo(
    () => addDays(activeWeekStart, -7),
    [activeWeekStart]
  );
  const previousWeekEnd = useMemo(
    () => endOfWeek(previousWeekStart),
    [previousWeekStart]
  );
  const previousWeekTotal = useMemo(() => {
    return expenseTransactions
      .filter((tx) => {
        const date = new Date(tx.occurred_at);
        return (
          isWithinRange(date, previousWeekStart, previousWeekEnd) &&
          isWithinRange(date, monthStart, monthEnd)
        );
      })
      .reduce((total, tx) => total + tx.amount, 0);
  }, [expenseTransactions, monthEnd, monthStart, previousWeekEnd, previousWeekStart]);

  const trendDelta =
    previousWeekTotal > 0
      ? (weekTotalExpenses - previousWeekTotal) / previousWeekTotal
      : 0;
  const trendDirection =
    trendDelta > 0.01 ? "up" : trendDelta < -0.01 ? "down" : "flat";
  const trendLabel = `${Math.round(Math.abs(trendDelta) * 100)}%`;

  const todayStart = useMemo(() => startOfDay(today), [today]);
  const todayEnd = useMemo(() => endOfDay(today), [today]);
  const todayTotal = useMemo(() => {
    return transactions
      .filter((tx) => {
        if (tx.type !== "expense") return false;
        const date = new Date(tx.occurred_at);
        return isWithinRange(date, todayStart, todayEnd);
      })
      .reduce((total, tx) => total + tx.amount, 0);
  }, [todayEnd, todayStart, transactions]);
  const todayValueLabel = `${t("dashboard.currency")} ${formatAmountForSummary(
    todayTotal
  )}`;

  return {
    barData,
    rangeLabel: weekLabel,
    todayValueLabel,
    averageValueLabel,
    trendLabel,
    trendDirection,
    canGoPrevWeek,
    canGoNextWeek,
    handlePrevWeek,
    handleNextWeek,
    monthStart,
    monthEnd,
    totalExpenses,
    expenseTransactions,
  };
}
