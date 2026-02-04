import { useMemo } from "react";

import type { Transaction } from "@/src/data/entities";
import { formatAmountForSummary } from "@/src/utils/amount";

type BarDatum = { label: string; value: number; highlight?: boolean };

const dayOrder = [6, 0, 1, 2, 3, 4, 5];
const dayIndexMap = new Map(dayOrder.map((day, index) => [day, index]));

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

const isWithinRange = (date: Date, start: Date, end: Date) =>
  date >= start && date <= end;

export interface UseSpendingTrendResult {
  barData: BarDatum[];
  rangeLabel: string;
  averageValueLabel: string;
  trendLabel: string;
  trendDirection: "up" | "down" | "flat";
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

  const barData = useMemo<BarDatum[]>(() => {
    const totals = dayOrder.map(() => 0);
    for (const tx of expenseTransactions) {
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
  }, [expenseTransactions, t]);

  const daysInMonth = monthEnd.getDate();
  const daysElapsed = Math.min(today.getDate(), daysInMonth);
  const averagePerDay = totalExpenses / Math.max(1, daysElapsed);
  const averageValueLabel = `${t("dashboard.currency")} ${formatAmountForSummary(
    averagePerDay
  )}`;

  const previousMonthStart = useMemo(
    () => startOfMonth(new Date(today.getFullYear(), today.getMonth() - 1, 1)),
    [today]
  );
  const previousMonthEnd = useMemo(
    () => endOfMonth(previousMonthStart),
    [previousMonthStart]
  );
  const previousRangeEnd = useMemo(() => {
    const end = new Date(previousMonthStart);
    end.setDate(Math.min(daysElapsed, previousMonthEnd.getDate()));
    end.setHours(23, 59, 59, 999);
    return end;
  }, [daysElapsed, previousMonthStart, previousMonthEnd]);

  const previousTotalExpenses = useMemo(() => {
    return transactions
      .filter((tx) => {
        if (tx.type !== "expense") return false;
        const date = new Date(tx.occurred_at);
        return isWithinRange(date, previousMonthStart, previousRangeEnd);
      })
      .reduce((total, tx) => total + tx.amount, 0);
  }, [previousMonthStart, previousRangeEnd, transactions]);

  const trendDelta =
    previousTotalExpenses > 0
      ? (totalExpenses - previousTotalExpenses) / previousTotalExpenses
      : 0;
  const trendDirection =
    trendDelta > 0.01 ? "up" : trendDelta < -0.01 ? "down" : "flat";
  const trendLabel = `${Math.round(Math.abs(trendDelta) * 100)}%`;

  const rangeLabel = useMemo(
    () => formatRangeLabel(monthStart, today),
    [monthStart, today]
  );

  return {
    barData,
    rangeLabel,
    averageValueLabel,
    trendLabel,
    trendDirection,
    monthStart,
    monthEnd,
    totalExpenses,
    expenseTransactions,
  };
}
