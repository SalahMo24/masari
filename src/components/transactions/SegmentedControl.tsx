import type { TransactionType } from "@/src/data/entities";
import { Pressable, StyleSheet, View } from "react-native";
import Typography from "@/src/components/typography.component";

export interface SegmentedControlProps {
  value: TransactionType;
  onChange: (next: TransactionType) => void;
  accent: string;
  background: string;
  text: string;
  activeText: string;
  labels: Record<TransactionType, string>;
}

export function SegmentedControl({
  value,
  onChange,
  accent,
  background,
  text,
  activeText,
  labels,
}: SegmentedControlProps) {
  const items: { key: TransactionType; label: string }[] = [
    { key: "expense", label: labels.expense },
    { key: "income", label: labels.income },
    { key: "transfer", label: labels.transfer },
  ];

  return (
    <View style={[styles.segmentWrap, { backgroundColor: background }]}>
      {items.map((item) => {
        const active = item.key === value;
        return (
          <Pressable
            key={item.key}
            onPress={() => onChange(item.key)}
            style={({ pressed }) => [
              styles.segment,
              active && { backgroundColor: accent },
              pressed && { opacity: 0.9 },
            ]}
          >
            <Typography
              style={[
                styles.segmentText,
                { color: active ? activeText : text },
              ]}
              numberOfLines={1}
            >
              {item.label}
            </Typography>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  segmentWrap: {
    marginHorizontal: 16,
    marginTop: 4,
    borderRadius: 14,
    padding: 4,
    flexDirection: "row",
    gap: 4,
  },
  segment: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentText: {
    fontSize: 13,
    fontWeight: "800",
  },
});
