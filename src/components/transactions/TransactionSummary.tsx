import { StyleSheet, View } from "react-native";
import type { TransactionType } from "@/src/data/entities";
import Typography from "@/src/components/typography.component";

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
      <Typography style={styles.summary}>
        {mode === "expense" ? (
          <Typography style={{ color: dangerColor, fontWeight: "800" }}>
            {summary}
          </Typography>
        ) : (
          <Typography style={{ color: accentColor, fontWeight: "800" }}>
            {summary}
          </Typography>
        )}
      </Typography>
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
