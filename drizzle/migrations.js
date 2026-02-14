// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import journal from './meta/_journal.json';

const m0000 = `CREATE TABLE \`AITokenLedger\` (
\t\`id\` text PRIMARY KEY NOT NULL,
\t\`month\` text NOT NULL,
\t\`tokens_used\` integer NOT NULL,
\t\`token_limit\` integer NOT NULL,
\t\`last_reset\` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE \`BillPayment\` (
\t\`id\` text PRIMARY KEY NOT NULL,
\t\`bill_id\` text NOT NULL,
\t\`amount\` real NOT NULL,
\t\`wallet_id\` text,
\t\`status\` text DEFAULT 'cleared' NOT NULL,
\t\`paid_at\` text NOT NULL,
\t\`created_at\` text NOT NULL,
\tFOREIGN KEY (\`bill_id\`) REFERENCES \`Bill\`(\`id\`) ON UPDATE no action ON DELETE no action,
\tFOREIGN KEY (\`wallet_id\`) REFERENCES \`Wallet\`(\`id\`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE \`Bill\` (
\t\`id\` text PRIMARY KEY NOT NULL,
\t\`name\` text NOT NULL,
\t\`amount\` real NOT NULL,
\t\`frequency\` text NOT NULL,
\t\`category_id\` text,
\t\`wallet_id\` text,
\t\`next_due_date\` text NOT NULL,
\t\`active\` integer DEFAULT true NOT NULL,
\t\`paid\` integer DEFAULT false NOT NULL,
\tFOREIGN KEY (\`category_id\`) REFERENCES \`Category\`(\`id\`) ON UPDATE no action ON DELETE no action,
\tFOREIGN KEY (\`wallet_id\`) REFERENCES \`Wallet\`(\`id\`) ON UPDATE no action ON DELETE no action,
\tCONSTRAINT "bill_frequency_check" CHECK("Bill"."frequency" IN ('monthly', 'quarterly', 'yearly'))
);
--> statement-breakpoint
CREATE TABLE \`Budget\` (
\t\`id\` text PRIMARY KEY NOT NULL,
\t\`category_id\` text NOT NULL,
\t\`monthly_limit\` real NOT NULL,
\t\`created_at\` text NOT NULL,
\tFOREIGN KEY (\`category_id\`) REFERENCES \`Category\`(\`id\`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX \`budget_category_id_unique\` ON \`Budget\` (\`category_id\`);--> statement-breakpoint
CREATE TABLE \`Category\` (
\t\`id\` text PRIMARY KEY NOT NULL,
\t\`name\` text NOT NULL,
\t\`icon\` text,
\t\`color\` text,
\t\`is_custom\` integer DEFAULT false NOT NULL,
\t\`created_at\` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE \`MonthlySummary\` (
\t\`id\` text PRIMARY KEY NOT NULL,
\t\`month\` text NOT NULL,
\t\`total_income\` real NOT NULL,
\t\`total_expenses\` real NOT NULL,
\t\`savings\` real NOT NULL,
\t\`created_at\` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE \`Transaction\` (
\t\`id\` text PRIMARY KEY NOT NULL,
\t\`amount\` real NOT NULL,
\t\`type\` text NOT NULL,
\t\`category_id\` text,
\t\`wallet_id\` text,
\t\`target_wallet_id\` text,
\t\`note\` text,
\t\`occurred_at\` text NOT NULL,
\t\`created_at\` text NOT NULL,
\tFOREIGN KEY (\`category_id\`) REFERENCES \`Category\`(\`id\`) ON UPDATE no action ON DELETE no action,
\tFOREIGN KEY (\`wallet_id\`) REFERENCES \`Wallet\`(\`id\`) ON UPDATE no action ON DELETE no action,
\tFOREIGN KEY (\`target_wallet_id\`) REFERENCES \`Wallet\`(\`id\`) ON UPDATE no action ON DELETE no action,
\tCONSTRAINT "transaction_type_check" CHECK("Transaction"."type" IN ('income', 'expense', 'transfer'))
);
--> statement-breakpoint
CREATE TABLE \`User\` (
\t\`id\` text PRIMARY KEY NOT NULL,
\t\`created_at\` text NOT NULL,
\t\`currency\` text DEFAULT 'EGP' NOT NULL,
\t\`locale\` text DEFAULT 'ar-EG' NOT NULL,
\t\`onboarding_completed\` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE \`Wallet\` (
\t\`id\` text PRIMARY KEY NOT NULL,
\t\`name\` text NOT NULL,
\t\`type\` text NOT NULL,
\t\`balance\` real NOT NULL,
\t\`created_at\` text NOT NULL,
\tCONSTRAINT "wallet_type_check" CHECK("Wallet"."type" IN ('cash', 'bank'))
);`;

  export default {
    journal,
    migrations: {
      m0000
    }
  }
  