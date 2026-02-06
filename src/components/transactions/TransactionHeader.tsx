import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";
import Typography from "@/src/components/typography.component";

export interface TransactionHeaderProps {
  title: string;
  onClose: () => void;
  onHelp: () => void;
  helpLabel: string;
  closeLabel: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
}

export function TransactionHeader({
  title,
  onClose,
  onHelp,
  helpLabel,
  closeLabel,
  backgroundColor,
  textColor,
  accentColor,
}: TransactionHeaderProps) {
  return (
    <View style={[styles.header, { backgroundColor }]}>
      <Pressable
        onPress={onClose}
        hitSlop={10}
        style={({ pressed }) => [styles.headerIcon, pressed && { opacity: 0.6 }]}
        accessibilityRole="button"
        accessibilityLabel={closeLabel}
      >
        <Ionicons name="close" size={22} color={textColor} />
      </Pressable>
      <Typography style={[styles.headerTitle, { color: textColor }]}>
        {title}
      </Typography>
      <Pressable
        onPress={onHelp}
        hitSlop={10}
        style={({ pressed }) => [styles.helpButton, pressed && { opacity: 0.6 }]}
        accessibilityRole="button"
        accessibilityLabel={helpLabel}
      >
        <Typography style={[styles.helpText, { color: accentColor }]}>
          {helpLabel}
        </Typography>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 8,
  },
  headerIcon: {
    width: 44,
    height: 44,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  helpButton: {
    width: 44,
    height: 44,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  helpText: {
    fontSize: 14,
    fontWeight: "800",
  },
});
