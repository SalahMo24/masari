import { useFocusEffect } from "@react-navigation/native";
import {
  endOfMonth,
  isToday,
  isYesterday,
  startOfMonth,
  subMonths,
} from "date-fns";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useMemo, useState } from "react";

import type { Category, Transaction, Wallet } from "@/src/data/entities";
import {
  categoryRepository,
  transactionRepository,
  walletRepository,
} from "@/src/data/repositories";
import { formatAmountForSummary } from "@/src/utils/amount";
import { getCategoryLabel } from "@/src/utils/categories/labels";
import {
  getCategoryIconName,
} from "@/src/hooks/budgets/budgetFormatting";
import type { MaterialIconName } from "@/src/hooks/budgets/budgetTypes";

export type CategoryDetailTransaction = {
  id: string;
  title: string;
  subtitle: string;
  amountLabel: string;
  sourceLabel: string;
  iconName: MaterialIconName;
};

export type CategoryDetailDayGroup = {
  id: string;
  label: string;
  items: CategoryDetailTransaction[];
};

export type CategoryDetailDirection = "up" | "down" | "neutral";

type UseCategoryDetailArgs = {
  categoryId: string | null;
  locale: string;
  t: (key: string) => string;
};

const isWithinRange = (date: Date, start: Date, end: Date) =>
  date >= start && date <= end;

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatShortDate = (locale: string, date: Date) =>
  new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" }).format(
    date,
  );

const formatMonthLabel = (locale: string, date: Date) =>
  new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(
    date,
  );

const formatTime = (locale: string, date: Date) =>
  new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit" }).format(
    date,
  );

export function useCategoryDetail({ categoryId, locale, t }: UseCategoryDetailArgs) {
  const db = useSQLiteContext();
  const [category, setCategory] = useState<Category | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshData = useCallback(async () => {
    if (!categoryId) {
      setCategory(null);
      setTransactions([]);
      setWallets([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [categoryData, walletData, transactionData] = await Promise.all([
        categoryId !== "uncategorized"
          ? categoryRepository.getById(db, categoryId)
          : Promise.resolve(null),
        walletRepository.list(db),
        transactionRepository.list(db),
      ]);
      setCategory(categoryData);
      setWallets(walletData);
      setTransactions(transactionData);
    } finally {
      setLoading(false);
    }
  }, [categoryId, db]);

  useFocusEffect(
    useCallback(() => {
      refreshData();
      return () => undefined;
    }, [refreshData]),
  );

  const today = useMemo(() => new Date(), []);
  const monthStart = useMemo(() => startOfMonth(today), [today]);
  const monthEnd = useMemo(() => endOfMonth(today), [today]);
  const lastMonthStart = useMemo(() => startOfMonth(subMonths(today, 1)), [today]);
  const lastMonthEnd = useMemo(() => endOfMonth(subMonths(today, 1)), [today]);

  const localeTag = locale === "ar" ? "ar-EG" : "en-US";
  const currencyLabel = t("dashboard.currency");

  const filteredTransactions = useMemo(() => {
    if (!categoryId) return [];
    return transactions.filter((tx) => {
      const isCategoryMatch =
        categoryId === "uncategorized"
          ? !tx.category_id
          : tx.category_id === categoryId;
      return (
        tx.type === "expense" &&
        isCategoryMatch &&
        isWithinRange(new Date(tx.occurred_at), monthStart, monthEnd)
      );
    });
  }, [categoryId, monthEnd, monthStart, transactions]);

  const totalSpent = useMemo(
    () => filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0),
    [filteredTransactions],
  );

  const lastMonthSpent = useMemo(() => {
    if (!categoryId) return 0;
    return transactions.reduce((total, tx) => {
      const isCategoryMatch =
        categoryId === "uncategorized"
          ? !tx.category_id
          : tx.category_id === categoryId;
      if (tx.type !== "expense" || !isCategoryMatch) return total;
      if (!isWithinRange(new Date(tx.occurred_at), lastMonthStart, lastMonthEnd)) {
        return total;
      }
      return total + tx.amount;
    }, 0);
  }, [categoryId, lastMonthEnd, lastMonthStart, transactions]);

  const comparisonPercent = useMemo(() => {
    if (lastMonthSpent <= 0) return 0;
    return Math.round(((totalSpent - lastMonthSpent) / lastMonthSpent) * 100);
  }, [lastMonthSpent, totalSpent]);

  const comparisonDirection: CategoryDetailDirection =
    comparisonPercent > 0 ? "up" : comparisonPercent < 0 ? "down" : "neutral";

  const categoryLabel = getCategoryLabel(category, locale, t);
  const categoryIcon = getCategoryIconName(
    category?.name ?? "category",
    category?.icon ?? null,
  );

  const walletMap = useMemo(
    () => new Map(wallets.map((wallet) => [wallet.id, wallet])),
    [wallets],
  );

  const dayGroups = useMemo<CategoryDetailDayGroup[]>(() => {
    if (!filteredTransactions.length) return [];
    const sorted = [...filteredTransactions].sort(
      (a, b) =>
        new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime(),
    );
    const groups: CategoryDetailDayGroup[] = [];
    const groupMap = new Map<string, CategoryDetailDayGroup>();

    for (const tx of sorted) {
      const occurredAt = new Date(tx.occurred_at);
      const key = formatDateKey(occurredAt);
      const timeLabel = formatTime(localeTag, occurredAt);
      const wallet = tx.wallet_id ? walletMap.get(tx.wallet_id) : undefined;
      const subtitle = wallet?.name ? `${wallet.name} • ${timeLabel}` : timeLabel;
      const sourceLabel = wallet
        ? wallet.type === "bank"
          ? t("dashboard.bank")
          : t("dashboard.cash")
        : t("category.detail.source.unknown");
      const amountLabel = `${t("category.detail.amountPrefix")} ${currencyLabel} ${formatAmountForSummary(
        tx.amount,
      )}`;
      const item: CategoryDetailTransaction = {
        id: tx.id,
        title: tx.note ?? categoryLabel,
        subtitle,
        amountLabel,
        sourceLabel,
        iconName: categoryIcon,
      };

      if (!groupMap.has(key)) {
        const label = isToday(occurredAt)
          ? t("category.detail.today")
          : isYesterday(occurredAt)
            ? t("category.detail.yesterday")
            : formatShortDate(localeTag, occurredAt);
        const group = { id: key, label, items: [item] };
        groupMap.set(key, group);
        groups.push(group);
      } else {
        groupMap.get(key)?.items.push(item);
      }
    }
    return groups;
  }, [categoryIcon, categoryLabel, currencyLabel, filteredTransactions, localeTag, t, walletMap]);

  const monthLabel = useMemo(() => formatMonthLabel(localeTag, today), [localeTag, today]);
  const totalSpentLabel = `${currencyLabel} ${formatAmountForSummary(totalSpent)}`;
  const transactionCountLabel = t("category.detail.transactions.count").replace(
    "{count}",
    String(filteredTransactions.length),
  );
  const comparisonPercentLabel = `${Math.abs(comparisonPercent)}%`;

  return {
    loading,
    category,
    categoryLabel,
    categoryIcon,
    categoryColor: category?.color ?? null,
    monthLabel,
    totalSpentLabel,
    transactionCountLabel,
    comparisonPercentLabel,
    comparisonDirection,
    dayGroups,
  };
}
