import type { SQLiteDatabase } from "expo-sqlite";

import { closeDatabase, getDatabase, resetDatabase } from "./database";
import { migrate } from "./migrations";
import { seedDatabase } from "./seed";

export { closeDatabase, getDatabase, migrate, resetDatabase };

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
