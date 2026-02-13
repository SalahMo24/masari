import { MaterialIcons } from "@/src/components/icons/legacyVectorIcons";

export type CategoryIconName = keyof typeof MaterialIcons.glyphMap;

const CATEGORY_ICON_MAP: Record<string, CategoryIconName> = {
  transportation: "directions-car",
  groceries: "shopping-basket",
  dining: "restaurant",
  bills: "receipt-long",
  subscription: "receipt",
  utilities: "bolt",
  rent: "home",
  loan: "payments",
  gym: "bolt",
  salary: "work",
  gift: "add-circle",
  "side-hustle": "work",
  refund: "payments",
  payback: "payments",
};

function normalizeCategoryName(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, "-").replace(/_/g, "-");
}

export function getCategoryIconName(
  name: string,
  icon: string | null,
): CategoryIconName {
  if (icon && icon in MaterialIcons.glyphMap) {
    return icon as CategoryIconName;
  }
  const normalizedName = normalizeCategoryName(name);
  return CATEGORY_ICON_MAP[normalizedName] ?? "category";
}
