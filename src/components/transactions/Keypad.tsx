import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

export interface KeypadProps {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onDecimal: () => void;
  onLongPressClear: () => void;
  border: string;
  background: string;
  text: string;
  accent: string;
}

type KeyType =
  | { type: "digit"; value: string }
  | { type: "decimal" }
  | { type: "zero" }
  | { type: "backspace" };

const KEYS: KeyType[] = [
  { type: "digit", value: "1" },
  { type: "digit", value: "2" },
  { type: "digit", value: "3" },
  { type: "digit", value: "4" },
  { type: "digit", value: "5" },
  { type: "digit", value: "6" },
  { type: "digit", value: "7" },
  { type: "digit", value: "8" },
  { type: "digit", value: "9" },
  { type: "decimal" },
  { type: "zero" },
  { type: "backspace" },
];

export function Keypad({
  onDigit,
  onBackspace,
  onDecimal,
  onLongPressClear,
  border,
  background,
  text,
  accent,
}: KeypadProps) {
  return (
    <View style={[styles.keypad, { borderTopColor: border }]}>
      <View style={styles.keypadGrid}>
        {KEYS.map((k, idx) => {
          const isRight = (idx + 1) % 3 === 0;
          const isBottom = idx >= 9;
          const cellBorders = {
            borderRightWidth: isRight ? 0 : 1,
            borderBottomWidth: isBottom ? 0 : 1,
            borderColor: border,
          } as const;

          if (k.type === "digit" || k.type === "zero") {
            const value = k.type === "zero" ? "0" : k.value;
            return (
              <Pressable
                key={`${k.type}-${value}`}
                onPress={() => onDigit(value)}
                style={({ pressed }) => [
                  styles.key,
                  cellBorders,
                  { backgroundColor: pressed ? `${background}88` : background },
                ]}
              >
                <Text style={[styles.keyText, { color: text }]}>{value}</Text>
              </Pressable>
            );
          }

          if (k.type === "decimal") {
            return (
              <Pressable
                key={`decimal-${idx}`}
                onPress={onDecimal}
                onLongPress={onLongPressClear}
                delayLongPress={450}
                style={({ pressed }) => [
                  styles.key,
                  styles.keyAccent,
                  cellBorders,
                  { backgroundColor: pressed ? `${background}88` : background },
                ]}
              >
                <Text style={[styles.keyPlus, { color: accent }]}>+</Text>
                <Text style={[styles.keyHint, { color: accent }]}>
                  Long-press -
                </Text>
              </Pressable>
            );
          }

          return (
            <Pressable
              key={`backspace-${idx}`}
              onPress={onBackspace}
              style={({ pressed }) => [
                styles.key,
                cellBorders,
                { backgroundColor: pressed ? `${background}88` : background },
              ]}
            >
              <MaterialIcons name="backspace" size={22} color={text} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  keypad: {
    borderTopWidth: 1,
  },
  keypadGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  key: {
    width: "33.3333%",
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  keyAccent: {
    paddingTop: 6,
  },
  keyText: {
    fontSize: 26,
    fontWeight: "600",
  },
  keyPlus: {
    fontSize: 32,
    fontWeight: "900",
    marginBottom: 2,
  },
  keyHint: {
    position: "absolute",
    bottom: 6,
    fontSize: 9,
    fontWeight: "800",
    opacity: 0.4,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
});
