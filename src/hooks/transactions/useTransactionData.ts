import type { Category, Wallet } from "@/src/data/entities";
import { categoryRepository, walletRepository } from "@/src/data/repositories";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useState } from "react";

export interface UseTransactionDataResult {
  wallets: Wallet[];
  categories: Category[];
  frequentCategories: Category[];
  loading: boolean;
  refreshData: () => Promise<void>;
}

/**
 * Hook for fetching and managing transaction data (wallets and categories).
 */
export function useTransactionData(): UseTransactionDataResult {
  const db = useSQLiteContext();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [frequentCategories, setFrequentCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const [w, c, frequent] = await Promise.all([
        walletRepository.list(db),
        categoryRepository.list(db),
        categoryRepository.listTopUsed(db, { limit: 5 }),
      ]);
      setWallets(w);
      setCategories(c);
      setFrequentCategories(frequent);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return {
    wallets,
    categories,
    frequentCategories,
    loading,
    refreshData,
  };
}
