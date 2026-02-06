import type { SQLiteDatabase } from "expo-sqlite";

import { generateId } from "@/src/utils/id";

async function getCount(db: SQLiteDatabase, table: string): Promise<number> {
  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM ${table};`
  );
  return row?.count ?? 0;
}

export async function seedDatabase(db: SQLiteDatabase): Promise<void> {
  // Seed only if empty.
  const walletCount = await getCount(db, "Wallet");
  const categoryCount = await getCount(db, "Category");

  const now = new Date().toISOString();

  if (!walletCount) {
    await db.runAsync(
      `INSERT INTO Wallet (id, name, type, balance, created_at) VALUES (?, ?, ?, ?, ?);`,
      [generateId("wallet"), "Cash", "cash", 0, now]
    );
    await db.runAsync(
      `INSERT INTO Wallet (id, name, type, balance, created_at) VALUES (?, ?, ?, ?, ?);`,
      [generateId("wallet"), "Bank", "bank", 0, now]
    );
  }

  if (!categoryCount) {
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
      { name: "loan", icon: null, color: null, is_custom: 0 },
      // Income-ish quick chips
      { name: "salary", icon: null, color: null, is_custom: 0 },
      { name: "gift", icon: null, color: null, is_custom: 0 },
      { name: "side-hustle", icon: null, color: null, is_custom: 0 },
      { name: "refund", icon: null, color: null, is_custom: 0 },
      { name: "payback", icon: null, color: null, is_custom: 0 },
    ];

    for (const c of categories) {
      await db.runAsync(
        `INSERT INTO Category (id, name, icon, color, is_custom, created_at) VALUES (?, ?, ?, ?, ?, ?);`,
        [generateId("cat"), c.name, c.icon, c.color, c.is_custom, now]
      );
    }
  }
}
