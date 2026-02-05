import * as SQLite from "expo-sqlite";

const DB_NAME = "masari.db";

let database: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!database) {
    database = await SQLite.openDatabaseAsync(DB_NAME);
    await database.execAsync("PRAGMA foreign_keys = ON;");
  }

  return database;
}

export async function closeDatabase(): Promise<void> {
  if (database) {
    await database.closeAsync();
    database = null;
  }
}

export async function resetDatabase(): Promise<void> {
  if (!__DEV__) {
    throw new Error("resetDatabase is only allowed in development.");
  }

  await closeDatabase();
  await SQLite.deleteDatabaseAsync(DB_NAME);
}
