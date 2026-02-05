import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

type BudgetSectionProps = {
  title: string;
  color: string;
  children: ReactNode;
};

export function BudgetSection({ title, color, children }: BudgetSectionProps) {
  return (
    <>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionDot, { backgroundColor: color }]} />
        <Text style={[styles.sectionTitle, { color }]}>{title}</Text>
      </View>
      <View style={styles.section}>{children}</View>
    </>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
});
