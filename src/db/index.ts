import type { SQLiteDatabase } from "expo-sqlite";

import {
  closeDatabase,
  getDatabase,
  getDrizzleDb,
  resetDatabase,
  type AppDatabase,
} from "./database";
import { migrate } from "./migrations";
import { seedDatabase } from "./seed";

export { closeDatabase, getDatabase, getDrizzleDb, migrate, resetDatabase };
export type { AppDatabase };

let migrationsRun = false;
let seedRun = false;

export async function initializeDatabase(db: SQLiteDatabase): Promise<void> {
  if (!migrationsRun) {
    await migrate(db);
    migrationsRun = true;
  }
  if (!seedRun) {
    await seedDatabase(db);
    seedRun = true;
  }
}
