import type { SQLiteDatabase } from "expo-sqlite";

import { closeDatabase, getDatabase, resetDatabase } from "./database";
import { migrate } from "./migrations";
import { seedDatabase } from "./seed";

export { closeDatabase, getDatabase, migrate, resetDatabase };

export async function initializeDatabase(): Promise<SQLiteDatabase> {
  // if (__DEV__) {
  //   await resetDatabase();
  // }

  const db = await getDatabase();
  await migrate(db);
  await seedDatabase(db);
  return db;
}
