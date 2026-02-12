import { useCallback, useMemo, useState } from "react";
import { MaterialIcons } from "@/src/components/icons/legacyVectorIcons";

import type { Category, Transaction, Wallet } from "@/src/data/entities";
import { formatAmountForSummary } from "@/src/utils/amount";

const weekStartDay = 6;

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

const isWithinRange = (date: Date, start: Date, end: Date) =>
  date >= start && date <= end;

const getWeekStartsInMonth = (monthStart: Date, monthEnd: Date) => {
  const starts: Date[] = [];
  let cursor = startOfWeek(monthStart, weekStartDay);
  while (cursor <= monthEnd) {
    starts.push(new Date(cursor));
    cursor = addDays(cursor, 7);
  }
  return starts;
};

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

const getTransactionIcon = (
  type: Transaction["type"]
): keyof typeof MaterialIcons.glyphMap => {
  if (type === "income") return "work";
  if (type === "transfer") return "swap-horiz";
  return "shopping-cart";
};

export interface WeeklyActivityItem {
  id: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  transactionName: string;
  transactionCategory: string;
  transactionDate: string;
  transactionType: Transaction["type"];
  amount: string;
  source: string;
}

export interface UseWeeklyActivityResult {
  weekLabel: string;
  canGoPrevWeek: boolean;
  canGoNextWeek: boolean;
  handlePrevWeek: () => void;
  handleNextWeek: () => void;
  recentActivity: WeeklyActivityItem[];
}

export function useWeeklyActivity(
  transactions: Transaction[],
  categories: Category[],
  wallets: Wallet[],
  t: (key: string) => string,
  maxItems = 5
): UseWeeklyActivityResult {
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
    [displayWeekStart, displayWeekEnd]
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

  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories]
  );
  const walletMap = useMemo(
    () => new Map(wallets.map((wallet) => [wallet.id, wallet])),
    [wallets]
  );

  const weekTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const date = new Date(tx.occurred_at);
      return (
        isWithinRange(date, activeWeekStart, activeWeekEnd) &&
        isWithinRange(date, monthStart, monthEnd)
      );
    });
  }, [activeWeekEnd, activeWeekStart, monthEnd, monthStart, transactions]);

  const recentTransactions = useMemo(() => {
    return [...weekTransactions]
      .sort(
        (a, b) =>
          new Date(b.occurred_at).getTime() -
          new Date(a.occurred_at).getTime()
      )
      .slice(0, maxItems);
  }, [maxItems, weekTransactions]);

  const recentActivity = useMemo(
    () =>
      recentTransactions.map((tx) => {
        const category = tx.category_id ? categoryMap.get(tx.category_id) : null;
        const wallet = tx.wallet_id ? walletMap.get(tx.wallet_id) : null;
        const targetWallet = tx.target_wallet_id
          ? walletMap.get(tx.target_wallet_id)
          : null;
        const name = tx.note ?? category?.name ?? t("transaction.category.none");
        const categoryLabel = category?.name ?? t("transaction.category.none");
        const dateLabel = `- ${formatShortDate(new Date(tx.occurred_at))}`;
        const source =
          tx.type === "transfer"
            ? `${wallet?.name ?? t("transaction.wallet.unknown")} to ${
                targetWallet?.name ?? t("transaction.wallet.unknown")
              }`
            : wallet?.name ?? t("transaction.wallet.unknown");
        const amountSign =
          tx.type === "expense" ? "-" : tx.type === "income" ? "+" : "";
        const amount = `${amountSign}${formatAmountForSummary(tx.amount)}`;

        return {
          id: tx.id,
          icon: getTransactionIcon(tx.type),
          transactionName: name,
          transactionCategory: categoryLabel,
          transactionDate: dateLabel,
          transactionType: tx.type,
          amount,
          source,
        };
      }),
    [categoryMap, recentTransactions, t, walletMap]
  );

  return {
    weekLabel,
    canGoPrevWeek,
    canGoNextWeek,
    handlePrevWeek,
    handleNextWeek,
    recentActivity,
  };
}
