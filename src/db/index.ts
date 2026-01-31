import type { SQLiteDatabase } from "expo-sqlite";

import { closeDatabase, getDatabase } from "./database";
import { migrate } from "./migrations";

export { closeDatabase, getDatabase, migrate };

export async function initializeDatabase(): Promise<SQLiteDatabase> {
  const db = await getDatabase();
  await migrate(db);
  return db;
}
