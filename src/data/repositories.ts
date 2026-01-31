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

async function ensureReady(): Promise<void> {
  await initializeDatabase();
}

export const userRepository = {
  getLocalUser: async (): Promise<User | null> => {
    await ensureReady();
    return null;
  },
};

export const walletRepository = {
  list: async (): Promise<Wallet[]> => {
    await ensureReady();
    return [];
  },
  getById: async (_id: string): Promise<Wallet | null> => {
    await ensureReady();
    return null;
  },
};

export const categoryRepository = {
  list: async (): Promise<Category[]> => {
    await ensureReady();
    return [];
  },
  getById: async (_id: string): Promise<Category | null> => {
    await ensureReady();
    return null;
  },
};

export const budgetRepository = {
  list: async (): Promise<Budget[]> => {
    await ensureReady();
    return [];
  },
  getById: async (_id: string): Promise<Budget | null> => {
    await ensureReady();
    return null;
  },
};

export const transactionRepository = {
  list: async (): Promise<Transaction[]> => {
    await ensureReady();
    return [];
  },
  getById: async (_id: string): Promise<Transaction | null> => {
    await ensureReady();
    return null;
  },
};

export const billRepository = {
  list: async (): Promise<Bill[]> => {
    await ensureReady();
    return [];
  },
  getById: async (_id: string): Promise<Bill | null> => {
    await ensureReady();
    return null;
  },
};

export const monthlySummaryRepository = {
  list: async (): Promise<MonthlySummary[]> => {
    await ensureReady();
    return [];
  },
};

export const aiTokenLedgerRepository = {
  list: async (): Promise<AITokenLedger[]> => {
    await ensureReady();
    return [];
  },
};
