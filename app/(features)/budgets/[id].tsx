import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { useI18n } from "@/src/i18n/useI18n";
import { useAppTheme } from "@/src/theme/useAppTheme";

export default function BudgetDetailScreen() {
  const theme = useAppTheme();
  const { t } = useI18n();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {t("budget.detail.title")}
        </Text>
        <Text style={[styles.description, { color: theme.colors.mutedText }]}>
          {t("budget.detail.description")}
        </Text>
        <Pressable
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={() => router.push("/(features)/transactions/new")}
        >
          <Text style={styles.buttonText}>{t("budget.detail.cta")}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    width: "100%",
    gap: 12,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  description: {
    fontSize: 14,
    textAlign: "center",
  },
  button: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
});
