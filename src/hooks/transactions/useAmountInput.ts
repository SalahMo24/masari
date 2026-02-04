import { useCallback, useMemo, useState } from "react";

export interface UseAmountInputResult {
  /** Parsed numeric amount (non-negative, 2 decimals) */
  parsedAmount: number;
  /** Formatted amount with commas and decimals */
  formattedAmount: string;
  /** Number of integer digits entered */
  integerDigitsEntered: number;
  /** Number of decimal digits entered (0-2) */
  decimalDigitsEntered: number;
  /** Which part user is editing */
  cursorPart: "int" | "dec";
  /** Currently selected operator for the next operation */
  operator: "+" | "-";
  /** Handler for digit key press */
  onPressDigit: (digit: string) => void;
  /** Toggle editing between integer and decimal part */
  onPressDotToggle: () => void;
  /** Handler for backspace key press */
  onPressBackspace: () => void;
  /** Handler for long press to clear all */
  onLongPressClear: () => void;
  /** Select arithmetic operator for the calculator flow */
  onPressOperator: (op: "+" | "-") => void;
  /** Evaluate the pending operation */
  onPressEquals: () => void;
  /** Reset the amount input */
  reset: () => void;
}

/**
 * Hook for managing amount input state and keypad interactions.
 */
export function useAmountInput(): UseAmountInputResult {
  const [intPart, setIntPart] = useState<string>("");
  const [decPart, setDecPart] = useState<string>("");
  const [cursorPart, setCursorPart] = useState<"int" | "dec">("int");

  const [accumulator, setAccumulator] = useState<number | null>(null);
  const [pendingOp, setPendingOp] = useState<"+" | "-" | null>(null);
  const [operator, setOperator] = useState<"+" | "-">("+");
  const [justEvaluated, setJustEvaluated] = useState<boolean>(false);

  const currentValue = useMemo(() => {
    const intDigits = intPart || "0";
    const decDigits = (decPart + "00").slice(0, 2);
    const n = Number(`${intDigits}.${decDigits}`);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }, [decPart, intPart]);

  const parsedAmount = currentValue;

  const formattedAmount = useMemo(() => {
    const intDigits = intPart || "0";
    const decDigits = (decPart + "00").slice(0, 2);
    const withCommas = intDigits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `${withCommas}.${decDigits}`;
  }, [decPart, intPart]);

  const integerDigitsEntered = useMemo(() => {
    // Treat an implicit 0 as "not entered" unless user typed it.
    if (!intPart) return 0;
    return intPart.length;
  }, [intPart]);

  const decimalDigitsEntered = useMemo(() => decPart.length, [decPart]);

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

      if (cursorPart === "dec") {
        setDecPart((current) => (current.length >= 2 ? current : `${current}${digit}`));
        return;
      }

      setIntPart((current) => {
        if (!current) return digit;
        if (current.length >= 9) return current;
        if (current === "0") return digit === "0" ? current : digit;
        return `${current}${digit}`;
      });
    },
    [clearEntry, cursorPart, justEvaluated]
  );

  const onPressDotToggle = useCallback(() => {
    setCursorPart((current) => (current === "int" ? "dec" : "int"));
    setIntPart((current) => (current ? current : "0"));
  }, []);

  const onPressBackspace = useCallback(() => {
    setJustEvaluated(false);

    if (cursorPart === "dec") {
      if (decPart.length > 0) {
        setDecPart((current) => current.slice(0, -1));
        return;
      }
      setCursorPart("int");
      setIntPart((current) => (current.length ? current.slice(0, -1) : ""));
      return;
    }

    setIntPart((current) => (current.length ? current.slice(0, -1) : ""));
  }, [cursorPart, decPart.length]);

  const onLongPressClear = useCallback(() => {
    setAccumulator(null);
    setPendingOp(null);
    setOperator("+");
    setJustEvaluated(false);
    clearEntry();
  }, [clearEntry]);

  const applyOp = useCallback((left: number, op: "+" | "-", right: number) => {
    return op === "+" ? left + right : Math.max(0, left - right);
  }, []);

  const onPressOperator = useCallback(
    (op: "+" | "-") => {
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
        const nextAcc = applyOp(accumulator, pendingOp, right);
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
      applyOp,
      clearEntry,
      currentValue,
      decPart.length,
      intPart.length,
      pendingOp,
    ]
  );

  const onPressEquals = useCallback(() => {
    const rightOperandEntered = intPart.length > 0 || decPart.length > 0;
    if (!pendingOp || accumulator === null || !rightOperandEntered) return;

    const result = applyOp(accumulator, pendingOp, currentValue);
    const [nextInt, nextDec] = result.toFixed(2).split(".");
    setIntPart(nextInt);
    setDecPart(nextDec);
    setCursorPart("int");

    setAccumulator(null);
    setPendingOp(null);
    setOperator("+");
    setJustEvaluated(true);
  }, [accumulator, applyOp, currentValue, decPart.length, intPart.length, pendingOp]);

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
    reset,
  };
}
