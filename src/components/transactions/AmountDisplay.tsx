import { StyleSheet, Text, View } from "react-native";

export interface AmountDisplayProps {
  currency: string;
  formattedAmount: string;
  currencyColor: string;
  amountColor: string;
}

export function AmountDisplay({
  currency,
  formattedAmount,
  currencyColor,
  amountColor,
}: AmountDisplayProps) {
  return (
    <View style={styles.amountBlock}>
      <View style={styles.amountRow}>
        <Text style={[styles.currency, { color: currencyColor }]}>
          {currency}
        </Text>
        <Text style={[styles.amount, { color: amountColor }]} numberOfLines={1}>
          {formattedAmount}
        </Text>
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
  amount: {
    fontSize: 56,
    fontWeight: "900",
    letterSpacing: -1,
  },
});
