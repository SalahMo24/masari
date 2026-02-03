import type { ID, TransactionType, Wallet } from "@/src/data/entities";
import { useEffect, useMemo, useState } from "react";

export interface UseWalletSelectionResult {
  /** Selected wallet ID for expense/income modes */
  walletId: ID | null;
  /** Source wallet ID for transfer mode */
  fromWalletId: ID | null;
  /** Destination wallet ID for transfer mode */
  toWalletId: ID | null;
  /** Selected wallet object for expense/income modes */
  activeWallet: Wallet | null;
  /** Source wallet object for transfer mode */
  fromWallet: Wallet | null;
  /** Destination wallet object for transfer mode */
  toWallet: Wallet | null;
  /** Set the wallet ID for expense/income */
  setWalletId: (id: ID | null) => void;
  /** Set the source wallet ID for transfer */
  setFromWalletId: (id: ID | null) => void;
  /** Set the destination wallet ID for transfer */
  setToWalletId: (id: ID | null) => void;
}

/**
 * Hook for managing wallet selection state across different transaction modes.
 */
export function useWalletSelection(
  wallets: Wallet[],
  mode: TransactionType
): UseWalletSelectionResult {
  const [walletId, setWalletId] = useState<ID | null>(null);
  const [fromWalletId, setFromWalletId] = useState<ID | null>(null);
  const [toWalletId, setToWalletId] = useState<ID | null>(null);

  // Set default selections when wallets load
  useEffect(() => {
    if (!wallets.length) return;
    if (!walletId) {
      setWalletId(wallets[0]?.id ?? null);
    }
    if (!fromWalletId) {
      setFromWalletId(wallets[0]?.id ?? null);
    }
    if (!toWalletId) {
      if (wallets.length > 1) {
        setToWalletId(wallets[1]?.id ?? null);
      } else {
        setToWalletId(wallets[0]?.id ?? null);
      }
    }
  }, [wallets, walletId, fromWalletId, toWalletId]);

  const activeWallet = useMemo(() => {
    if (mode === "transfer") return null;
    return wallets.find((w) => w.id === walletId) ?? null;
  }, [mode, wallets, walletId]);

  const fromWallet = useMemo(
    () => wallets.find((w) => w.id === fromWalletId) ?? null,
    [wallets, fromWalletId]
  );

  const toWallet = useMemo(
    () => wallets.find((w) => w.id === toWalletId) ?? null,
    [wallets, toWalletId]
  );

  return {
    walletId,
    fromWalletId,
    toWalletId,
    activeWallet,
    fromWallet,
    toWallet,
    setWalletId,
    setFromWalletId,
    setToWalletId,
  };
}
