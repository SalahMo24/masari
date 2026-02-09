import type { SQLiteDatabase } from "expo-sqlite";

import type { Category } from "@/src/data/entities";
import { categoryRepository } from "@/src/data/repositories";

export const BILL_CATEGORY_NAMES = ["subscription", "utilities", "rent"] as const;

export function isBillCategory(category: Category) {
  return BILL_CATEGORY_NAMES.includes(category.name as (typeof BILL_CATEGORY_NAMES)[number]);
}

export async function ensureBillCategories(db: SQLiteDatabase): Promise<boolean> {
  const existing = await categoryRepository.list(db);
  const existingNames = new Set(existing.map((category) => category.name));
  let created = false;

  for (const name of BILL_CATEGORY_NAMES) {
    if (existingNames.has(name)) continue;
    await categoryRepository.create(db, {
      name,
      icon: null,
      color: null,
      is_custom: false,
    });
    created = true;
  }

  return created;
}
