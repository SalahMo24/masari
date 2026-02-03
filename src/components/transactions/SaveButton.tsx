import { Pressable, StyleSheet, Text, View } from "react-native";

export interface SaveButtonProps {
  label: string;
  savingLabel: string;
  saving: boolean;
  onSave: () => void;
  accentColor: string;
  cardColor: string;
  borderColor: string;
}

export function SaveButton({
  label,
  savingLabel,
  saving,
  onSave,
  accentColor,
  cardColor,
  borderColor,
}: SaveButtonProps) {
  return (
    <View
      style={[
        styles.ctaWrap,
        { backgroundColor: cardColor, borderTopColor: borderColor },
      ]}
    >
      <Pressable
        onPress={onSave}
        disabled={saving}
        style={({ pressed }) => [
          styles.cta,
          {
            backgroundColor: accentColor,
            opacity: saving ? 0.6 : pressed ? 0.9 : 1,
          },
        ]}
      >
        <Text style={styles.ctaText}>{saving ? savingLabel : label}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  ctaWrap: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cta: {
    height: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.2,
  },
});
