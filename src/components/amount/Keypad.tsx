import { MaterialIcons } from "@/src/components/icons/legacyVectorIcons";
import type React from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import Typography from "@/src/components/typography.component";

export type KeypadKey =
  | { type: "digit"; value: string }
  | { type: "zero" }
  | { type: "dot" }
  | { type: "plus" }
  | { type: "minus" }
  | { type: "equals" }
  | { type: "backspace" }
  | { type: "spacer" };

export interface KeypadProps {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onDotToggle?: () => void;
  onLongPressClear?: () => void;
  onOperator?: (op: "+" | "-") => void;
  onEquals?: () => void;
  operator?: "+" | "-";
  cursorPart?: "int" | "dec";
  border: string;
  background: string;
  text: string;
  accent: string;
  keys?: KeypadKey[];
  columns?: number;
  showKeyBorders?: boolean;
  pressedBackground?: string;
  styleOverrides?: {
    keypad?: React.ComponentProps<typeof View>["style"];
    keypadGrid?: React.ComponentProps<typeof View>["style"];
    key?: React.ComponentProps<typeof Pressable>["style"];
    keyText?: React.ComponentProps<typeof Text>["style"];
    keyOp?: React.ComponentProps<typeof Text>["style"];
    keyAccent?: React.ComponentProps<typeof Pressable>["style"];
    keyActive?: React.ComponentProps<typeof Pressable>["style"];
  };
}

const DEFAULT_COLUMNS = 4;
const DEFAULT_KEYS: KeypadKey[] = [
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
  operator = "+",
  cursorPart = "int",
  border,
  background,
  text,
  accent,
  keys = DEFAULT_KEYS,
  columns = DEFAULT_COLUMNS,
  showKeyBorders = true,
  pressedBackground,
  styleOverrides,
}: KeypadProps) {
  const cellWidth = `${100 / columns}%`;
  const basePressed =
    pressedBackground ??
    (background === "transparent" ? "#00000022" : `${background}88`);

  return (
    <View
      style={[
        styles.keypad,
        { borderTopColor: border },
        styleOverrides?.keypad,
      ]}
    >
      <View style={[styles.keypadGrid, styleOverrides?.keypadGrid]}>
        {keys.map((k, idx) => {
          const isRight = (idx + 1) % columns === 0;
          const isBottom = idx >= keys.length - columns;
          const cellBorders = showKeyBorders
            ? ({
                borderRightWidth: isRight ? 0 : 1,
                borderBottomWidth: isBottom ? 0 : 1,
                borderColor: border,
              } as const)
            : undefined;

          const keyBaseStyles: StyleProp<ViewStyle>[] = [
            styles.key,
            cellBorders,
            { width: cellWidth as unknown as number },
            styleOverrides?.key as unknown as StyleProp<ViewStyle>,
          ];

          if (k.type === "spacer") {
            return <View key={`spacer-${idx}`} style={keyBaseStyles} />;
          }

          if (k.type === "digit" || k.type === "zero") {
            const value = k.type === "zero" ? "0" : k.value;
            return (
              <Pressable
                key={`${k.type}-${value}`}
                onPress={() => onDigit(value)}
                style={({ pressed }) => [
                  ...keyBaseStyles,
                  { backgroundColor: pressed ? basePressed : background },
                ]}
              >
                <Typography
                  variant="h4"
                  style={[
                    styles.keyText,
                    { color: text },
                    styleOverrides?.keyText,
                  ]}
                >
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
                onPress={() => onDotToggle?.()}
                style={({ pressed }) => [
                  ...keyBaseStyles,
                  isActive && styles.keyActive,
                  isActive && styleOverrides?.keyActive,
                  { backgroundColor: pressed ? basePressed : background },
                ]}
              >
                <Typography
                  variant="h4"
                  style={[
                    styles.keyText,
                    { color: isActive ? accent : text },
                    styleOverrides?.keyText,
                  ]}
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
                onPress={() => onOperator?.("+")}
                style={({ pressed }) => [
                  ...keyBaseStyles,
                  styles.keyAccent,
                  styleOverrides?.keyAccent,
                  { backgroundColor: pressed ? basePressed : background },
                ]}
              >
                <Typography
                  variant="h4"
                  style={[
                    styles.keyOp,
                    { color: isActive ? accent : text },
                    styleOverrides?.keyOp,
                  ]}
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
                onPress={() => onOperator?.("-")}
                style={({ pressed }) => [
                  ...keyBaseStyles,
                  styles.keyAccent,
                  styleOverrides?.keyAccent,
                  { backgroundColor: pressed ? basePressed : background },
                ]}
              >
                <Typography
                  variant="h4"
                  style={[
                    styles.keyOp,
                    { color: isActive ? accent : text },
                    styleOverrides?.keyOp,
                  ]}
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
                onPress={() => onEquals?.()}
                style={({ pressed }) => [
                  ...keyBaseStyles,
                  styles.keyAccent,
                  styleOverrides?.keyAccent,
                  { backgroundColor: pressed ? basePressed : background },
                ]}
              >
                <Typography
                  variant="h4"
                  style={[
                    styles.keyOp,
                    { color: accent },
                    styleOverrides?.keyOp,
                  ]}
                >
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
                ...keyBaseStyles,
                { backgroundColor: pressed ? basePressed : background },
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
