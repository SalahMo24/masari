import type React from "react";
import { I18nManager, StyleSheet, View } from "react-native";
import Typography from "@/src/components/typography.component";

export interface AmountDisplayProps {
  currency: string;
  formattedAmount: string;
  integerDigitsEntered: number;
  decimalDigitsEntered: number;
  cursorPart: "int" | "dec";
  currencyColor: string;
  amountColor: string;
}

export function AmountDisplay({
  currency,
  formattedAmount,
  integerDigitsEntered,
  decimalDigitsEntered,
  cursorPart,
  currencyColor,
  amountColor,
}: AmountDisplayProps) {
  const elements: React.ReactNode[] = [];

  // Find caret position based on entered digits (accounting for commas in int part)
  const dotIndex = formattedAmount.indexOf(".");

  let caretIndex: number;
  if (cursorPart === "dec") {
    // In decimal mode: position after '.' plus entered decimal digits
    caretIndex = dotIndex + 1 + decimalDigitsEntered;
  } else {
    // In integer mode: position after `integerDigitsEntered` actual digits
    let digitCount = 0;
    caretIndex = 0;
    for (let i = 0; i < dotIndex; i++) {
      const char = formattedAmount[i];
      if (char >= "0" && char <= "9") {
        if (digitCount === integerDigitsEntered) {
          caretIndex = i;
          break;
        }
        digitCount++;
      }
    }
    // If we've passed all entered digits, caret goes at dotIndex
    if (digitCount === integerDigitsEntered && integerDigitsEntered > 0) {
      caretIndex = dotIndex;
    }
  }

  for (let i = 0; i < formattedAmount.length; i++) {
    const char = formattedAmount[i];
    if (i === caretIndex) {
      elements.push(
        <Typography
          key={`caret-${i}`}
          style={[styles.caret, { color: amountColor }]}
        >
          |
        </Typography>
      );
    }

    elements.push(
      <Typography
        key={`char-${i}`}
        style={[styles.digit, { color: amountColor }]}
      >
        {char}
      </Typography>
    );
  }

  if (caretIndex >= formattedAmount.length) {
    elements.push(
      <Typography key="caret-end" style={[styles.caret, { color: amountColor }]}>
        |
      </Typography>
    );
  }

  return (
    <View style={styles.amountBlock}>
      <View style={styles.amountRow}>
        <Typography style={[styles.currency, { color: currencyColor }]}>
          {currency}
        </Typography>
        <View
          style={[
            styles.amountContainer,
            I18nManager.isRTL && styles.amountContainerLtr,
          ]}
        >
          {elements}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  amountBlock: {
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    paddingHorizontal: 16,
  },
  currency: {
    fontSize: 18,
    fontWeight: "600",
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  amountContainerLtr: {
    flexDirection: "row-reverse",
  },
  digit: {
    fontSize: 56,
    fontWeight: "900",
    letterSpacing: -1,
  },
  caret: {
    fontSize: 56,
    fontWeight: "200",
  },
});
