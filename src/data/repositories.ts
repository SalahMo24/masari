import { generateId } from "@/src/utils/id";
import { and, desc, eq, isNotNull, sql } from "drizzle-orm";
import type { SQLiteDatabase } from "expo-sqlite";
import { getDrizzleDb } from "../db/database";
import {
  aiTokenLedgerTable,
  billPaymentTable,
  billTable,
  budgetTable,
  categoryTable,
  monthlySummaryTable,
  transactionTable,
  userTable,
  walletTable,
} from "../db/schema";
import { SUPPORTED_CURRENCIES } from "./entities";
import type {
  AITokenLedger,
  Bill,
  BillFrequency,
  BillPayment,
  BillPaymentStatus,
  Budget,
  Category,
  CurrencyCode,
  LocaleCode,
  MonthlySummary,
  Transaction,
  TransactionType,
  User,
  Wallet,
  WalletType,
} from "./entities";

function toUser(row: typeof userTable.$inferSelect): User {
  const normalizedCurrency = (
    (SUPPORTED_CURRENCIES as string[]).includes(row.currency) ? row.currency : "EGP"
  ) as CurrencyCode;
  const normalizedLocale =
    row.locale === "en-US" || row.locale === "ar-EG" ? row.locale : "ar-EG";
  return {
    ...row,
    currency: normalizedCurrency,
    locale: normalizedLocale,
    onboarding_completed: Boolean(row.onboarding_completed),
  };
}

function toCategory(row: typeof categoryTable.$inferSelect): Category {
  return { ...row, is_custom: Boolean(row.is_custom) };
}

function toWallet(row: typeof walletTable.$inferSelect): Wallet {
  return {
    ...row,
    type: row.type as WalletType,
  };
}

function toTransaction(row: typeof transactionTable.$inferSelect): Transaction {
  return {
    ...row,
    type: row.type as TransactionType,
  };
}

function toBill(row: typeof billTable.$inferSelect): Bill {
  return {
    ...row,
    frequency: row.frequency as BillFrequency,
    active: Boolean(row.active),
    paid: Boolean(row.paid),
  };
}

function toBillPayment(row: typeof billPaymentTable.$inferSelect): BillPayment {
  return {
    ...row,
    status: row.status as BillPaymentStatus,
  };
}

function toDb(db: SQLiteDatabase) {
  return getDrizzleDb(db);
}

export const userRepository = {
  getLocalUser: async (db: SQLiteDatabase): Promise<User | null> => {
    const row = toDb(db).select().from(userTable).limit(1).get();
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
    toDb(db)
      .insert(userTable)
      .values({
        id,
        created_at: now,
        currency,
        locale,
        onboarding_completed,
      })
      .run();
    const row = toDb(db).select().from(userTable).where(eq(userTable.id, id)).get();
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
    toDb(db)
      .update(userTable)
      .set({ onboarding_completed: completed })
      .where(eq(userTable.id, current.id))
      .run();
    const updated = toDb(db)
      .select()
      .from(userTable)
      .where(eq(userTable.id, current.id))
      .get();
    if (!updated) {
      throw new Error("Failed to update onboarding status");
    }
    return toUser(updated);
  },
  updateLocale: async (
    db: SQLiteDatabase,
    locale: LocaleCode,
  ): Promise<User> => {
    const current = await userRepository.getOrCreateLocalUser(db);
    toDb(db)
      .update(userTable)
      .set({ locale })
      .where(eq(userTable.id, current.id))
      .run();
    const updated = toDb(db)
      .select()
      .from(userTable)
      .where(eq(userTable.id, current.id))
      .get();
    if (!updated) {
      throw new Error("Failed to update locale");
    }
    return toUser(updated);
  },
  updateCurrency: async (
    db: SQLiteDatabase,
    currency: CurrencyCode,
  ): Promise<User> => {
    const current = await userRepository.getOrCreateLocalUser(db);
    toDb(db)
      .update(userTable)
      .set({ currency })
      .where(eq(userTable.id, current.id))
      .run();
    const updated = toDb(db)
      .select()
      .from(userTable)
      .where(eq(userTable.id, current.id))
      .get();
    if (!updated) {
      throw new Error("Failed to update currency");
    }
    return toUser(updated);
  },
  updatePreferences: async (
    db: SQLiteDatabase,
    {
      locale,
      currency,
    }: Partial<Pick<User, "locale" | "currency">>,
  ): Promise<User> => {
    const current = await userRepository.getOrCreateLocalUser(db);
    const updates: Partial<Pick<User, "locale" | "currency">> = {};
    if (locale !== undefined) updates.locale = locale;
    if (currency !== undefined) updates.currency = currency;
    if (Object.keys(updates).length > 0) {
      toDb(db).update(userTable).set(updates).where(eq(userTable.id, current.id)).run();
    }
    const updated = toDb(db)
      .select()
      .from(userTable)
      .where(eq(userTable.id, current.id))
      .get();
    if (!updated) {
      throw new Error("Failed to update user preferences");
    }
    return toUser(updated);
  },
};

export const walletRepository = {
  list: async (db: SQLiteDatabase): Promise<Wallet[]> => {
    return toDb(db)
      .select()
      .from(walletTable)
      .orderBy(walletTable.created_at)
      .all()
      .map(toWallet);
  },
  getById: async (db: SQLiteDatabase, _id: string): Promise<Wallet | null> => {
    const row = toDb(db).select().from(walletTable).where(eq(walletTable.id, _id)).get();
    return row ? toWallet(row) : null;
  },
  getByType: async (
    db: SQLiteDatabase,
    type: WalletType,
  ): Promise<Wallet | null> => {
    const row = toDb(db)
      .select()
      .from(walletTable)
      .where(eq(walletTable.type, type))
      .get();
    return row ? toWallet(row) : null;
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
    toDb(db)
      .insert(walletTable)
      .values({ id, name, type, balance, created_at: now })
      .run();
    const row = toDb(db).select().from(walletTable).where(eq(walletTable.id, id)).get();
    if (!row) {
      throw new Error("Failed to create wallet");
    }
    return toWallet(row);
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

    toDb(db).transaction((txDb) => {
      const existingCash = txDb
        .select()
        .from(walletTable)
        .where(eq(walletTable.type, "cash"))
        .get();
      if (existingCash) {
        txDb
          .update(walletTable)
          .set({ balance: cashBalance })
          .where(eq(walletTable.id, existingCash.id))
          .run();
        const refreshedCash = txDb
          .select()
          .from(walletTable)
          .where(eq(walletTable.id, existingCash.id))
          .get();
        cashWallet = refreshedCash ? toWallet(refreshedCash) : null;
      } else {
        const cashId = generateId("wallet");
        txDb
          .insert(walletTable)
          .values({
            id: cashId,
            name: "Cash",
            type: "cash",
            balance: cashBalance,
            created_at: new Date().toISOString(),
          })
          .run();
        const insertedCash = txDb.select().from(walletTable).where(eq(walletTable.id, cashId)).get();
        cashWallet = insertedCash ? toWallet(insertedCash) : null;
      }

      const existingBank = txDb
        .select()
        .from(walletTable)
        .where(eq(walletTable.type, "bank"))
        .get();
      if (trackCashOnly) {
        if (existingBank) {
          txDb
            .update(walletTable)
            .set({ balance: 0 })
            .where(eq(walletTable.id, existingBank.id))
            .run();
          const refreshedBank = txDb
            .select()
            .from(walletTable)
            .where(eq(walletTable.id, existingBank.id))
            .get();
          bankWallet = refreshedBank ? toWallet(refreshedBank) : null;
        } else {
          bankWallet = null;
        }
      } else if (existingBank) {
        txDb
          .update(walletTable)
          .set({ balance: bankBalance })
          .where(eq(walletTable.id, existingBank.id))
          .run();
        const refreshedBank = txDb
          .select()
          .from(walletTable)
          .where(eq(walletTable.id, existingBank.id))
          .get();
        bankWallet = refreshedBank ? toWallet(refreshedBank) : null;
      } else {
        const bankId = generateId("wallet");
        txDb
          .insert(walletTable)
          .values({
            id: bankId,
            name: "Bank",
            type: "bank",
            balance: bankBalance,
            created_at: new Date().toISOString(),
          })
          .run();
        const insertedBank = txDb.select().from(walletTable).where(eq(walletTable.id, bankId)).get();
        bankWallet = insertedBank ? toWallet(insertedBank) : null;
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
    toDb(db)
      .update(walletTable)
      .set({ balance: sql`${walletTable.balance} + ${delta}` })
      .where(eq(walletTable.id, id))
      .run();
    const row = toDb(db).select().from(walletTable).where(eq(walletTable.id, id)).get();
    return row ? toWallet(row) : null;
  },
};

export const categoryRepository = {
  list: async (db: SQLiteDatabase): Promise<Category[]> => {
    return toDb(db)
      .select()
      .from(categoryTable)
      .orderBy(categoryTable.created_at)
      .all()
      .map(toCategory);
  },
  getById: async (
    db: SQLiteDatabase,
    _id: string,
  ): Promise<Category | null> => {
    const row = toDb(db).select().from(categoryTable).where(eq(categoryTable.id, _id)).get();
    return row ? toCategory(row) : null;
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
    toDb(db)
      .insert(categoryTable)
      .values({
        id,
        name,
        icon: icon ?? null,
        color: color ?? null,
        is_custom,
        created_at: now,
      })
      .run();
    const row = toDb(db).select().from(categoryTable).where(eq(categoryTable.id, id)).get();
    if (!row) {
      throw new Error("Failed to create category");
    }
    return toCategory(row);
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
    const usage = toDb(db)
      .select({
        category_id: transactionTable.category_id,
        usage_count: sql<number>`count(*)`.as("usage_count"),
        latest_used_at: sql<string>`max(${transactionTable.occurred_at})`.as("latest_used_at"),
      })
      .from(transactionTable)
      .where(
        and(
          isNotNull(transactionTable.category_id),
          type ? eq(transactionTable.type, type) : undefined,
        ),
      )
      .groupBy(transactionTable.category_id)
      .orderBy(desc(sql`usage_count`), desc(sql`latest_used_at`))
      .limit(normalizedLimit)
      .as("usage");

    const rows = toDb(db)
      .select({
        id: categoryTable.id,
        name: categoryTable.name,
        icon: categoryTable.icon,
        color: categoryTable.color,
        is_custom: categoryTable.is_custom,
        created_at: categoryTable.created_at,
      })
      .from(categoryTable)
      .innerJoin(usage, eq(usage.category_id, categoryTable.id))
      .orderBy(desc(usage.usage_count), desc(usage.latest_used_at))
      .all();

    return rows.map(toCategory);
  },
};

export const budgetRepository = {
  list: async (db: SQLiteDatabase): Promise<Budget[]> => {
    return toDb(db).select().from(budgetTable).orderBy(budgetTable.created_at).all();
  },
  getById: async (db: SQLiteDatabase, _id: string): Promise<Budget | null> => {
    const row = toDb(db).select().from(budgetTable).where(eq(budgetTable.id, _id)).get();
    return row ?? null;
  },
  getByCategoryId: async (
    db: SQLiteDatabase,
    _id: string,
  ): Promise<Budget | null> => {
    const row = toDb(db)
      .select()
      .from(budgetTable)
      .where(eq(budgetTable.category_id, _id))
      .get();
    return row ?? null;
  },
  create: async (
    db: SQLiteDatabase,
    { category_id, monthly_limit }: Pick<Budget, "category_id" | "monthly_limit">,
  ): Promise<Budget> => {
    const now = new Date().toISOString();
    const id = generateId("bud");
    toDb(db)
      .insert(budgetTable)
      .values({ id, category_id, monthly_limit, created_at: now })
      .run();
    const row = toDb(db).select().from(budgetTable).where(eq(budgetTable.id, id)).get();
    if (!row) {
      throw new Error("Failed to create budget");
    }
    return row;
  },
  updateLimit: async (
    db: SQLiteDatabase,
    { id, monthly_limit }: Pick<Budget, "id" | "monthly_limit">,
  ): Promise<Budget> => {
    toDb(db)
      .update(budgetTable)
      .set({ monthly_limit })
      .where(eq(budgetTable.id, id))
      .run();
    const row = toDb(db).select().from(budgetTable).where(eq(budgetTable.id, id)).get();
    if (!row) {
      throw new Error("Failed to update budget");
    }
    return row;
  },
};

export const transactionRepository = {
  list: async (db: SQLiteDatabase): Promise<Transaction[]> => {
    return toDb(db)
      .select()
      .from(transactionTable)
      .orderBy(desc(transactionTable.occurred_at))
      .all()
      .map(toTransaction);
  },
  getById: async (
    db: SQLiteDatabase,
    _id: string,
  ): Promise<Transaction | null> => {
    const row = toDb(db)
      .select()
      .from(transactionTable)
      .where(eq(transactionTable.id, _id))
      .get();
    return row ? toTransaction(row) : null;
  },
  createAndApply: async (
    db: SQLiteDatabase,
    tx: Omit<Transaction, "id" | "created_at"> &
      Partial<Pick<Transaction, "id">>,
  ): Promise<Transaction> => {
    const now = new Date().toISOString();
    const id = tx.id ?? generateId("tx");

    let created: Transaction | null = null;
    toDb(db).transaction((txDb) => {
      txDb
        .insert(transactionTable)
        .values({
          id,
          amount: tx.amount,
          type: tx.type,
          category_id: tx.category_id ?? null,
          wallet_id: tx.wallet_id ?? null,
          target_wallet_id: tx.target_wallet_id ?? null,
          note: tx.note ?? null,
          occurred_at: tx.occurred_at,
          created_at: now,
        })
        .run();

      // Apply wallet balance side-effects.
      if (tx.type === "expense") {
        if (!tx.wallet_id) {
          throw new Error("Expense requires wallet_id");
        }
        txDb
          .update(walletTable)
          .set({ balance: sql`${walletTable.balance} - ${tx.amount}` })
          .where(eq(walletTable.id, tx.wallet_id))
          .run();
      } else if (tx.type === "income") {
        if (!tx.wallet_id) {
          throw new Error("Income requires wallet_id");
        }
        txDb
          .update(walletTable)
          .set({ balance: sql`${walletTable.balance} + ${tx.amount}` })
          .where(eq(walletTable.id, tx.wallet_id))
          .run();
      } else if (tx.type === "transfer") {
        if (!tx.wallet_id || !tx.target_wallet_id) {
          throw new Error("Transfer requires wallet_id and target_wallet_id");
        }
        if (tx.wallet_id === tx.target_wallet_id) {
          throw new Error("Transfer requires different wallets");
        }
        txDb
          .update(walletTable)
          .set({ balance: sql`${walletTable.balance} - ${tx.amount}` })
          .where(eq(walletTable.id, tx.wallet_id))
          .run();
        txDb
          .update(walletTable)
          .set({ balance: sql`${walletTable.balance} + ${tx.amount}` })
          .where(eq(walletTable.id, tx.target_wallet_id))
          .run();
      }

      const row = txDb.select().from(transactionTable).where(eq(transactionTable.id, id)).get();
      created = row ? toTransaction(row) : null;
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
    toDb(db)
      .insert(billTable)
      .values({
        id: billId,
        name,
        amount,
        frequency,
        category_id: category_id ?? null,
        wallet_id: wallet_id ?? null,
        next_due_date,
        active: isActive,
        paid: isPaid,
      })
      .run();
    const row = toDb(db).select().from(billTable).where(eq(billTable.id, billId)).get();
    if (!row) {
      throw new Error("Failed to create bill");
    }
    return toBill(row);
  },
  list: async (db: SQLiteDatabase): Promise<Bill[]> => {
    return toDb(db).select().from(billTable).orderBy(billTable.next_due_date).all().map(toBill);
  },
  getById: async (db: SQLiteDatabase, _id: string): Promise<Bill | null> => {
    const row = toDb(db).select().from(billTable).where(eq(billTable.id, _id)).get();
    return row ? toBill(row) : null;
  },
  setPaid: async (
    db: SQLiteDatabase,
    { id, paid }: Pick<Bill, "id" | "paid">,
  ): Promise<Bill | null> => {
    toDb(db).update(billTable).set({ paid }).where(eq(billTable.id, id)).run();
    const row = toDb(db).select().from(billTable).where(eq(billTable.id, id)).get();
    return row ? toBill(row) : null;
  },
  updateSchedule: async (
    db: SQLiteDatabase,
    {
      id,
      next_due_date,
      paid,
    }: Pick<Bill, "id" | "next_due_date" | "paid">,
  ): Promise<Bill | null> => {
    toDb(db)
      .update(billTable)
      .set({ next_due_date, paid })
      .where(eq(billTable.id, id))
      .run();
    const row = toDb(db).select().from(billTable).where(eq(billTable.id, id)).get();
    return row ? toBill(row) : null;
  },
  updateAmount: async (
    db: SQLiteDatabase,
    { id, amount }: Pick<Bill, "id" | "amount">,
  ): Promise<Bill | null> => {
    toDb(db).update(billTable).set({ amount }).where(eq(billTable.id, id)).run();
    const row = toDb(db).select().from(billTable).where(eq(billTable.id, id)).get();
    return row ? toBill(row) : null;
  },
  setActive: async (
    db: SQLiteDatabase,
    { id, active }: Pick<Bill, "id" | "active">,
  ): Promise<Bill | null> => {
    toDb(db).update(billTable).set({ active }).where(eq(billTable.id, id)).run();
    const row = toDb(db).select().from(billTable).where(eq(billTable.id, id)).get();
    return row ? toBill(row) : null;
  },
};

export const billPaymentRepository = {
  listByBillId: async (
    db: SQLiteDatabase,
    billId: string,
    limit?: number,
  ): Promise<BillPayment[]> => {
    if (limit && limit > 0) {
      return toDb(db)
        .select()
        .from(billPaymentTable)
        .where(eq(billPaymentTable.bill_id, billId))
        .orderBy(desc(billPaymentTable.paid_at))
        .limit(limit)
        .all()
        .map(toBillPayment);
    }
    return toDb(db)
      .select()
      .from(billPaymentTable)
      .where(eq(billPaymentTable.bill_id, billId))
      .orderBy(desc(billPaymentTable.paid_at))
      .all()
      .map(toBillPayment);
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
    toDb(db)
      .insert(billPaymentTable)
      .values({
        id: paymentId,
        bill_id,
        amount,
        wallet_id: wallet_id ?? null,
        status: paymentStatus,
        paid_at,
        created_at: now,
      })
      .run();
    const row = toDb(db)
      .select()
      .from(billPaymentTable)
      .where(eq(billPaymentTable.id, paymentId))
      .get();
    if (!row) {
      throw new Error("Failed to create bill payment");
    }
    return toBillPayment(row);
  },
};

export const monthlySummaryRepository = {
  list: async (db: SQLiteDatabase): Promise<MonthlySummary[]> => {
    return toDb(db).select().from(monthlySummaryTable).all();
  },
};

export const aiTokenLedgerRepository = {
  list: async (db: SQLiteDatabase): Promise<AITokenLedger[]> => {
    return toDb(db).select().from(aiTokenLedgerTable).all();
  },
};
