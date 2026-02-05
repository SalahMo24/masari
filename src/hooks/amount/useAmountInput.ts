import { useCallback, useMemo, useState } from "react";

export type CursorPart = "int" | "dec";
export type Operator = "+" | "-";

export interface AmountInputStrategy {
  maxIntegerDigits?: number;
  maxDecimalDigits?: number;
  allowDecimal?: boolean;
  allowOperators?: boolean;
  allowEquals?: boolean;
  formatAmount?: (intPart: string, decPart: string, maxDecimalDigits: number) => string;
  parseAmount?: (intPart: string, decPart: string, maxDecimalDigits: number) => number;
  applyOperator?: (left: number, op: Operator, right: number) => number;
}

export interface UseAmountInputResult {
  /** Parsed numeric amount (non-negative) */
  parsedAmount: number;
  /** Formatted amount string */
  formattedAmount: string;
  /** Number of integer digits entered */
  integerDigitsEntered: number;
  /** Number of decimal digits entered (0-maxDecimalDigits) */
  decimalDigitsEntered: number;
  /** Which part user is editing */
  cursorPart: CursorPart;
  /** Currently selected operator for the next operation */
  operator: Operator;
  /** Handler for digit key press */
  onPressDigit: (digit: string) => void;
  /** Toggle editing between integer and decimal part */
  onPressDotToggle: () => void;
  /** Handler for backspace key press */
  onPressBackspace: () => void;
  /** Handler for long press to clear all */
  onLongPressClear: () => void;
  /** Select arithmetic operator for the calculator flow */
  onPressOperator: (op: Operator) => void;
  /** Evaluate the pending operation */
  onPressEquals: () => void;
  /** Set a specific amount value */
  setAmount: (value: number) => void;
  /** Reset the amount input */
  reset: () => void;
}

const defaultFormatAmount = (
  intPart: string,
  decPart: string,
  maxDecimalDigits: number
) => {
  const intDigits = intPart || "0";
  const withCommas = intDigits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  if (maxDecimalDigits <= 0) {
    return withCommas;
  }
  const decDigits = (decPart + "0".repeat(maxDecimalDigits)).slice(0, maxDecimalDigits);
  return `${withCommas}.${decDigits}`;
};

const defaultParseAmount = (
  intPart: string,
  decPart: string,
  maxDecimalDigits: number
) => {
  const intDigits = intPart || "0";
  const decDigits =
    maxDecimalDigits <= 0 ? "" : (decPart + "0".repeat(maxDecimalDigits)).slice(0, maxDecimalDigits);
  const raw = maxDecimalDigits <= 0 ? intDigits : `${intDigits}.${decDigits}`;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

const defaultApplyOperator = (left: number, op: Operator, right: number) => {
  return op === "+" ? left + right : Math.max(0, left - right);
};

/**
 * Hook for managing amount input state and keypad interactions.
 * Accepts a strategy object to customize behavior and formatting.
 */
export function useAmountInput(strategy?: AmountInputStrategy): UseAmountInputResult {
  const allowDecimal = strategy?.allowDecimal ?? true;
  const maxDecimalDigits =
    strategy?.maxDecimalDigits ?? (allowDecimal ? 2 : 0);
  const maxIntegerDigits = strategy?.maxIntegerDigits ?? 9;
  const allowOperators = strategy?.allowOperators ?? true;
  const allowEquals = strategy?.allowEquals ?? true;
  const formatAmount = strategy?.formatAmount ?? defaultFormatAmount;
  const parseAmount = strategy?.parseAmount ?? defaultParseAmount;
  const applyOperator = strategy?.applyOperator ?? defaultApplyOperator;

  const [intPart, setIntPart] = useState<string>("");
  const [decPart, setDecPart] = useState<string>("");
  const [cursorPart, setCursorPart] = useState<CursorPart>("int");

  const [accumulator, setAccumulator] = useState<number | null>(null);
  const [pendingOp, setPendingOp] = useState<Operator | null>(null);
  const [operator, setOperator] = useState<Operator>("+");
  const [justEvaluated, setJustEvaluated] = useState<boolean>(false);

  const currentValue = useMemo(() => {
    return parseAmount(intPart, decPart, maxDecimalDigits);
  }, [decPart, intPart, maxDecimalDigits, parseAmount]);

  const parsedAmount = currentValue;

  const formattedAmount = useMemo(() => {
    return formatAmount(intPart, decPart, maxDecimalDigits);
  }, [decPart, formatAmount, intPart, maxDecimalDigits]);

  const integerDigitsEntered = useMemo(() => {
    // Treat an implicit 0 as "not entered" unless user typed it.
    if (!intPart) return 0;
    return intPart.length;
  }, [intPart]);

  const decimalDigitsEntered = useMemo(() => {
    if (maxDecimalDigits <= 0) return 0;
    return Math.min(decPart.length, maxDecimalDigits);
  }, [decPart.length, maxDecimalDigits]);

  const clearEntry = useCallback(() => {
    setIntPart("");
    setDecPart("");
    setCursorPart("int");
  }, []);

  const onPressDigit = useCallback(
    (digit: string) => {
      if (!/^\d$/.test(digit)) return;

      if (justEvaluated) {
        setAccumulator(null);
        setPendingOp(null);
        setOperator("+");
        setJustEvaluated(false);
        clearEntry();
      }

      if (cursorPart === "dec" && maxDecimalDigits > 0) {
        setDecPart((current) =>
          current.length >= maxDecimalDigits ? current : `${current}${digit}`
        );
        return;
      }

      setIntPart((current) => {
        if (!current) return digit;
        if (current.length >= maxIntegerDigits) return current;
        if (current === "0") return digit === "0" ? current : digit;
        return `${current}${digit}`;
      });
    },
    [
      clearEntry,
      cursorPart,
      justEvaluated,
      maxDecimalDigits,
      maxIntegerDigits,
    ]
  );

  const onPressDotToggle = useCallback(() => {
    if (!allowDecimal || maxDecimalDigits <= 0) return;
    setCursorPart((current) => (current === "int" ? "dec" : "int"));
    setIntPart((current) => (current ? current : "0"));
  }, [allowDecimal, maxDecimalDigits]);

  const onPressBackspace = useCallback(() => {
    setJustEvaluated(false);

    if (cursorPart === "dec" && maxDecimalDigits > 0) {
      if (decPart.length > 0) {
        setDecPart((current) => current.slice(0, -1));
        return;
      }
      setCursorPart("int");
      setIntPart((current) => (current.length ? current.slice(0, -1) : ""));
      return;
    }

    setIntPart((current) => (current.length ? current.slice(0, -1) : ""));
  }, [cursorPart, decPart.length, maxDecimalDigits]);

  const onLongPressClear = useCallback(() => {
    setAccumulator(null);
    setPendingOp(null);
    setOperator("+");
    setJustEvaluated(false);
    clearEntry();
  }, [clearEntry]);

  const onPressOperator = useCallback(
    (op: Operator) => {
      if (!allowOperators) return;

      setOperator(op);
      setJustEvaluated(false);

      const rightOperandEntered = intPart.length > 0 || decPart.length > 0;
      const right = currentValue;

      if (accumulator === null) {
        setAccumulator(right);
        setPendingOp(op);
        clearEntry();
        return;
      }

      if (pendingOp && rightOperandEntered) {
        const nextAcc = applyOperator(accumulator, pendingOp, right);
        setAccumulator(nextAcc);
        setPendingOp(op);
        clearEntry();
        return;
      }

      setPendingOp(op);
      clearEntry();
    },
    [
      accumulator,
      allowOperators,
      applyOperator,
      clearEntry,
      currentValue,
      decPart.length,
      intPart.length,
      pendingOp,
    ]
  );

  const onPressEquals = useCallback(() => {
    if (!allowEquals) return;
    const rightOperandEntered = intPart.length > 0 || decPart.length > 0;
    if (!pendingOp || accumulator === null || !rightOperandEntered) return;

    const result = applyOperator(accumulator, pendingOp, currentValue);
    const fixed =
      maxDecimalDigits > 0
        ? result.toFixed(maxDecimalDigits)
        : Math.round(result).toString();
    const [nextInt, nextDec = ""] = fixed.split(".");
    setIntPart(nextInt);
    setDecPart(nextDec);
    setCursorPart("int");

    setAccumulator(null);
    setPendingOp(null);
    setOperator("+");
    setJustEvaluated(true);
  }, [
    accumulator,
    allowEquals,
    applyOperator,
    currentValue,
    decPart.length,
    intPart.length,
    maxDecimalDigits,
    pendingOp,
  ]);

  const setAmount = useCallback(
    (value: number) => {
      const safeValue = Number.isFinite(value) && value >= 0 ? value : 0;
      const fixed =
        maxDecimalDigits > 0
          ? safeValue.toFixed(maxDecimalDigits)
          : Math.round(safeValue).toString();
      const [nextInt, nextDec = ""] = fixed.split(".");
      setIntPart(nextInt);
      setDecPart(nextDec.slice(0, maxDecimalDigits));
      setCursorPart("int");
      setAccumulator(null);
      setPendingOp(null);
      setOperator("+");
      setJustEvaluated(false);
    },
    [maxDecimalDigits]
  );

  const reset = useCallback(() => {
    setAccumulator(null);
    setPendingOp(null);
    setOperator("+");
    setJustEvaluated(false);
    clearEntry();
  }, [clearEntry]);

  return {
    parsedAmount,
    formattedAmount,
    integerDigitsEntered,
    decimalDigitsEntered,
    cursorPart,
    operator,
    onPressDigit,
    onPressDotToggle,
    onPressBackspace,
    onLongPressClear,
    onPressOperator,
    onPressEquals,
    setAmount,
    reset,
  };
}
