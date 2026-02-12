import { HugeiconsIcon } from "@hugeicons/react-native";
import type { ComponentProps, ReactElement } from "react";
import {
  Add01Icon,
  AddCircleIcon,
  AiMagicIcon,
  Analytics02Icon,
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  BankIcon,
  Bolt,
  Calendar01Icon,
  Cancel01Icon,
  Car01Icon,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  CoinsSwapIcon,
  DarkModeIcon,
  Delete02Icon,
  Edit01Icon,
  FilterIcon,
  GridViewIcon,
  Home01Icon,
  InformationCircleIcon,
  Lightbulb,
  LightbulbOff,
  Payment01Icon,
  Person,
  PieChart01Icon,
  Power,
  Receipt,
  ReceiptText,
  Restaurant01Icon,
  Settings01Icon,
  Share01Icon,
  ShoppingBasket01Icon,
  ShoppingCart01Icon,
  SparklesIcon,
  TranslateIcon,
  TrendingDown,
  TrendingUp,
  Warning,
  Wallet01Icon,
  WorkIcon,
} from "@hugeicons/core-free-icons";

const legacyIconMap = {
  "account-balance": BankIcon,
  "account-balance-wallet": Wallet01Icon,
  add: Add01Icon,
  "add-circle": AddCircleIcon,
  analytics: Analytics02Icon,
  "arrow-back-ios": ArrowLeft01Icon,
  "arrow-forward-ios": ArrowRight01Icon,
  "auto-awesome": AiMagicIcon,
  backspace: Delete02Icon,
  bolt: Bolt,
  "calendar-month": Calendar01Icon,
  category: GridViewIcon,
  "check-circle": CheckCircle,
  "chevron-left": ChevronLeft,
  "chevron-right": ChevronRight,
  close: Cancel01Icon,
  "dark-mode": DarkModeIcon,
  "directions-car": Car01Icon,
  "edit-note": Edit01Icon,
  "expand-more": ArrowDown01Icon,
  "filter-list": FilterIcon,
  home: Home01Icon,
  info: InformationCircleIcon,
  "information-circle-outline": InformationCircleIcon,
  insights: Analytics02Icon,
  lightbulb: Lightbulb,
  "lightbulb-outline": LightbulbOff,
  payments: Payment01Icon,
  person: Person,
  "pie-chart": PieChart01Icon,
  "power-settings-new": Power,
  receipt: Receipt,
  "receipt-long": ReceiptText,
  "report-problem": Warning,
  restaurant: Restaurant01Icon,
  settings: Settings01Icon,
  share: Share01Icon,
  "shopping-basket": ShoppingBasket01Icon,
  "shopping-cart": ShoppingCart01Icon,
  sparkles: SparklesIcon,
  "swap-horiz": CoinsSwapIcon,
  "trending-down": TrendingDown,
  "trending-flat": Analytics02Icon,
  "trending-up": TrendingUp,
  translate: TranslateIcon,
  "verified-user": CheckCircle,
  warning: Warning,
  "warning-amber": Warning,
  "error-outline": Warning,
  work: WorkIcon,
} as const;

export type AppIconName = keyof typeof legacyIconMap;

const glyphMap = Object.fromEntries(
  Object.keys(legacyIconMap).map((key) => [key, key]),
) as Record<AppIconName, AppIconName>;

type LegacyIconProps = {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: ComponentProps<typeof HugeiconsIcon>["style"];
};

function LegacyIcon({
  name,
  size = 24,
  color = "black",
  strokeWidth = 1.8,
  style,
}: LegacyIconProps) {
  const icon = legacyIconMap[name as AppIconName] ?? GridViewIcon;
  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      style={style}
    />
  );
}

type LegacyIconComponent = ((props: LegacyIconProps) => ReactElement) & {
  glyphMap: Record<AppIconName, AppIconName>;
};

export const MaterialIcons = Object.assign(LegacyIcon, {
  glyphMap,
}) as LegacyIconComponent;

export const Ionicons = Object.assign(LegacyIcon, {
  glyphMap,
}) as LegacyIconComponent;
