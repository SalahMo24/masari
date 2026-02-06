import { Pressable, StyleSheet, View } from "react-native";

import Typography from "@/src/components/typography.component";

type BudgetPaceSectionProps = {
  paceText: string;
  actionLabel: string;
  onPress: () => void;
  colors: {
    text: string;
    muted: string;
    border: string;
    card: string;
  };
};

export function BudgetPaceSection({
  paceText,
  actionLabel,
  onPress,
  colors,
}: BudgetPaceSectionProps) {
  return (
    <View style={styles.section}>
      <Typography variant="small" style={[styles.paceText, { color: colors.muted }]}>
        {paceText}
      </Typography>
      <Pressable
        onPress={onPress}
        style={[
          styles.button,
          { borderColor: colors.border, backgroundColor: colors.card },
        ]}
      >
        <Typography variant="caption" style={[styles.buttonText, { color: colors.text }]}>
          {actionLabel}
        </Typography>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  paceText: {
    fontSize: 13,
    lineHeight: 18,
  },
  button: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: "700",
  },
});
