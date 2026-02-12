import { MaterialIcons } from "@/src/components/icons/legacyVectorIcons";

import type { BudgetOverviewCategory } from "./useBudgetOverview";

export type MaterialIconName = keyof typeof MaterialIcons.glyphMap;
export type BudgetCardItem = BudgetOverviewCategory;
