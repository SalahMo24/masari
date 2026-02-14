CREATE TABLE `AITokenLedger` (
	`id` text PRIMARY KEY NOT NULL,
	`month` text NOT NULL,
	`tokens_used` integer NOT NULL,
	`token_limit` integer NOT NULL,
	`last_reset` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `BillPayment` (
	`id` text PRIMARY KEY NOT NULL,
	`bill_id` text NOT NULL,
	`amount` real NOT NULL,
	`wallet_id` text,
	`status` text DEFAULT 'cleared' NOT NULL,
	`paid_at` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`bill_id`) REFERENCES `Bill`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`wallet_id`) REFERENCES `Wallet`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `Bill` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`amount` real NOT NULL,
	`frequency` text NOT NULL,
	`category_id` text,
	`wallet_id` text,
	`next_due_date` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`paid` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `Category`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`wallet_id`) REFERENCES `Wallet`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "bill_frequency_check" CHECK("Bill"."frequency" IN ('monthly', 'quarterly', 'yearly'))
);
--> statement-breakpoint
CREATE TABLE `Budget` (
	`id` text PRIMARY KEY NOT NULL,
	`category_id` text NOT NULL,
	`monthly_limit` real NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `Category`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `budget_category_id_unique` ON `Budget` (`category_id`);--> statement-breakpoint
CREATE TABLE `Category` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`icon` text,
	`color` text,
	`is_custom` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `MonthlySummary` (
	`id` text PRIMARY KEY NOT NULL,
	`month` text NOT NULL,
	`total_income` real NOT NULL,
	`total_expenses` real NOT NULL,
	`savings` real NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Transaction` (
	`id` text PRIMARY KEY NOT NULL,
	`amount` real NOT NULL,
	`type` text NOT NULL,
	`category_id` text,
	`wallet_id` text,
	`target_wallet_id` text,
	`note` text,
	`occurred_at` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `Category`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`wallet_id`) REFERENCES `Wallet`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`target_wallet_id`) REFERENCES `Wallet`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "transaction_type_check" CHECK("Transaction"."type" IN ('income', 'expense', 'transfer'))
);
--> statement-breakpoint
CREATE TABLE `User` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	`currency` text DEFAULT 'EGP' NOT NULL,
	`locale` text DEFAULT 'ar-EG' NOT NULL,
	`onboarding_completed` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Wallet` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`balance` real NOT NULL,
	`created_at` text NOT NULL,
	CONSTRAINT "wallet_type_check" CHECK("Wallet"."type" IN ('cash', 'bank'))
);
