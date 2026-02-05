import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

type BudgetInsightCardProps = {
  insightText: string;
  ctaLabel: string;
  onPress: () => void;
  isRtl: boolean;
  colors: {
    text: string;
    success: string;
  };
};

export function BudgetInsightCard({
  insightText,
  ctaLabel,
  onPress,
  isRtl,
  colors,
}: BudgetInsightCardProps) {
  return (
    <View style={styles.section}>
      <View
        style={[
          styles.insightCard,
          {
            backgroundColor: `${colors.success}12`,
            borderColor: `${colors.success}33`,
          },
        ]}
      >
        <View
          style={[
            styles.insightIcon,
            { backgroundColor: `${colors.success}33` },
          ]}
        >
          <MaterialIcons name="insights" size={20} color={colors.success} />
        </View>
        <View style={styles.insightBody}>
          <Text style={[styles.insightText, { color: colors.text }]}>
            {insightText}
          </Text>
          <Pressable onPress={onPress} style={styles.insightLink}>
            <Text style={[styles.insightLinkText, { color: colors.success }]}>
              {ctaLabel}
            </Text>
            <MaterialIcons
              name={isRtl ? "arrow-back-ios" : "arrow-forward-ios"}
              size={12}
              color={colors.success}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  insightCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    flexDirection: "row",
    gap: 12,
  },
  insightIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  insightBody: {
    flex: 1,
    gap: 8,
  },
  insightText: {
    fontSize: 13,
    fontWeight: "600",
  },
  insightLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  insightLinkText: {
    fontSize: 12,
    fontWeight: "700",
  },
});
