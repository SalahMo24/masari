import { useTheme } from "@react-navigation/native";
import type { StyleProp, TextProps, TextStyle } from "react-native";
import { Text } from "react-native";

import type { AppTheme } from "../theme/theme";

type TypographyVariant =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "subtitle"
  | "body"
  | "small"
  | "caption"
  | "overline";

type TypographyProps = Omit<TextProps, "style"> & {
  variant?: TypographyVariant;
  color?: string;
  align?: TextStyle["textAlign"];
  weight?: TextStyle["fontWeight"];
  baseSize?: number;
  style?: StyleProp<TextStyle>;
};

const PHI = 1.618;
const DEFAULT_BASE_SIZE = 15;

const scaleSize = (base: number, step: number) =>
  Math.round(base * Math.pow(PHI, step));

const lineHeightFor = (fontSize: number) => {
  if (fontSize >= 30) {
    return Math.round(fontSize * 1.25);
  }
  if (fontSize >= 22) {
    return Math.round(fontSize * 1.35);
  }
  if (fontSize >= 18) {
    return Math.round(fontSize * 1.45);
  }
  return Math.round(fontSize * 1.5);
};

const buildVariantStyles = (baseSize: number) => {
  const h1 = scaleSize(baseSize, 2.1);
  const h2 = scaleSize(baseSize, 1.6);
  const h3 = scaleSize(baseSize, 1.2);
  const h4 = scaleSize(baseSize, 0.8);
  const h5 = scaleSize(baseSize, 0.5);
  const h6 = scaleSize(baseSize, 0.2);
  const subtitle = scaleSize(baseSize, 0.3);
  const body = scaleSize(baseSize, 0);
  const small = scaleSize(baseSize, -0.25);
  const caption = scaleSize(baseSize, -0.45);
  const overline = scaleSize(baseSize, -0.6);

  return {
    h1: { fontSize: h1, lineHeight: lineHeightFor(h1), fontWeight: "700" },
    h2: { fontSize: h2, lineHeight: lineHeightFor(h2), fontWeight: "700" },
    h3: { fontSize: h3, lineHeight: lineHeightFor(h3), fontWeight: "700" },
    h4: { fontSize: h4, lineHeight: lineHeightFor(h4), fontWeight: "600" },
    h5: { fontSize: h5, lineHeight: lineHeightFor(h5), fontWeight: "600" },
    h6: { fontSize: h6, lineHeight: lineHeightFor(h6), fontWeight: "600" },
    subtitle: {
      fontSize: subtitle,
      lineHeight: lineHeightFor(subtitle),
      fontWeight: "600",
    },
    body: { fontSize: body, lineHeight: lineHeightFor(body), fontWeight: "400" },
    small: {
      fontSize: small,
      lineHeight: lineHeightFor(small),
      fontWeight: "400",
    },
    caption: {
      fontSize: caption,
      lineHeight: lineHeightFor(caption),
      fontWeight: "400",
    },
    overline: {
      fontSize: overline,
      lineHeight: lineHeightFor(overline),
      fontWeight: "500",
      letterSpacing: 1,
      textTransform: "uppercase",
    },
  } as const;
};

const Typography = ({
  variant = "body",
  color,
  align,
  weight,
  baseSize = DEFAULT_BASE_SIZE,
  style,
  children,
  ...rest
}: TypographyProps) => {
  const { colors } = useTheme() as AppTheme;
  const variants = buildVariantStyles(baseSize);
  const variantStyle = variants[variant];

  return (
    <Text
      {...rest}
      style={[
        variantStyle,
        { color: color ?? colors.text, textAlign: align },
        weight ? { fontWeight: weight } : null,
        style,
      ]}
    >
      {children}
    </Text>
  );
};

export default Typography;
