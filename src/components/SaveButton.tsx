import Typography from "@/src/components/typography.component";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const SAVE_BUTTON_BASE_HEIGHT = 80;

export interface SaveButtonProps {
  label: string;
  savingLabel: string;
  saving: boolean;
  onSave: () => void;
  accentColor: string;
  cardColor: string;
  borderColor: string;
  disabled?: boolean;
  disabledColor?: string;
}

export function SaveButton({
  label,
  savingLabel,
  saving,
  onSave,
  accentColor,
  cardColor,
  borderColor,
  disabled = false,
  disabledColor,
}: SaveButtonProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.ctaWrap,
        {
          // backgroundColor: cardColor,
          borderTopColor: borderColor,
          paddingBottom: insets.bottom + 12,
        },
      ]}
    >
      <Pressable
        onPress={onSave}
        disabled={saving || disabled}
        style={[
          styles.cta,
          {
            zIndex: 10,
            backgroundColor: disabled
              ? (disabledColor ?? accentColor)
              : accentColor,
          },
        ]}
      >
        <Typography style={styles.ctaText}>
          {saving ? savingLabel : label}
        </Typography>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  ctaWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    zIndex: 10,
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
