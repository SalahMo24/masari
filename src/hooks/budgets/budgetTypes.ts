import { MaterialIcons } from "@expo/vector-icons";

import type { BudgetOverviewCategory } from "./useBudgetOverview";

export type MaterialIconName = keyof typeof MaterialIcons.glyphMap;
export type BudgetCardItem = BudgetOverviewCategory;
