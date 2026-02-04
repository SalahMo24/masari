import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";

import {
  categoryRepository,
  transactionRepository,
  walletRepository,
} from "@/src/data/repositories";
import type { Category, Transaction, Wallet } from "@/src/data/entities";

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
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const [walletData, transactionData, categoryData] = await Promise.all([
        walletRepository.list(),
        transactionRepository.list(),
        categoryRepository.list(),
      ]);
      setWallets(walletData);
      setTransactions(transactionData);
      setCategories(categoryData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useFocusEffect(
    useCallback(() => {
      refreshData();
      return () => undefined;
    }, [refreshData])
  );

  return {
    wallets,
    transactions,
    categories,
    loading,
    refreshData,
  };
}
