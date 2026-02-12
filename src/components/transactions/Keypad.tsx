import { MaterialIcons } from "@/src/components/icons/legacyVectorIcons";
import { Pressable, StyleSheet, View } from "react-native";
import Typography from "@/src/components/typography.component";

export interface KeypadProps {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onDotToggle: () => void;
  onLongPressClear: () => void;
  onOperator: (op: "+" | "-") => void;
  onEquals: () => void;
  operator: "+" | "-";
  cursorPart: "int" | "dec";
  border: string;
  background: string;
  text: string;
  accent: string;
}

type KeyType =
  | { type: "digit"; value: string }
  | { type: "zero" }
  | { type: "dot" }
  | { type: "plus" }
  | { type: "minus" }
  | { type: "equals" }
  | { type: "backspace" }
  | { type: "spacer" };

const COLUMNS = 4;
const KEYS: KeyType[] = [
  { type: "digit", value: "1" },
  { type: "digit", value: "2" },
  { type: "digit", value: "3" },
  { type: "plus" },

  { type: "digit", value: "4" },
  { type: "digit", value: "5" },
  { type: "digit", value: "6" },
  { type: "minus" },

  { type: "digit", value: "7" },
  { type: "digit", value: "8" },
  { type: "digit", value: "9" },
  { type: "backspace" },

  { type: "dot" },
  { type: "zero" },
  { type: "equals" },
  { type: "spacer" },
];

export function Keypad({
  onDigit,
  onBackspace,
  onLongPressClear,
  onDotToggle,
  onOperator,
  onEquals,
  operator,
  cursorPart,
  border,
  background,
  text,
  accent,
}: KeypadProps) {
  return (
    <View style={[styles.keypad, { borderTopColor: border }]}>
      <View style={styles.keypadGrid}>
        {KEYS.map((k, idx) => {
          const isRight = (idx + 1) % COLUMNS === 0;
          const isBottom = idx >= KEYS.length - COLUMNS;
          const cellBorders = {
            borderRightWidth: isRight ? 0 : 1,
            borderBottomWidth: isBottom ? 0 : 1,
            borderColor: border,
          } as const;

          if (k.type === "spacer") {
            return <View key={`spacer-${idx}`} style={[styles.key, cellBorders]} />;
          }

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
                <Typography style={[styles.keyText, { color: text }]}>
                  {value}
                </Typography>
              </Pressable>
            );
          }

          if (k.type === "dot") {
            const isActive = cursorPart === "dec";
            return (
              <Pressable
                key={`dot-${idx}`}
                onPress={onDotToggle}
                style={({ pressed }) => [
                  styles.key,
                  isActive && styles.keyActive,
                  cellBorders,
                  { backgroundColor: pressed ? `${background}88` : background },
                ]}
              >
                <Typography
                  style={[styles.keyText, { color: isActive ? accent : text }]}
                >
                  .
                </Typography>
              </Pressable>
            );
          }

          if (k.type === "plus") {
            const isActive = operator === "+";
            return (
              <Pressable
                key={`plus-${idx}`}
                onPress={() => onOperator("+")}
                style={({ pressed }) => [
                  styles.key,
                  styles.keyAccent,
                  cellBorders,
                  { backgroundColor: pressed ? `${background}88` : background },
                ]}
              >
                <Typography
                  style={[styles.keyOp, { color: isActive ? accent : text }]}
                >
                  +
                </Typography>
              </Pressable>
            );
          }

          if (k.type === "minus") {
            const isActive = operator === "-";
            return (
              <Pressable
                key={`minus-${idx}`}
                onPress={() => onOperator("-")}
                style={({ pressed }) => [
                  styles.key,
                  styles.keyAccent,
                  cellBorders,
                  { backgroundColor: pressed ? `${background}88` : background },
                ]}
              >
                <Typography
                  style={[styles.keyOp, { color: isActive ? accent : text }]}
                >
                  -
                </Typography>
              </Pressable>
            );
          }

          if (k.type === "equals") {
            return (
              <Pressable
                key={`equals-${idx}`}
                onPress={onEquals}
                style={({ pressed }) => [
                  styles.key,
                  styles.keyAccent,
                  cellBorders,
                  { backgroundColor: pressed ? `${background}88` : background },
                ]}
              >
                <Typography style={[styles.keyOp, { color: accent }]}>
                  =
                </Typography>
              </Pressable>
            );
          }

          return (
            <Pressable
              key={`backspace-${idx}`}
              onPress={onBackspace}
              onLongPress={onLongPressClear}
              delayLongPress={450}
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
    direction: "ltr",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  key: {
    width: "25%",
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  keyAccent: {
    paddingTop: 2,
  },
  keyActive: {
    backgroundColor: "transparent",
  },
  keyText: {
    fontSize: 26,
    fontWeight: "600",
  },
  keyOp: {
    fontSize: 30,
    fontWeight: "900",
  },
});
