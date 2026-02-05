import type React from "react";
import { I18nManager, StyleSheet, Text, View } from "react-native";

type CurrencyPosition = "prefix" | "suffix";

export interface AmountDisplayStyleOverrides {
  amountBlock?: React.ComponentProps<typeof View>["style"];
  amountRow?: React.ComponentProps<typeof View>["style"];
  amountContainer?: React.ComponentProps<typeof View>["style"];
  currency?: React.ComponentProps<typeof Text>["style"];
  digit?: React.ComponentProps<typeof Text>["style"];
  caret?: React.ComponentProps<typeof Text>["style"];
}

export interface AmountDisplayProps {
  currency: string;
  formattedAmount: string;
  integerDigitsEntered: number;
  decimalDigitsEntered: number;
  cursorPart: "int" | "dec";
  currencyColor: string;
  amountColor: string;
  showCaret?: boolean;
  currencyPosition?: CurrencyPosition;
  styles?: AmountDisplayStyleOverrides;
}

export function AmountDisplay({
  currency,
  formattedAmount,
  integerDigitsEntered,
  decimalDigitsEntered,
  cursorPart,
  currencyColor,
  amountColor,
  showCaret = true,
  currencyPosition = "prefix",
  styles: styleOverrides,
}: AmountDisplayProps) {
  const elements: React.ReactNode[] = [];

  const dotIndex = formattedAmount.indexOf(".");
  const integerEnd = dotIndex === -1 ? formattedAmount.length : dotIndex;

  let caretIndex: number;
  if (cursorPart === "dec" && dotIndex !== -1) {
    // In decimal mode: position after '.' plus entered decimal digits
    caretIndex = dotIndex + 1 + decimalDigitsEntered;
  } else {
    // In integer mode: position after `integerDigitsEntered` actual digits
    let digitCount = 0;
    caretIndex = 0;
    for (let i = 0; i < integerEnd; i++) {
      const char = formattedAmount[i];
      if (char >= "0" && char <= "9") {
        if (digitCount === integerDigitsEntered) {
          caretIndex = i;
          break;
        }
        digitCount++;
      }
    }
    // If we've passed all entered digits, caret goes at end of integer part
    if (digitCount === integerDigitsEntered && integerDigitsEntered > 0) {
      caretIndex = integerEnd;
    }
  }

  for (let i = 0; i < formattedAmount.length; i++) {
    const char = formattedAmount[i];
    if (showCaret && i === caretIndex) {
      elements.push(
        <Text key={`caret-${i}`} style={[styles.caret, { color: amountColor }, styleOverrides?.caret]}>
          |
        </Text>
      );
    }

    elements.push(
      <Text key={`char-${i}`} style={[styles.digit, { color: amountColor }, styleOverrides?.digit]}>
        {char}
      </Text>
    );
  }

  if (showCaret && caretIndex >= formattedAmount.length) {
    elements.push(
      <Text key="caret-end" style={[styles.caret, { color: amountColor }, styleOverrides?.caret]}>
        |
      </Text>
    );
  }

  const currencyNode = (
    <Text style={[styles.currency, { color: currencyColor }, styleOverrides?.currency]}>
      {currency}
    </Text>
  );

  return (
    <View style={[styles.amountBlock, styleOverrides?.amountBlock]}>
      <View style={[styles.amountRow, styleOverrides?.amountRow]}>
        {currencyPosition === "prefix" && currencyNode}
        <View
          style={[
            styles.amountContainer,
            I18nManager.isRTL && styles.amountContainerLtr,
            styleOverrides?.amountContainer,
          ]}
        >
          {elements}
        </View>
        {currencyPosition === "suffix" && currencyNode}
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
