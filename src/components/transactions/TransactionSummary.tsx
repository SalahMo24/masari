import { StyleSheet, Text, View } from "react-native";
import type { TransactionType } from "@/src/data/entities";

export interface TransactionSummaryProps {
  summary: string;
  mode: TransactionType;
  dangerColor: string;
  accentColor: string;
}

export function TransactionSummary({
  summary,
  mode,
  dangerColor,
  accentColor,
}: TransactionSummaryProps) {
  return (
    <View style={styles.summaryWrap}>
      <Text style={styles.summary}>
        {mode === "expense" ? (
          <Text style={{ color: dangerColor, fontWeight: "800" }}>
            {summary}
          </Text>
        ) : (
          <Text style={{ color: accentColor, fontWeight: "800" }}>{summary}</Text>
        )}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryWrap: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  summary: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: "700",
  },
});
