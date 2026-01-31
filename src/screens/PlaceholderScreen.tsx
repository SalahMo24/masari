import { StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "@/src/theme/useAppTheme";

type PlaceholderScreenProps = {
  title: string;
  description?: string;
};

export function PlaceholderScreen({
  title,
  description,
}: PlaceholderScreenProps) {
  const theme = useAppTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
      {description ? (
        <Text style={[styles.description, { color: theme.colors.mutedText }]}>
          {description}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    textAlign: "center",
  },
});
