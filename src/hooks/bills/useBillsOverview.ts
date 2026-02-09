import { addMonths, addYears, endOfMonth, startOfDay } from "date-fns";
import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { Bill, BillFrequency, ID } from "@/src/data/entities";
import {
  billPaymentRepository,
  billRepository,
  transactionRepository,
} from "@/src/data/repositories";

type BillsOverview = {
  loading: boolean;
  monthLabel: string;
  totalAmount: number;
  remainingAmount: number;
  progressPercent: number;
  billsByFrequency: Record<
    BillFrequency,
    {
      unpaid: Bill[];
      paid: Bill[];
    }
  >;
  frequenciesWithBills: BillFrequency[];
  activeBillsCount: number;
  savingsEstimate: number | null;
  refresh: () => Promise<void>;
  markBillPaid: (
    bill: Bill,
    walletId?: ID | null,
    occurredAt?: Date,
  ) => Promise<boolean>;
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

const getPeriodEnd = (date: Date, frequency: Bill["frequency"]) => {
  if (frequency === "monthly") return endOfMonth(date);
  if (frequency === "quarterly") return endOfMonth(addMonths(date, 2));
  return endOfMonth(addMonths(date, 11));
};

export function useBillsOverview(locale: string): BillsOverview {
  const db = useSQLiteContext();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, { month: "long" }).format(anchorDate),
    [anchorDate, locale],
  );

  const rollForwardIfNeeded = useCallback(
    async (bill: Bill, referenceDate: Date): Promise<Bill> => {
      const normalized = coerceBill(bill);
      if (!normalized.active) return normalized;

      const originalDate = new Date(normalized.next_due_date);
      let nextDate = originalDate;
      let periodEnd = getPeriodEnd(nextDate, normalized.frequency);
      const referenceDay = startOfDay(referenceDate);
      let updated = false;

      while (referenceDay > periodEnd) {
        nextDate = advanceDueDate(nextDate, normalized.frequency);
        periodEnd = getPeriodEnd(nextDate, normalized.frequency);
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
    [db],
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const now = new Date();
      setAnchorDate(now);
      const billData = await billRepository.list(db);
      const normalizedBills = await Promise.all(
        billData.map((bill) => rollForwardIfNeeded(bill, now)),
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

  const activeBills = useMemo(
    () => bills.filter((bill) => bill.active),
    [bills],
  );

  const billsByFrequency = useMemo(() => {
    const buckets: BillsOverview["billsByFrequency"] = {
      monthly: { unpaid: [], paid: [] },
      quarterly: { unpaid: [], paid: [] },
      yearly: { unpaid: [], paid: [] },
    };
    activeBills.forEach((bill) => {
      const key = bill.paid ? "paid" : "unpaid";
      buckets[bill.frequency][key].push(bill);
    });
    return buckets;
  }, [activeBills]);

  const frequenciesWithBills = useMemo(() => {
    const allFrequencies: BillFrequency[] = ["monthly", "quarterly", "yearly"];
    return allFrequencies.filter((frequency) => {
      const group = billsByFrequency[frequency];
      return group.paid.length + group.unpaid.length > 0;
    });
  }, [billsByFrequency]);

  const totalAmount = useMemo(
    () => activeBills.reduce((sum, bill) => sum + bill.amount, 0),
    [activeBills],
  );
  const remainingAmount = useMemo(
    () =>
      activeBills.reduce(
        (sum, bill) => sum + (bill.paid ? 0 : bill.amount),
        0,
      ),
    [activeBills],
  );
  const progressPercent = useMemo(() => {
    if (totalAmount <= 0) return 0;
    const paidAmount = Math.max(0, totalAmount - remainingAmount);
    return Math.min(100, Math.round((paidAmount / totalAmount) * 100));
  }, [remainingAmount, totalAmount]);

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
        await billPaymentRepository.create(db, {
          bill_id: bill.id,
          amount: bill.amount,
          wallet_id: resolvedWalletId,
          paid_at: (occurredAt ?? new Date()).toISOString(),
          status: "cleared",
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
    billsByFrequency,
    frequenciesWithBills,
    activeBillsCount,
    savingsEstimate,
    refresh,
    markBillPaid,
  };
}
