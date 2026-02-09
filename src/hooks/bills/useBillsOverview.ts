import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import {
  addMonths,
  addYears,
  endOfMonth,
  isWithinInterval,
  startOfMonth,
} from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { Bill, ID } from "@/src/data/entities";
import { billRepository, transactionRepository } from "@/src/data/repositories";

type BillsOverview = {
  loading: boolean;
  monthLabel: string;
  totalAmount: number;
  remainingAmount: number;
  progressPercent: number;
  upcomingBills: Bill[];
  paidBills: Bill[];
  activeBillsCount: number;
  savingsEstimate: number | null;
  refresh: () => Promise<void>;
  markBillPaid: (bill: Bill, walletId?: ID | null, occurredAt?: Date) => Promise<boolean>;
};

const coerceBill = (bill: Bill): Bill => ({
  ...bill,
  active: Boolean(bill.active),
  paid: Boolean(bill.paid),
});

const advanceDueDate = (date: Date, frequency: Bill["frequency"]) => {
  if (frequency === "quarterly") return addMonths(date, 3);
  if (frequency === "yearly") return addYears(date, 1);
  return addMonths(date, 1);
};

export function useBillsOverview(locale: string): BillsOverview {
  const db = useSQLiteContext();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  const today = useMemo(() => new Date(), []);
  const monthStart = useMemo(() => startOfMonth(today), [today]);
  const monthEnd = useMemo(() => endOfMonth(today), [today]);
  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, { month: "long" }).format(today),
    [locale, today],
  );

  const rollForwardIfNeeded = useCallback(
    async (bill: Bill): Promise<Bill> => {
      const normalized = coerceBill(bill);
      if (!normalized.active) return normalized;

      const originalDate = new Date(normalized.next_due_date);
      let nextDate = originalDate;
      let updated = false;

      while (nextDate < monthStart) {
        nextDate = advanceDueDate(nextDate, normalized.frequency);
        updated = true;
      }

      if (!updated) return normalized;

      const nextIso = nextDate.toISOString();
      await billRepository.updateSchedule(db, {
        id: normalized.id,
        next_due_date: nextIso,
        paid: false,
      });

      return { ...normalized, next_due_date: nextIso, paid: false };
    },
    [db, monthStart],
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const billData = await billRepository.list(db);
      const normalizedBills = await Promise.all(
        billData.map((bill) => rollForwardIfNeeded(bill)),
      );
      setBills(normalizedBills);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [db, rollForwardIfNeeded]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      refresh();
      return () => undefined;
    }, [refresh]),
  );

  const monthBills = useMemo(() => {
    return bills.filter((bill) => {
      if (!bill.active) return false;
      const dueDate = new Date(bill.next_due_date);
      return isWithinInterval(dueDate, { start: monthStart, end: monthEnd });
    });
  }, [bills, monthEnd, monthStart]);

  const upcomingBills = useMemo(
    () => monthBills.filter((bill) => !bill.paid),
    [monthBills],
  );
  const paidBills = useMemo(
    () => monthBills.filter((bill) => bill.paid),
    [monthBills],
  );

  const totalAmount = useMemo(
    () => monthBills.reduce((sum, bill) => sum + bill.amount, 0),
    [monthBills],
  );
  const remainingAmount = useMemo(
    () => upcomingBills.reduce((sum, bill) => sum + bill.amount, 0),
    [upcomingBills],
  );
  const progressPercent = useMemo(() => {
    if (totalAmount <= 0) return 0;
    const paidAmount = Math.max(0, totalAmount - remainingAmount);
    return Math.min(100, Math.round((paidAmount / totalAmount) * 100));
  }, [remainingAmount, totalAmount]);

  const activeBills = useMemo(
    () => bills.filter((bill) => bill.active),
    [bills],
  );
  const activeBillsCount = activeBills.length;
  const savingsEstimate = useMemo(() => {
    if (activeBills.length < 2) return null;
    return Math.min(...activeBills.map((bill) => bill.amount));
  }, [activeBills]);

  const markBillPaid = useCallback(
    async (bill: Bill, walletId?: ID | null, occurredAt?: Date) => {
      const resolvedWalletId = walletId ?? bill.wallet_id;
      if (!resolvedWalletId) return false;
      try {
        await transactionRepository.createAndApply(db, {
          amount: bill.amount,
          type: "expense",
          category_id: bill.category_id ?? null,
          wallet_id: resolvedWalletId,
          target_wallet_id: null,
          note: bill.name,
          occurred_at: (occurredAt ?? new Date()).toISOString(),
        });
        await billRepository.setPaid(db, { id: bill.id, paid: true });
        await refresh();
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    },
    [db, refresh],
  );

  return {
    loading,
    monthLabel,
    totalAmount,
    remainingAmount,
    progressPercent,
    upcomingBills,
    paidBills,
    activeBillsCount,
    savingsEstimate,
    refresh,
    markBillPaid,
  };
}
