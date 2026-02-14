import type { SQLiteDatabase } from "expo-sqlite";
import { sql } from "drizzle-orm";

import { generateId } from "@/src/utils/id";
import { getDrizzleDb } from "./database";
import { categoryTable, userTable } from "./schema";

async function getCount(
  db: SQLiteDatabase,
  table: typeof userTable | typeof categoryTable,
): Promise<number> {
  const drizzleDb = getDrizzleDb(db);
  const row = drizzleDb
    .select({ count: sql<number>`count(*)` })
    .from(table)
    .get();
  return row?.count ?? 0;
}

export async function seedDatabase(db: SQLiteDatabase): Promise<void> {
  const drizzleDb = getDrizzleDb(db);

  // Seed user only if empty.
  const userCount = await getCount(db, userTable);

  const now = new Date().toISOString();

  if (!userCount) {
    drizzleDb.insert(userTable).values({
      id: generateId("user"),
      created_at: now,
      currency: "EGP",
      locale: "ar-EG",
      onboarding_completed: false,
    }).onConflictDoNothing().run();
  }

  const categories: {
    name: string;
    icon: string | null;
    color: string | null;
    is_custom: number;
  }[] = [
    // Expense-ish
    { name: "transportation", icon: null, color: null, is_custom: 0 },
    { name: "groceries", icon: null, color: null, is_custom: 0 },
    { name: "dining", icon: null, color: null, is_custom: 0 },
    { name: "bills", icon: null, color: null, is_custom: 0 },
    { name: "subscription", icon: null, color: null, is_custom: 0 },
    { name: "utilities", icon: null, color: null, is_custom: 0 },
    { name: "rent", icon: null, color: null, is_custom: 0 },
    { name: "loan", icon: null, color: null, is_custom: 0 },
    { name: "gym", icon: null, color: null, is_custom: 0 },
    // Income-ish quick chips
    { name: "salary", icon: null, color: null, is_custom: 0 },
    { name: "gift", icon: null, color: null, is_custom: 0 },
    { name: "side-hustle", icon: null, color: null, is_custom: 0 },
    { name: "refund", icon: null, color: null, is_custom: 0 },
    { name: "payback", icon: null, color: null, is_custom: 0 },
  ];

  const existingCategoryNames = new Set(
    drizzleDb.select({ name: categoryTable.name }).from(categoryTable).all().map((row) => row.name),
  );

  const missingCategories = categories.filter((category) => !existingCategoryNames.has(category.name));

  if (missingCategories.length > 0) {
    drizzleDb.insert(categoryTable).values(
      missingCategories.map((c) => ({
        id: generateId("cat"),
        name: c.name,
        icon: c.icon,
        color: c.color,
        is_custom: Boolean(c.is_custom),
        created_at: now,
      })),
    ).onConflictDoNothing().run();
  }
}
