import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";
import Typography from "@/src/components/typography.component";

type BudgetsHeaderProps = {
  title: string;
  toggleLabel: string;
  hideAmounts: boolean;
  onToggleHide: () => void;
  colors: {
    text: string;
    muted: string;
    border: string;
    success: string;
  };
};

export function BudgetsHeader({
  title,
  toggleLabel,
  hideAmounts,
  onToggleHide,
  colors,
}: BudgetsHeaderProps) {
  return (
    <View style={[styles.header, { borderBottomColor: colors.border }]}>
      <View style={styles.headerIcon}>
        <MaterialIcons name="shield" size={20} color={colors.success} />
      </View>
      <Typography
        variant="h6"
        style={[styles.headerTitle, { color: colors.text }]}
      >
        {title}
      </Typography>
      <Pressable
        style={styles.headerButton}
        onPress={onToggleHide}
        accessibilityRole="button"
        accessibilityLabel={toggleLabel}
      >
        <MaterialIcons
          name={hideAmounts ? "visibility-off" : "visibility"}
          size={20}
          color={colors.muted}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerIcon: {
    width: 40,
    alignItems: "flex-start",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
  },
  headerButton: {
    width: 40,
    alignItems: "flex-end",
  },
});
