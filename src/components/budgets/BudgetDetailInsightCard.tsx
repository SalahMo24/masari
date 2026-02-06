import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

import Typography from "@/src/components/typography.component";

type BudgetDetailInsightCardProps = {
  title: string;
  insightText: string;
  ctaLabel: string;
  onPress: () => void;
  isRtl: boolean;
  colors: {
    text: string;
    muted: string;
    accent: string;
  };
};

export function BudgetDetailInsightCard({
  title,
  insightText,
  ctaLabel,
  onPress,
  isRtl,
  colors,
}: BudgetDetailInsightCardProps) {
  return (
    <View style={styles.section}>
      <View
        style={[
          styles.card,
          {
            borderColor: `${colors.accent}33`,
            backgroundColor: `${colors.accent}14`,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <MaterialIcons name="lightbulb" size={18} color={colors.accent} />
          <Typography variant="subtitle" style={[styles.title, { color: colors.text }]}>
            {title}
          </Typography>
        </View>
        <Typography
          variant="small"
          style={[styles.bodyText, { color: colors.muted }]}
        >
          {insightText}
        </Typography>
        <Pressable onPress={onPress} style={styles.ctaRow}>
          <Typography variant="caption" style={[styles.ctaText, { color: colors.accent }]}>
            {ctaLabel}
          </Typography>
          <MaterialIcons
            name={isRtl ? "arrow-back-ios" : "arrow-forward-ios"}
            size={12}
            color={colors.accent}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    gap: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
  },
  bodyText: {
    fontSize: 12,
    lineHeight: 18,
  },
  ctaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ctaText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
});
