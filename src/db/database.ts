import * as SQLite from "expo-sqlite";

const DB_NAME = "masari.db";

let database: SQLite.SQLiteDatabase | null = null;

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
    getAllDatabasesAsync?: () => Promise<Array<{ name: string }>>;
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
