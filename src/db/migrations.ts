import type { SQLiteDatabase } from "expo-sqlite";

type Migration = {
  version: number;
  statements: string[];
};

const migrations: Migration[] = [
  {
    version: 1,
    statements: [
      `CREATE TABLE IF NOT EXISTS "User" (
        id TEXT PRIMARY KEY,
        created_at TEXT,
        currency TEXT DEFAULT 'EGP',
        locale TEXT DEFAULT 'ar-EG'
      );`,
      `CREATE TABLE IF NOT EXISTS Wallet (
        id TEXT PRIMARY KEY,
        name TEXT,
        type TEXT CHECK(type IN ('cash', 'bank')),
        balance REAL,
        created_at TEXT
      );`,
      `CREATE TABLE IF NOT EXISTS Category (
        id TEXT PRIMARY KEY,
        name TEXT,
        icon TEXT,
        color TEXT,
        is_custom INTEGER,
        created_at TEXT
      );`,
      `CREATE TABLE IF NOT EXISTS Budget (
        id TEXT PRIMARY KEY,
        category_id TEXT UNIQUE,
        monthly_limit REAL,
        created_at TEXT,
        FOREIGN KEY(category_id) REFERENCES Category(id)
      );`,
      `CREATE TABLE IF NOT EXISTS "Transaction" (
        id TEXT PRIMARY KEY,
        amount REAL,
        type TEXT CHECK(type IN ('income', 'expense', 'transfer')),
        category_id TEXT,
        wallet_id TEXT,
        target_wallet_id TEXT,
        note TEXT,
        occurred_at TEXT,
        created_at TEXT,
        FOREIGN KEY(category_id) REFERENCES Category(id),
        FOREIGN KEY(wallet_id) REFERENCES Wallet(id),
        FOREIGN KEY(target_wallet_id) REFERENCES Wallet(id)
      );`,
      `CREATE TABLE IF NOT EXISTS Bill (
        id TEXT PRIMARY KEY,
        name TEXT,
        amount REAL,
        frequency TEXT CHECK(frequency IN ('monthly','quarterly','yearly')),
        category_id TEXT,
        wallet_id TEXT,
        next_due_date TEXT,
        active INTEGER,
        FOREIGN KEY(category_id) REFERENCES Category(id),
        FOREIGN KEY(wallet_id) REFERENCES Wallet(id)
      );`,
      `CREATE TABLE IF NOT EXISTS MonthlySummary (
        id TEXT PRIMARY KEY,
        month TEXT,
        total_income REAL,
        total_expenses REAL,
        savings REAL,
        created_at TEXT
      );`,
      `CREATE TABLE IF NOT EXISTS AITokenLedger (
        id TEXT PRIMARY KEY,
        month TEXT,
        tokens_used INTEGER,
        token_limit INTEGER,
        last_reset TEXT
      );`,
    ],
  },
];

async function getUserVersion(db: SQLiteDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version;"
  );
  return row?.user_version ?? 0;
}

export async function migrate(db: SQLiteDatabase): Promise<void> {
  await db.execAsync("PRAGMA foreign_keys = ON;");

  let currentVersion = await getUserVersion(db);
  for (const migration of migrations) {
    if (migration.version <= currentVersion) {
      continue;
    }

    for (const statement of migration.statements) {
      await db.execAsync(statement);
    }

    await db.execAsync(`PRAGMA user_version = ${migration.version};`);
    currentVersion = migration.version;
  }
}
