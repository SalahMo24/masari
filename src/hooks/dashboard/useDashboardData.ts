import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useState } from "react";

import type { Category, Transaction, Wallet } from "@/src/data/entities";
import {
  categoryRepository,
  transactionRepository,
  walletRepository,
} from "@/src/data/repositories";

export interface UseDashboardDataResult {
  wallets: Wallet[];
  transactions: Transaction[];
  categories: Category[];
  loading: boolean;
  refreshData: () => Promise<void>;
}

/**
 * Fetch dashboard data and refetch on screen focus.
 */
export function useDashboardData(): UseDashboardDataResult {
  const db = useSQLiteContext();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const [walletData, transactionData, categoryData] = await Promise.all([
        walletRepository.list(db),
        transactionRepository.list(db),
        categoryRepository.list(db),
      ]);
      setWallets(walletData);
      setTransactions(transactionData);
      setCategories(categoryData);
    } catch (error) {
      console.error(error);
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
    }, [refreshData]),
  );

  return {
    wallets,
    transactions,
    categories,
    loading,
    refreshData,
  };
}
