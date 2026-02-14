import migrations from "@/drizzle/migrations";
import { migrate as drizzleMigrate } from "drizzle-orm/expo-sqlite/migrator";
import type { SQLiteDatabase } from "expo-sqlite";
import { getDrizzleDb } from "./database";

async function hasTable(db: SQLiteDatabase, name: string): Promise<boolean> {
  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM sqlite_master WHERE type = 'table' AND name = ?;`,
    [name],
  );
  return (row?.count ?? 0) > 0;
}

async function getLegacyUserVersion(db: SQLiteDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version;",
  );
  return row?.user_version ?? 0;
}

async function getRowCount(db: SQLiteDatabase, tableName: string): Promise<number> {
  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM "${tableName}";`,
  );
  return row?.count ?? 0;
}

async function hasAnyAppTable(db: SQLiteDatabase): Promise<boolean> {
  const appTables = [
    "User",
    "Wallet",
    "Category",
    "Budget",
    "Transaction",
    "Bill",
    "BillPayment",
    "MonthlySummary",
    "AITokenLedger",
  ];

  const placeholders = appTables.map(() => "?").join(", ");
  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count
       FROM sqlite_master
      WHERE type = 'table'
        AND name IN (${placeholders});`,
    appTables,
  );
  return (row?.count ?? 0) > 0;
}

async function baselineLegacyDatabaseIfNeeded(db: SQLiteDatabase): Promise<void> {
  const migrationTableExists = await hasTable(db, "__drizzle_migrations");
  const hasMigrationMarkers = migrationTableExists
    ? (await getRowCount(db, "__drizzle_migrations")) > 0
    : false;
  if (hasMigrationMarkers) {
    return;
  }

  const hasExistingAppTables = await hasAnyAppTable(db);
  const legacyUserVersion = await getLegacyUserVersion(db);
  const hasLegacyDb = hasExistingAppTables || legacyUserVersion > 0;
  if (!hasLegacyDb) {
    return;
  }

  if (!migrationTableExists) {
    await db.execAsync(`CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
      id SERIAL PRIMARY KEY,
      hash text NOT NULL,
      created_at numeric
    );`);
  }

  const latestKnownMigrationMillis =
    migrations.journal.entries[migrations.journal.entries.length - 1]?.when ??
    Date.now();

  await db.runAsync(
    `INSERT INTO "__drizzle_migrations" ("hash", "created_at") VALUES (?, ?);`,
    ["legacy-baseline", latestKnownMigrationMillis],
  );
}

export async function migrate(db: SQLiteDatabase): Promise<void> {
  await db.execAsync("PRAGMA foreign_keys = ON;");
  await baselineLegacyDatabaseIfNeeded(db);

  const drizzleDb = getDrizzleDb(db);
  await drizzleMigrate(drizzleDb, migrations);
}
