import { generateId } from "@/src/utils/id";
import type { SQLiteDatabase } from "expo-sqlite";
import type {
  AITokenLedger,
  Bill,
  BillPayment,
  BillPaymentStatus,
  Budget,
  Category,
  MonthlySummary,
  Transaction,
  User,
  Wallet,
  WalletType,
} from "./entities";

type UserRow = Omit<User, "onboarding_completed"> & {
  onboarding_completed: number;
};

function toUser(row: UserRow): User {
  return {
    ...row,
    onboarding_completed: Boolean(row.onboarding_completed),
  };
}

export const userRepository = {
  getLocalUser: async (db: SQLiteDatabase): Promise<User | null> => {
    const row = await db.getFirstAsync<UserRow>(`SELECT * FROM "User" LIMIT 1;`);
    return row ? toUser(row) : null;
  },
  createLocalUser: async (
    db: SQLiteDatabase,
    {
      currency = "EGP",
      locale = "ar-EG",
      onboarding_completed = false,
    }: Partial<Pick<User, "currency" | "locale" | "onboarding_completed">> = {},
  ): Promise<User> => {
    const now = new Date().toISOString();
    const id = generateId("user");
    await db.runAsync(
      `INSERT INTO "User" (id, created_at, currency, locale, onboarding_completed) VALUES (?, ?, ?, ?, ?);`,
      [id, now, currency, locale, onboarding_completed ? 1 : 0],
    );
    const row = await db.getFirstAsync<UserRow>(
      `SELECT * FROM "User" WHERE id = ? LIMIT 1;`,
      [id],
    );
    if (!row) {
      throw new Error("Failed to create local user");
    }
    return toUser(row);
  },
  getOrCreateLocalUser: async (db: SQLiteDatabase): Promise<User> => {
    const existing = await userRepository.getLocalUser(db);
    if (existing) {
      return existing;
    }
    return userRepository.createLocalUser(db);
  },
  setOnboardingCompleted: async (
    db: SQLiteDatabase,
    completed: boolean,
  ): Promise<User> => {
    const current = await userRepository.getOrCreateLocalUser(db);
    await db.runAsync(
      `UPDATE "User" SET onboarding_completed = ? WHERE id = ?;`,
      [completed ? 1 : 0, current.id],
    );
    const updated = await db.getFirstAsync<UserRow>(
      `SELECT * FROM "User" WHERE id = ? LIMIT 1;`,
      [current.id],
    );
    if (!updated) {
      throw new Error("Failed to update onboarding status");
    }
    return toUser(updated);
  },
};

export const walletRepository = {
  list: async (db: SQLiteDatabase): Promise<Wallet[]> => {
    return await db.getAllAsync<Wallet>(
      `SELECT * FROM Wallet ORDER BY created_at ASC;`,
    );
  },
  getById: async (db: SQLiteDatabase, _id: string): Promise<Wallet | null> => {
    const row = await db.getFirstAsync<Wallet>(
      `SELECT * FROM Wallet WHERE id = ? LIMIT 1;`,
      [_id],
    );
    return row ?? null;
  },
  getByType: async (
    db: SQLiteDatabase,
    type: WalletType,
  ): Promise<Wallet | null> => {
    const row = await db.getFirstAsync<Wallet>(
      `SELECT * FROM Wallet WHERE type = ? LIMIT 1;`,
      [type],
    );
    return row ?? null;
  },
  create: async (
    db: SQLiteDatabase,
    {
      name,
      type,
      balance = 0,
    }: Pick<Wallet, "name" | "type"> & Partial<Pick<Wallet, "balance">>,
  ): Promise<Wallet> => {
    const id = generateId("wallet");
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO Wallet (id, name, type, balance, created_at) VALUES (?, ?, ?, ?, ?);`,
      [id, name, type, balance, now],
    );
    const row = await db.getFirstAsync<Wallet>(
      `SELECT * FROM Wallet WHERE id = ? LIMIT 1;`,
      [id],
    );
    if (!row) {
      throw new Error("Failed to create wallet");
    }
    return row;
  },
  upsertInitialWallets: async (
    db: SQLiteDatabase,
    {
      cashBalance,
      bankBalance,
      trackCashOnly,
    }: {
      cashBalance: number;
      bankBalance: number;
      trackCashOnly: boolean;
    },
  ): Promise<{ cash: Wallet; bank: Wallet | null }> => {
    let cashWallet: Wallet | null = null;
    let bankWallet: Wallet | null = null;

    await db.withTransactionAsync(async () => {
      const existingCash = await walletRepository.getByType(db, "cash");
      if (existingCash) {
        await db.runAsync(`UPDATE Wallet SET balance = ? WHERE id = ?;`, [
          cashBalance,
          existingCash.id,
        ]);
        cashWallet = await walletRepository.getById(db, existingCash.id);
      } else {
        cashWallet = await walletRepository.create(db, {
          name: "Cash",
          type: "cash",
          balance: cashBalance,
        });
      }

      const existingBank = await walletRepository.getByType(db, "bank");
      if (trackCashOnly) {
        if (existingBank) {
          await db.runAsync(`UPDATE Wallet SET balance = 0 WHERE id = ?;`, [
            existingBank.id,
          ]);
          bankWallet = await walletRepository.getById(db, existingBank.id);
        } else {
          bankWallet = null;
        }
      } else if (existingBank) {
        await db.runAsync(`UPDATE Wallet SET balance = ? WHERE id = ?;`, [
          bankBalance,
          existingBank.id,
        ]);
        bankWallet = await walletRepository.getById(db, existingBank.id);
      } else {
        bankWallet = await walletRepository.create(db, {
          name: "Bank",
          type: "bank",
          balance: bankBalance,
        });
      }
    });

    if (!cashWallet) {
      throw new Error("Failed to initialize cash wallet");
    }

    return {
      cash: cashWallet,
      bank: bankWallet,
    };
  },
  updateBalance: async (
    db: SQLiteDatabase,
    id: string,
    delta: number,
  ): Promise<Wallet | null> => {
    await db.runAsync(`UPDATE Wallet SET balance = balance + ? WHERE id = ?;`, [
      delta,
      id,
    ]);
    const row = await db.getFirstAsync<Wallet>(
      `SELECT * FROM Wallet WHERE id = ? LIMIT 1;`,
      [id],
    );
    return row ?? null;
  },
};

export const categoryRepository = {
  list: async (db: SQLiteDatabase): Promise<Category[]> => {
    return await db.getAllAsync<Category>(
      `SELECT * FROM Category ORDER BY created_at ASC;`,
    );
  },
  getById: async (
    db: SQLiteDatabase,
    _id: string,
  ): Promise<Category | null> => {
    const row = await db.getFirstAsync<Category>(
      `SELECT * FROM Category WHERE id = ? LIMIT 1;`,
      [_id],
    );
    return row ?? null;
  },
  create: async (
    db: SQLiteDatabase,
    {
      name,
      icon,
      color,
      is_custom,
    }: Pick<Category, "name" | "icon" | "color" | "is_custom">,
  ): Promise<Category> => {
    const now = new Date().toISOString();
    const id = generateId("cat");
    await db.runAsync(
      `INSERT INTO Category (id, name, icon, color, is_custom, created_at) VALUES (?, ?, ?, ?, ?, ?);`,
      [id, name, icon ?? null, color ?? null, is_custom ? 1 : 0, now],
    );
    const row = await db.getFirstAsync<Category>(
      `SELECT * FROM Category WHERE id = ? LIMIT 1;`,
      [id],
    );
    if (!row) {
      throw new Error("Failed to create category");
    }
    return row;
  },
  listTopUsed: async (
    db: SQLiteDatabase,
    {
      limit = 5,
      type,
    }: { limit?: number; type?: Transaction["type"] } = {},
  ): Promise<Category[]> => {
    const normalizedLimit = Number.isFinite(limit)
      ? Math.max(1, Math.floor(limit))
      : 5;

    const rows = type
      ? await db.getAllAsync<Category>(
          `SELECT c.*
             FROM Category c
             JOIN (
               SELECT category_id, COUNT(*) AS usage_count, MAX(occurred_at) AS latest_used_at
               FROM "Transaction"
               WHERE category_id IS NOT NULL AND type = ?
               GROUP BY category_id
               ORDER BY usage_count DESC, latest_used_at DESC
               LIMIT ?
             ) usage ON usage.category_id = c.id
             ORDER BY usage.usage_count DESC, usage.latest_used_at DESC;`,
          [type, normalizedLimit],
        )
      : await db.getAllAsync<Category>(
          `SELECT c.*
             FROM Category c
             JOIN (
               SELECT category_id, COUNT(*) AS usage_count, MAX(occurred_at) AS latest_used_at
               FROM "Transaction"
               WHERE category_id IS NOT NULL
               GROUP BY category_id
               ORDER BY usage_count DESC, latest_used_at DESC
               LIMIT ?
             ) usage ON usage.category_id = c.id
             ORDER BY usage.usage_count DESC, usage.latest_used_at DESC;`,
          [normalizedLimit],
        );

    return rows;
  },
};

export const budgetRepository = {
  list: async (db: SQLiteDatabase): Promise<Budget[]> => {
    return await db.getAllAsync<Budget>(
      `SELECT * FROM Budget ORDER BY created_at ASC;`,
    );
  },
  getById: async (db: SQLiteDatabase, _id: string): Promise<Budget | null> => {
    const row = await db.getFirstAsync<Budget>(
      `SELECT * FROM Budget WHERE id = ? LIMIT 1;`,
      [_id],
    );
    return row ?? null;
  },
  getByCategoryId: async (
    db: SQLiteDatabase,
    _id: string,
  ): Promise<Budget | null> => {
    const row = await db.getFirstAsync<Budget>(
      `SELECT * FROM Budget WHERE category_id = ? LIMIT 1;`,
      [_id],
    );
    return row ?? null;
  },
  create: async (
    db: SQLiteDatabase,
    { category_id, monthly_limit }: Pick<Budget, "category_id" | "monthly_limit">,
  ): Promise<Budget> => {
    const now = new Date().toISOString();
    const id = generateId("bud");
    await db.runAsync(
      `INSERT INTO Budget (id, category_id, monthly_limit, created_at) VALUES (?, ?, ?, ?);`,
      [id, category_id, monthly_limit, now],
    );
    const row = await db.getFirstAsync<Budget>(
      `SELECT * FROM Budget WHERE id = ? LIMIT 1;`,
      [id],
    );
    if (!row) {
      throw new Error("Failed to create budget");
    }
    return row;
  },
  updateLimit: async (
    db: SQLiteDatabase,
    { id, monthly_limit }: Pick<Budget, "id" | "monthly_limit">,
  ): Promise<Budget> => {
    await db.runAsync(`UPDATE Budget SET monthly_limit = ? WHERE id = ?;`, [
      monthly_limit,
      id,
    ]);
    const row = await db.getFirstAsync<Budget>(
      `SELECT * FROM Budget WHERE id = ? LIMIT 1;`,
      [id],
    );
    if (!row) {
      throw new Error("Failed to update budget");
    }
    return row;
  },
};

export const transactionRepository = {
  list: async (db: SQLiteDatabase): Promise<Transaction[]> => {
    return await db.getAllAsync<Transaction>(
      `SELECT * FROM "Transaction" ORDER BY occurred_at DESC;`,
    );
  },
  getById: async (
    db: SQLiteDatabase,
    _id: string,
  ): Promise<Transaction | null> => {
    const row = await db.getFirstAsync<Transaction>(
      `SELECT * FROM "Transaction" WHERE id = ? LIMIT 1;`,
      [_id],
    );
    return row ?? null;
  },
  createAndApply: async (
    db: SQLiteDatabase,
    tx: Omit<Transaction, "id" | "created_at"> &
      Partial<Pick<Transaction, "id">>,
  ): Promise<Transaction> => {
    const now = new Date().toISOString();
    const id = tx.id ?? generateId("tx");

    let created: Transaction | null = null;
    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `INSERT INTO "Transaction"
          (id, amount, type, category_id, wallet_id, target_wallet_id, note, occurred_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          id,
          tx.amount,
          tx.type,
          tx.category_id ?? null,
          tx.wallet_id ?? null,
          tx.target_wallet_id ?? null,
          tx.note ?? null,
          tx.occurred_at,
          now,
        ],
      );

      // Apply wallet balance side-effects.
      if (tx.type === "expense") {
        if (!tx.wallet_id) {
          throw new Error("Expense requires wallet_id");
        }
        await db.runAsync(
          `UPDATE Wallet SET balance = balance - ? WHERE id = ?;`,
          [tx.amount, tx.wallet_id],
        );
      } else if (tx.type === "income") {
        if (!tx.wallet_id) {
          throw new Error("Income requires wallet_id");
        }
        await db.runAsync(
          `UPDATE Wallet SET balance = balance + ? WHERE id = ?;`,
          [tx.amount, tx.wallet_id],
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
          [tx.amount, tx.wallet_id],
        );
        await db.runAsync(
          `UPDATE Wallet SET balance = balance + ? WHERE id = ?;`,
          [tx.amount, tx.target_wallet_id],
        );
      }

      const row = await db.getFirstAsync<Transaction>(
        `SELECT * FROM "Transaction" WHERE id = ? LIMIT 1;`,
        [id],
      );
      created = row ?? null;
    });
    if (!created) {
      throw new Error("Failed to create transaction");
    }
    return created;
  },
};

export const billRepository = {
  create: async (
    db: SQLiteDatabase,
    {
      name,
      amount,
      frequency,
      category_id,
      wallet_id,
      next_due_date,
      active,
      paid,
      id,
    }: Pick<
      Bill,
      "name" | "amount" | "frequency" | "category_id" | "wallet_id" | "next_due_date"
    > &
      Partial<Pick<Bill, "id" | "active" | "paid">>
  ): Promise<Bill> => {
    const billId = id ?? generateId("bill");
    const isActive = active ?? true;
    const isPaid = paid ?? false;
    await db.runAsync(
      `INSERT INTO Bill
        (id, name, amount, frequency, category_id, wallet_id, next_due_date, active, paid)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        billId,
        name,
        amount,
        frequency,
        category_id ?? null,
        wallet_id ?? null,
        next_due_date,
        isActive ? 1 : 0,
        isPaid ? 1 : 0,
      ]
    );
    const row = await db.getFirstAsync<Bill>(
      `SELECT * FROM Bill WHERE id = ? LIMIT 1;`,
      [billId]
    );
    if (!row) {
      throw new Error("Failed to create bill");
    }
    return row;
  },
  list: async (db: SQLiteDatabase): Promise<Bill[]> => {
    return await db.getAllAsync<Bill>(
      `SELECT * FROM Bill ORDER BY next_due_date ASC;`,
    );
  },
  getById: async (db: SQLiteDatabase, _id: string): Promise<Bill | null> => {
    const row = await db.getFirstAsync<Bill>(
      `SELECT * FROM Bill WHERE id = ? LIMIT 1;`,
      [_id],
    );
    return row ?? null;
  },
  setPaid: async (
    db: SQLiteDatabase,
    { id, paid }: Pick<Bill, "id" | "paid">,
  ): Promise<Bill | null> => {
    await db.runAsync(`UPDATE Bill SET paid = ? WHERE id = ?;`, [
      paid ? 1 : 0,
      id,
    ]);
    const row = await db.getFirstAsync<Bill>(
      `SELECT * FROM Bill WHERE id = ? LIMIT 1;`,
      [id],
    );
    return row ?? null;
  },
  updateSchedule: async (
    db: SQLiteDatabase,
    {
      id,
      next_due_date,
      paid,
    }: Pick<Bill, "id" | "next_due_date" | "paid">,
  ): Promise<Bill | null> => {
    await db.runAsync(
      `UPDATE Bill SET next_due_date = ?, paid = ? WHERE id = ?;`,
      [next_due_date, paid ? 1 : 0, id],
    );
    const row = await db.getFirstAsync<Bill>(
      `SELECT * FROM Bill WHERE id = ? LIMIT 1;`,
      [id],
    );
    return row ?? null;
  },
  updateAmount: async (
    db: SQLiteDatabase,
    { id, amount }: Pick<Bill, "id" | "amount">,
  ): Promise<Bill | null> => {
    await db.runAsync(`UPDATE Bill SET amount = ? WHERE id = ?;`, [amount, id]);
    const row = await db.getFirstAsync<Bill>(
      `SELECT * FROM Bill WHERE id = ? LIMIT 1;`,
      [id],
    );
    return row ?? null;
  },
  setActive: async (
    db: SQLiteDatabase,
    { id, active }: Pick<Bill, "id" | "active">,
  ): Promise<Bill | null> => {
    await db.runAsync(`UPDATE Bill SET active = ? WHERE id = ?;`, [
      active ? 1 : 0,
      id,
    ]);
    const row = await db.getFirstAsync<Bill>(
      `SELECT * FROM Bill WHERE id = ? LIMIT 1;`,
      [id],
    );
    return row ?? null;
  },
};

export const billPaymentRepository = {
  listByBillId: async (
    db: SQLiteDatabase,
    billId: string,
    limit?: number,
  ): Promise<BillPayment[]> => {
    if (limit && limit > 0) {
      return await db.getAllAsync<BillPayment>(
        `SELECT * FROM BillPayment WHERE bill_id = ? ORDER BY paid_at DESC LIMIT ?;`,
        [billId, limit],
      );
    }
    return await db.getAllAsync<BillPayment>(
      `SELECT * FROM BillPayment WHERE bill_id = ? ORDER BY paid_at DESC;`,
      [billId],
    );
  },
  create: async (
    db: SQLiteDatabase,
    {
      bill_id,
      amount,
      wallet_id,
      status,
      paid_at,
      id,
    }: Pick<BillPayment, "bill_id" | "amount" | "wallet_id" | "paid_at"> &
      Partial<Pick<BillPayment, "id" | "status">>,
  ): Promise<BillPayment> => {
    const now = new Date().toISOString();
    const paymentId = id ?? generateId("billpay");
    const paymentStatus: BillPaymentStatus = status ?? "cleared";
    await db.runAsync(
      `INSERT INTO BillPayment
        (id, bill_id, amount, wallet_id, status, paid_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [
        paymentId,
        bill_id,
        amount,
        wallet_id ?? null,
        paymentStatus,
        paid_at,
        now,
      ],
    );
    const row = await db.getFirstAsync<BillPayment>(
      `SELECT * FROM BillPayment WHERE id = ? LIMIT 1;`,
      [paymentId],
    );
    if (!row) {
      throw new Error("Failed to create bill payment");
    }
    return row;
  },
};

export const monthlySummaryRepository = {
  list: async (db: SQLiteDatabase): Promise<MonthlySummary[]> => {
    return await db.getAllAsync<MonthlySummary>(
      `SELECT * FROM MonthlySummary;`,
    );
  },
};

export const aiTokenLedgerRepository = {
  list: async (db: SQLiteDatabase): Promise<AITokenLedger[]> => {
    return await db.getAllAsync<AITokenLedger>(`SELECT * FROM AITokenLedger;`);
  },
};
