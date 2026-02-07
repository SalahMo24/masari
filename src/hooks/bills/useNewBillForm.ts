import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import type { SQLiteDatabase } from "expo-sqlite";

import type { BillFrequency, Category, ID, Wallet } from "@/src/data/entities";
import { billRepository } from "@/src/data/repositories";
import { computeNextDueDate } from "@/src/utils/bills/dates";

type UseNewBillFormParams = {
  t: (key: string) => string;
  db: SQLiteDatabase;
  router: { back: () => void };
  categories: Category[];
  wallets: Wallet[];
  parsedAmount: number;
  today: Date;
};

export function useNewBillForm({
  t,
  db,
  router,
  categories,
  wallets,
  parsedAmount,
  today,
}: UseNewBillFormParams) {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<ID | null>(null);
  const [walletId, setWalletId] = useState<ID | null>(null);
  const [frequency, setFrequency] = useState<BillFrequency>("monthly");
  const [dueDay, setDueDay] = useState<number>(Math.min(28, today.getDate()));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!selectedCategoryId && categories.length) {
      setSelectedCategoryId(categories[0]?.id ?? null);
    }
  }, [categories, selectedCategoryId]);

  useEffect(() => {
    if (!walletId && wallets.length) {
      setWalletId(wallets[0]?.id ?? null);
    }
  }, [walletId, wallets]);

  const onBack = useCallback(() => {
    if (step === 2) {
      setStep(1);
      return;
    }
    router.back();
  }, [router, step]);

  const onNext = useCallback(() => {
    if (!name.trim()) {
      Alert.alert(t("bill.new.error.title"), t("bill.new.error.name"));
      return;
    }
    if (!parsedAmount || parsedAmount <= 0) {
      Alert.alert(t("bill.new.error.title"), t("bill.new.error.amount"));
      return;
    }
    if (!selectedCategoryId) {
      Alert.alert(t("bill.new.error.title"), t("bill.new.error.category"));
      return;
    }
    setStep(2);
  }, [name, parsedAmount, selectedCategoryId, t]);

  const onSave = useCallback(async () => {
    if (saving) return;
    if (!selectedCategoryId) {
      Alert.alert(t("bill.new.error.title"), t("bill.new.error.category"));
      return;
    }
    if (!walletId) {
      Alert.alert(t("bill.new.error.title"), t("bill.new.error.wallet"));
      return;
    }
    if (!parsedAmount || parsedAmount <= 0) {
      Alert.alert(t("bill.new.error.title"), t("bill.new.error.amount"));
      return;
    }
    if (!name.trim()) {
      Alert.alert(t("bill.new.error.title"), t("bill.new.error.name"));
      return;
    }

    try {
      setSaving(true);
      const nextDueDate = computeNextDueDate(today, dueDay, frequency);
      await billRepository.create(db, {
        name: name.trim(),
        amount: parsedAmount,
        frequency,
        category_id: selectedCategoryId,
        wallet_id: walletId,
        next_due_date: nextDueDate.toISOString(),
        active: true,
        paid: false,
      });
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert(t("bill.new.error.title"), t("bill.new.error.save"));
    } finally {
      setSaving(false);
    }
  }, [
    db,
    dueDay,
    frequency,
    name,
    parsedAmount,
    router,
    saving,
    selectedCategoryId,
    t,
    today,
    walletId,
  ]);

  return {
    step,
    name,
    setName,
    selectedCategoryId,
    setSelectedCategoryId,
    walletId,
    setWalletId,
    frequency,
    setFrequency,
    dueDay,
    setDueDay,
    saving,
    onBack,
    onNext,
    onSave,
  };
}
