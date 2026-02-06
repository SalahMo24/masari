import { Pressable, StyleSheet, View } from "react-native";
import Typography from "@/src/components/typography.component";

type BudgetEmptyStateProps = {
  title: string;
  description: string;
  ctaLabel: string;
  onPress: () => void;
  colors: {
    text: string;
    muted: string;
    border: string;
    card: string;
    primary: string;
  };
};

export function BudgetEmptyState({
  title,
  description,
  ctaLabel,
  onPress,
  colors,
}: BudgetEmptyStateProps) {
  return (
    <View style={styles.section}>
      <View
        style={[
          styles.emptyCard,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Typography
          variant="subtitle"
          style={[styles.emptyTitle, { color: colors.text }]}
        >
          {title}
        </Typography>
        <Typography
          variant="small"
          style={[styles.emptyBody, { color: colors.muted }]}
        >
          {description}
        </Typography>
        <Pressable
          style={[styles.emptyButton, { backgroundColor: colors.primary }]}
          onPress={onPress}
        >
          <Typography variant="small" style={styles.emptyButtonText}>
            {ctaLabel}
          </Typography>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    gap: 12,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  emptyBody: {
    fontSize: 13,
    textAlign: "center",
  },
  emptyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
});
