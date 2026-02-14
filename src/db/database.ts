import * as SQLite from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { schema } from "./schema";

const DB_NAME = "masari.db";

let database: SQLite.SQLiteDatabase | null = null;
const drizzleInstances = new WeakMap<SQLite.SQLiteDatabase, AppDatabase>();

function createDrizzleDatabase(db: SQLite.SQLiteDatabase) {
  return drizzle(db, { schema });
}

export type AppDatabase = ReturnType<typeof createDrizzleDatabase>;

export function getDrizzleDb(db: SQLite.SQLiteDatabase): AppDatabase {
  const existing = drizzleInstances.get(db);
  if (existing) {
    return existing;
  }
  const instance = createDrizzleDatabase(db);
  drizzleInstances.set(db, instance);
  return instance;
}

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!database) {
    database = await SQLite.openDatabaseAsync(DB_NAME);
    await database.execAsync("PRAGMA foreign_keys = ON;");
    await database.execAsync("PRAGMA busy_timeout = 5000;");
  }

  return database;
}

export async function closeDatabase(): Promise<void> {
  if (database) {
    drizzleInstances.delete(database);
    await database.closeAsync();
    database = null;
  }
}

export async function resetDatabase(): Promise<void> {
  if (!__DEV__) {
    throw new Error("resetDatabase is only allowed in development.");
  }

  await closeDatabase();
  const sqliteWithList = SQLite as typeof SQLite & {
    getAllDatabasesAsync?: () => Promise<{ name: string }[]>;
  };
  const databases = await sqliteWithList.getAllDatabasesAsync?.();
  const exists = databases
    ? databases.some((db) => db.name === DB_NAME)
    : false;
  if (!exists) {
    return;
  }

  await SQLite.deleteDatabaseAsync(DB_NAME);
}
