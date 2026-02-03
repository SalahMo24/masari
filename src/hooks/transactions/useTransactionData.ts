import { useCallback, useEffect, useState } from "react";
import { categoryRepository, walletRepository } from "@/src/data/repositories";
import type { Category, Wallet } from "@/src/data/entities";

export interface UseTransactionDataResult {
  wallets: Wallet[];
  categories: Category[];
  loading: boolean;
  refreshData: () => Promise<void>;
}

/**
 * Hook for fetching and managing transaction data (wallets and categories).
 */
export function useTransactionData(): UseTransactionDataResult {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const [w, c] = await Promise.all([
        walletRepository.list(),
        categoryRepository.list(),
      ]);
      setWallets(w);
      setCategories(c);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return {
    wallets,
    categories,
    loading,
    refreshData,
  };
}
