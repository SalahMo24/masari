/**
 * Amount utility functions for transaction input handling.
 */

/**
 * Appends a decimal point to the current amount string.
 * Returns "0." if empty, or the current string if it already contains a decimal.
 */
export function appendDecimal(current: string): string {
  if (!current) return "0.";
  if (current.includes(".")) return current;
  return `${current}.`;
}

/**
 * Appends a digit to the current amount string with validation.
 * Prevents excessive leading zeros and limits decimal places to 2.
 */
export function appendDigit(current: string, digit: string): string {
  if (!/^\d$/.test(digit)) return current;
  if (!current) return digit;

  // Prevent excessive leading zeros like "000".
  if (current === "0") return digit;

  const dot = current.indexOf(".");
  if (dot !== -1) {
    const decimals = current.length - dot - 1;
    if (decimals >= 2) return current;
  } else if (current.length >= 9) {
    // Basic guardrail.
    return current;
  }

  return `${current}${digit}`;
}

/**
 * Parses an amount string into a number, rounded to 2 decimal places.
 * Returns 0 for invalid or negative inputs.
 */
export function parseAmount(input: string): number {
  const cleaned = input.trim();
  if (!cleaned || cleaned === ".") return 0;
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n < 0) return 0;
  // Round to 2 decimals to match storage/display.
  return Math.round(n * 100) / 100;
}

/**
 * Formats an amount string for display with comma separators and 2 decimal places.
 */
export function formatAmount(input: string): string {
  const n = parseAmount(input);
  const [intPart, decPart] = n.toFixed(2).split(".");
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${withCommas}.${decPart}`;
}

/**
 * Formats a number for summary display.
 * Shows integers without decimals, otherwise shows up to 2 decimal places.
 */
export function formatAmountForSummary(n: number): string {
  if (!n || n <= 0) return "0";
  const fixed = Number.isInteger(n) ? String(n) : n.toFixed(2);
  const [intPart, decPart] = fixed.split(".");
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decPart ? `${withCommas}.${decPart}` : withCommas;
}
