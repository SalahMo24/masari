import { initializeDatabase } from "@/src/db";
import type {
  AITokenLedger,
  Bill,
  Budget,
  Category,
  MonthlySummary,
  Transaction,
  User,
  Wallet,
} from "./entities";
import type { SQLiteDatabase } from "expo-sqlite";
import { generateId } from "@/src/utils/id";

async function ensureReady(): Promise<SQLiteDatabase> {
  return await initializeDatabase();
}

async function withDbTransaction<T>(
  db: SQLiteDatabase,
  fn: () => Promise<T>,
): Promise<T> {
  await db.execAsync("BEGIN;");
  try {
    const result = await fn();
    await db.execAsync("COMMIT;");
    return result;
  } catch (err) {
    await db.execAsync("ROLLBACK;");
    throw err;
  }
}

export const userRepository = {
  getLocalUser: async (): Promise<User | null> => {
    const db = await ensureReady();
    const row = await db.getFirstAsync<User>(`SELECT * FROM "User" LIMIT 1;`);
    return row ?? null;
  },
};

export const walletRepository = {
  list: async (): Promise<Wallet[]> => {
    const db = await ensureReady();
    return await db.getAllAsync<Wallet>(
      `SELECT * FROM Wallet ORDER BY created_at ASC;`,
    );
  },
  getById: async (_id: string): Promise<Wallet | null> => {
    const db = await ensureReady();
    const row = await db.getFirstAsync<Wallet>(
      `SELECT * FROM Wallet WHERE id = ? LIMIT 1;`,
      _id,
    );
    return row ?? null;
  },
  updateBalance: async (id: string, delta: number): Promise<Wallet | null> => {
    const db = await ensureReady();
    await db.runAsync(
      `UPDATE Wallet SET balance = balance + ? WHERE id = ?;`,
      delta,
      id,
    );
    const row = await db.getFirstAsync<Wallet>(
      `SELECT * FROM Wallet WHERE id = ? LIMIT 1;`,
      id,
    );
    return row ?? null;
  },
};

export const categoryRepository = {
  list: async (): Promise<Category[]> => {
    const db = await ensureReady();
    return await db.getAllAsync<Category>(
      `SELECT * FROM Category ORDER BY created_at ASC;`,
    );
  },
  getById: async (_id: string): Promise<Category | null> => {
    const db = await ensureReady();
    const row = await db.getFirstAsync<Category>(
      `SELECT * FROM Category WHERE id = ? LIMIT 1;`,
      _id,
    );
    return row ?? null;
  },
  create: async ({
    name,
    icon,
    color,
    is_custom,
  }: Pick<Category, "name" | "icon" | "color" | "is_custom">): Promise<Category> => {
    const db = await ensureReady();
    const now = new Date().toISOString();
    const id = generateId("cat");
    await db.runAsync(
      `INSERT INTO Category (id, name, icon, color, is_custom, created_at) VALUES (?, ?, ?, ?, ?, ?);`,
      id,
      name,
      icon ?? null,
      color ?? null,
      is_custom ? 1 : 0,
      now,
    );
    const row = await db.getFirstAsync<Category>(
      `SELECT * FROM Category WHERE id = ? LIMIT 1;`,
      id,
    );
    if (!row) {
      throw new Error("Failed to create category");
    }
    return row;
  },
};

export const budgetRepository = {
  list: async (): Promise<Budget[]> => {
    const db = await ensureReady();
    return await db.getAllAsync<Budget>(
      `SELECT * FROM Budget ORDER BY created_at ASC;`,
    );
  },
  getById: async (_id: string): Promise<Budget | null> => {
    const db = await ensureReady();
    const row = await db.getFirstAsync<Budget>(
      `SELECT * FROM Budget WHERE id = ? LIMIT 1;`,
      _id,
    );
    return row ?? null;
  },
  getByCategoryId: async (_id: string): Promise<Budget | null> => {
    const db = await ensureReady();
    const row = await db.getFirstAsync<Budget>(
      `SELECT * FROM Budget WHERE category_id = ? LIMIT 1;`,
      _id,
    );
    return row ?? null;
  },
  create: async ({
    category_id,
    monthly_limit,
  }: Pick<Budget, "category_id" | "monthly_limit">): Promise<Budget> => {
    const db = await ensureReady();
    const now = new Date().toISOString();
    const id = generateId("bud");
    await db.runAsync(
      `INSERT INTO Budget (id, category_id, monthly_limit, created_at) VALUES (?, ?, ?, ?);`,
      id,
      category_id,
      monthly_limit,
      now,
    );
    const row = await db.getFirstAsync<Budget>(
      `SELECT * FROM Budget WHERE id = ? LIMIT 1;`,
      id,
    );
    if (!row) {
      throw new Error("Failed to create budget");
    }
    return row;
  },
};

export const transactionRepository = {
  list: async (): Promise<Transaction[]> => {
    const db = await ensureReady();
    return await db.getAllAsync<Transaction>(
      `SELECT * FROM "Transaction" ORDER BY occurred_at DESC;`,
    );
  },
  getById: async (_id: string): Promise<Transaction | null> => {
    const db = await ensureReady();
    const row = await db.getFirstAsync<Transaction>(
      `SELECT * FROM "Transaction" WHERE id = ? LIMIT 1;`,
      _id,
    );
    return row ?? null;
  },
  createAndApply: async (
    tx: Omit<Transaction, "id" | "created_at"> & Partial<Pick<Transaction, "id">>,
  ): Promise<Transaction> => {
    const db = await ensureReady();
    const now = new Date().toISOString();
    const id = tx.id ?? generateId("tx");

    return await withDbTransaction(db, async () => {
      await db.runAsync(
        `INSERT INTO "Transaction"
          (id, amount, type, category_id, wallet_id, target_wallet_id, note, occurred_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        id,
        tx.amount,
        tx.type,
        tx.category_id ?? null,
        tx.wallet_id ?? null,
        tx.target_wallet_id ?? null,
        tx.note ?? null,
        tx.occurred_at,
        now,
      );

      // Apply wallet balance side-effects.
      if (tx.type === "expense") {
        if (!tx.wallet_id) {
          throw new Error("Expense requires wallet_id");
        }
        await db.runAsync(
          `UPDATE Wallet SET balance = balance - ? WHERE id = ?;`,
          tx.amount,
          tx.wallet_id,
        );
      } else if (tx.type === "income") {
        if (!tx.wallet_id) {
          throw new Error("Income requires wallet_id");
        }
        await db.runAsync(
          `UPDATE Wallet SET balance = balance + ? WHERE id = ?;`,
          tx.amount,
          tx.wallet_id,
        );
      } else if (tx.type === "transfer") {
        if (!tx.wallet_id || !tx.target_wallet_id) {
          throw new Error("Transfer requires wallet_id and target_wallet_id");
        }
        if (tx.wallet_id === tx.target_wallet_id) {
          throw new Error("Transfer requires different wallets");
        }
        await db.runAsync(
          `UPDATE Wallet SET balance = balance - ? WHERE id = ?;`,
          tx.amount,
          tx.wallet_id,
        );
        await db.runAsync(
          `UPDATE Wallet SET balance = balance + ? WHERE id = ?;`,
          tx.amount,
          tx.target_wallet_id,
        );
      }

      const row = await db.getFirstAsync<Transaction>(
        `SELECT * FROM "Transaction" WHERE id = ? LIMIT 1;`,
        id,
      );
      if (!row) {
        throw new Error("Failed to create transaction");
      }
      return row;
    });
  },
};

export const billRepository = {
  list: async (): Promise<Bill[]> => {
    const db = await ensureReady();
    return await db.getAllAsync<Bill>(`SELECT * FROM Bill;`);
  },
  getById: async (_id: string): Promise<Bill | null> => {
    const db = await ensureReady();
    const row = await db.getFirstAsync<Bill>(
      `SELECT * FROM Bill WHERE id = ? LIMIT 1;`,
      _id,
    );
    return row ?? null;
  },
};

export const monthlySummaryRepository = {
  list: async (): Promise<MonthlySummary[]> => {
    const db = await ensureReady();
    return await db.getAllAsync<MonthlySummary>(`SELECT * FROM MonthlySummary;`);
  },
};

export const aiTokenLedgerRepository = {
  list: async (): Promise<AITokenLedger[]> => {
    const db = await ensureReady();
    return await db.getAllAsync<AITokenLedger>(`SELECT * FROM AITokenLedger;`);
  },
};
