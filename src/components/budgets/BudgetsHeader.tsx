import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

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
      <Text style={[styles.headerTitle, { color: colors.text }]}>{title}</Text>
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
