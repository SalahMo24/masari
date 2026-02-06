import Typography from "@/src/components/typography.component";
import type { Category, ID } from "@/src/data/entities";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

export interface CategoryChipsProps {
  categories: Category[];
  selectedId: ID | null;
  onSelect: (id: ID) => void;
  accent: string;
  border: string;
  text: string;
  muted: string;
  card: string;
  wrap?: boolean;
}

export function CategoryChips({
  categories,
  selectedId,
  onSelect,
  accent,
  border,
  muted,
  card,
  wrap,
}: CategoryChipsProps) {
  const containerStyle = wrap
    ? styles.chipWrap
    : [styles.chipRow, { paddingHorizontal: 16 }];

  const content = (
    <View style={[wrap ? styles.chipWrapInner : styles.chipRowInner]}>
      {categories.map((c) => {
        const active = c.id === selectedId;
        return (
          <Pressable
            key={c.id}
            onPress={() => onSelect(c.id)}
            style={({ pressed }) => [
              styles.chip,
              {
                borderColor: active ? accent : border,
                backgroundColor: active ? card : `${card}66`,
                opacity: pressed ? 0.85 : 1,
              },
              active && styles.chipActive,
            ]}
          >
            <Typography
              style={[
                styles.chipText,
                {
                  color: active ? accent : muted,
                  fontWeight: active ? "800" : "600",
                },
              ]}
            >
              {c.name}
            </Typography>
          </Pressable>
        );
      })}
    </View>
  );

  if (wrap) {
    return <View style={containerStyle as any}>{content}</View>;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={containerStyle as any}
      contentContainerStyle={{ paddingEnd: 16 }}
    >
      {content}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chipRow: {
    marginTop: 4,
  },
  chipRowInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
  },
  chipWrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  chipWrapInner: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipActive: {
    borderWidth: 2,
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  chipText: {
    fontSize: 12,
  },
});
