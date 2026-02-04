import type React from "react";
import { I18nManager, StyleSheet, Text, View } from "react-native";

export interface AmountDisplayProps {
  currency: string;
  formattedAmount: string;
  hasDecimalInput: boolean;
  integerDigitsEntered: number;
  decimalDigitsEntered: number;
  currencyColor: string;
  amountColor: string;
}

export function AmountDisplay({
  currency,
  formattedAmount,
  hasDecimalInput,
  integerDigitsEntered,
  decimalDigitsEntered,
  currencyColor,
  amountColor,
}: AmountDisplayProps) {
  const elements: React.ReactNode[] = [];
  let integerDigitsSeen = 0;
  let decimalDigitsSeen = 0;
  let passedDecimal = false;

  for (let i = 0; i < formattedAmount.length; i++) {
    const char = formattedAmount[i];
    const isDecimalPoint = char === ".";
    const isDigit = char >= "0" && char <= "9";

    // Place caret before integer digit if we haven't entered this digit yet
    if (isDigit && !passedDecimal) {
      if (integerDigitsSeen === integerDigitsEntered && !hasDecimalInput) {
        elements.push(
          <Text key={`caret-int-${i}`} style={[styles.caret, { color: amountColor }]}>
            |
          </Text>
        );
      }
      integerDigitsSeen += 1;
    }

    // Place caret before decimal point if we've entered all integer digits but no decimal
    if (isDecimalPoint && !hasDecimalInput && integerDigitsSeen === integerDigitsEntered && integerDigitsEntered > 0) {
      elements.push(
        <Text key="caret-before-decimal" style={[styles.caret, { color: amountColor }]}>
          |
        </Text>
      );
    }

    elements.push(
      <Text key={`char-${i}`} style={[styles.digit, { color: amountColor }]}>
        {char}
      </Text>
    );

    if (isDecimalPoint) {
      passedDecimal = true;
      // Place caret right after decimal point if user just entered decimal (no decimal digits yet)
      if (hasDecimalInput && decimalDigitsEntered === 0) {
        elements.push(
          <Text key="caret-after-decimal" style={[styles.caret, { color: amountColor }]}>
            |
          </Text>
        );
      }
    }

    // Track decimal digits and place caret after the entered ones
    if (isDigit && passedDecimal) {
      decimalDigitsSeen += 1;
      if (hasDecimalInput && decimalDigitsSeen === decimalDigitsEntered && decimalDigitsEntered > 0) {
        elements.push(
          <Text key={`caret-decimal-${i}`} style={[styles.caret, { color: amountColor }]}>
            |
          </Text>
        );
      }
    }
  }

  return (
    <View style={styles.amountBlock}>
      <View style={styles.amountRow}>
        <Text style={[styles.currency, { color: currencyColor }]}>
          {currency}
        </Text>
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
