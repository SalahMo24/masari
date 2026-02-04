import { useCallback, useMemo, useState } from "react";
import {
  appendDecimal,
  appendDigit,
  formatAmount,
  parseAmount,
} from "@/src/utils/amount";

export interface UseAmountInputResult {
  /** Raw input string */
  amountInput: string;
  /** Parsed numeric amount (rounded to 2 decimals) */
  parsedAmount: number;
  /** Formatted amount with commas and decimals */
  formattedAmount: string;
  /** Whether user has entered the decimal point */
  hasDecimalInput: boolean;
  /** Number of integer digits entered */
  integerDigitsEntered: number;
  /** Number of decimal digits entered (0-2) */
  decimalDigitsEntered: number;
  /** Handler for digit key press */
  onPressDigit: (digit: string) => void;
  /** Handler for decimal key press */
  onPressDecimal: () => void;
  /** Handler for backspace key press */
  onPressBackspace: () => void;
  /** Handler for long press to clear all */
  onLongPressClear: () => void;
  /** Reset the amount input */
  reset: () => void;
}

/**
 * Hook for managing amount input state and keypad interactions.
 */
export function useAmountInput(): UseAmountInputResult {
  const [amountInput, setAmountInput] = useState<string>("");

  const parsedAmount = useMemo(() => parseAmount(amountInput), [amountInput]);
  const formattedAmount = useMemo(() => formatAmount(amountInput), [amountInput]);
  const hasDecimalInput = useMemo(() => amountInput.includes("."), [amountInput]);
  const integerDigitsEntered = useMemo(() => {
    const intPart = amountInput.split(".")[0] || "";
    return intPart.replace(/\D/g, "").length;
  }, [amountInput]);
  const decimalDigitsEntered = useMemo(() => {
    if (!hasDecimalInput) return 0;
    const decPart = amountInput.split(".")[1] || "";
    return decPart.length;
  }, [amountInput, hasDecimalInput]);

  const onPressDigit = useCallback((digit: string) => {
    setAmountInput((current) => appendDigit(current, digit));
  }, []);

  const onPressDecimal = useCallback(() => {
    setAmountInput((current) => appendDecimal(current));
  }, []);

  const onPressBackspace = useCallback(() => {
    setAmountInput((current) => (current.length ? current.slice(0, -1) : ""));
  }, []);

  const onLongPressClear = useCallback(() => {
    setAmountInput("");
  }, []);

  const reset = useCallback(() => {
    setAmountInput("");
  }, []);

  return {
    amountInput,
    parsedAmount,
    formattedAmount,
    hasDecimalInput,
    integerDigitsEntered,
    decimalDigitsEntered,
    onPressDigit,
    onPressDecimal,
    onPressBackspace,
    onLongPressClear,
    reset,
  };
}
