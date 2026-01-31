export type Locale = "en" | "ar";

type Dictionary = Record<string, string>;

export const strings: Record<Locale, Dictionary> = {
  en: {
    "tab.dashboard": "Dashboard",
    "tab.budgets": "Budgets",
    "tab.bills": "Bills",
    "screen.transaction.new": "New Transaction",
    "screen.transaction.details": "Transaction",
    "screen.budget.new": "New Budget",
    "screen.budget.details": "Budget",
    "screen.bill.new": "New Bill",
    "screen.bill.details": "Bill",
    "screen.ai": "Ameen AI",
    "placeholder.dashboard":
      "Overview of balances, budgets, and monthly summaries.",
    "placeholder.budgets": "Track monthly limits and category utilization.",
    "placeholder.bills": "Upcoming bills and subscriptions with due dates.",
    "language.en": "EN",
    "language.ar": "AR",
  },
  ar: {
    "tab.dashboard": "لوحة التحكم",
    "tab.budgets": "الميزانيات",
    "tab.bills": "الفواتير",
    "screen.transaction.new": "معاملة جديدة",
    "screen.transaction.details": "المعاملة",
    "screen.budget.new": "ميزانية جديدة",
    "screen.budget.details": "الميزانية",
    "screen.bill.new": "فاتورة جديدة",
    "screen.bill.details": "الفاتورة",
    "screen.ai": "أمين للذكاء الاصطناعي",
    "placeholder.dashboard": "نظرة عامة على الأرصدة والميزانيات والملخصات الشهرية.",
    "placeholder.budgets": "تتبّع حدود الشهر واستعمال الفئات.",
    "placeholder.bills": "الفواتير والاشتراكات القادمة مع تواريخ الاستحقاق.",
    "language.en": "EN",
    "language.ar": "ع",
  },
};
