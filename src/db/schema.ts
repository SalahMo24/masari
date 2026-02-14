import { sql, type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import { check, integer, real, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";

export const userTable = sqliteTable("User", {
  id: text("id").primaryKey(),
  created_at: text("created_at").notNull(),
  currency: text("currency").notNull().default("EGP"),
  locale: text("locale").notNull().default("ar-EG"),
  onboarding_completed: integer("onboarding_completed", {
    mode: "boolean",
  })
    .notNull()
    .default(false),
});

export const walletTable = sqliteTable(
  "Wallet",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    type: text("type").notNull(),
    balance: real("balance").notNull(),
    created_at: text("created_at").notNull(),
  },
  (table) => [check("wallet_type_check", sql`${table.type} IN ('cash', 'bank')`)],
);

export const categoryTable = sqliteTable("Category", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon"),
  color: text("color"),
  is_custom: integer("is_custom", { mode: "boolean" }).notNull().default(false),
  created_at: text("created_at").notNull(),
});

export const budgetTable = sqliteTable(
  "Budget",
  {
    id: text("id").primaryKey(),
    category_id: text("category_id")
      .notNull()
      .references(() => categoryTable.id),
    monthly_limit: real("monthly_limit").notNull(),
    created_at: text("created_at").notNull(),
  },
  (table) => [unique("budget_category_id_unique").on(table.category_id)],
);

export const transactionTable = sqliteTable(
  "Transaction",
  {
    id: text("id").primaryKey(),
    amount: real("amount").notNull(),
    type: text("type").notNull(),
    category_id: text("category_id").references(() => categoryTable.id),
    wallet_id: text("wallet_id").references(() => walletTable.id),
    target_wallet_id: text("target_wallet_id").references(() => walletTable.id),
    note: text("note"),
    occurred_at: text("occurred_at").notNull(),
    created_at: text("created_at").notNull(),
  },
  (table) => [
    check(
      "transaction_type_check",
      sql`${table.type} IN ('income', 'expense', 'transfer')`,
    ),
  ],
);

export const billTable = sqliteTable(
  "Bill",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    amount: real("amount").notNull(),
    frequency: text("frequency").notNull(),
    category_id: text("category_id").references(() => categoryTable.id),
    wallet_id: text("wallet_id").references(() => walletTable.id),
    next_due_date: text("next_due_date").notNull(),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    paid: integer("paid", { mode: "boolean" }).notNull().default(false),
  },
  (table) => [
    check(
      "bill_frequency_check",
      sql`${table.frequency} IN ('monthly', 'quarterly', 'yearly')`,
    ),
  ],
);

export const billPaymentTable = sqliteTable("BillPayment", {
  id: text("id").primaryKey(),
  bill_id: text("bill_id")
    .notNull()
    .references(() => billTable.id),
  amount: real("amount").notNull(),
  wallet_id: text("wallet_id").references(() => walletTable.id),
  status: text("status").notNull().default("cleared"),
  paid_at: text("paid_at").notNull(),
  created_at: text("created_at").notNull(),
});

export const monthlySummaryTable = sqliteTable("MonthlySummary", {
  id: text("id").primaryKey(),
  month: text("month").notNull(),
  total_income: real("total_income").notNull(),
  total_expenses: real("total_expenses").notNull(),
  savings: real("savings").notNull(),
  created_at: text("created_at").notNull(),
});

export const aiTokenLedgerTable = sqliteTable("AITokenLedger", {
  id: text("id").primaryKey(),
  month: text("month").notNull(),
  tokens_used: integer("tokens_used").notNull(),
  token_limit: integer("token_limit").notNull(),
  last_reset: text("last_reset").notNull(),
});

export const schema = {
  userTable,
  walletTable,
  categoryTable,
  budgetTable,
  transactionTable,
  billTable,
  billPaymentTable,
  monthlySummaryTable,
  aiTokenLedgerTable,
};

export type UserRow = InferSelectModel<typeof userTable>;
export type WalletRow = InferSelectModel<typeof walletTable>;
export type CategoryRow = InferSelectModel<typeof categoryTable>;
export type BudgetRow = InferSelectModel<typeof budgetTable>;
export type TransactionRow = InferSelectModel<typeof transactionTable>;
export type BillRow = InferSelectModel<typeof billTable>;
export type BillPaymentRow = InferSelectModel<typeof billPaymentTable>;
export type MonthlySummaryRow = InferSelectModel<typeof monthlySummaryTable>;
export type AITokenLedgerRow = InferSelectModel<typeof aiTokenLedgerTable>;

export type NewUserRow = InferInsertModel<typeof userTable>;
export type NewWalletRow = InferInsertModel<typeof walletTable>;
export type NewCategoryRow = InferInsertModel<typeof categoryTable>;
export type NewBudgetRow = InferInsertModel<typeof budgetTable>;
export type NewTransactionRow = InferInsertModel<typeof transactionTable>;
export type NewBillRow = InferInsertModel<typeof billTable>;
export type NewBillPaymentRow = InferInsertModel<typeof billPaymentTable>;
export type NewMonthlySummaryRow = InferInsertModel<typeof monthlySummaryTable>;
export type NewAITokenLedgerRow = InferInsertModel<typeof aiTokenLedgerTable>;
