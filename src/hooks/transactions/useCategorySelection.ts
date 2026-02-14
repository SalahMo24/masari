import type { Category, ID, TransactionType } from "@/src/data/entities";
import { categoryRepository } from "@/src/data/repositories";
import { useI18n } from "@/src/i18n/useI18n";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";

export interface UseCategorySelectionResult {
  /** Currently selected category ID */
  selectedCategoryId: ID | null;
  /** Selected category object */
  selectedCategory: Category | null;
  /** Categories filtered for expense mode */
  expenseCategories: Category[];
  /** Quick-access categories for income mode */
  incomeQuickCategories: Category[];
  /** Set the selected category ID */
  setSelectedCategoryId: (id: ID | null) => void;
  /** Create a new custom category and select it */
  onCreateCategory: (
    input: Pick<Category, "name" | "icon" | "color">,
  ) => Promise<Category | null>;
  /** Update categories list (used after creating a category) */
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

const INCOME_QUICK_NAMES = new Set(["salary", "gift", "side hustle", "refund"]);

/**
 * Hook for managing category selection and filtering.
 */
export function useCategorySelection(
  initialCategories: Category[],
  mode: TransactionType,
): UseCategorySelectionResult {
  const { t } = useI18n();
  const db = useSQLiteContext();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [selectedCategoryId, setSelectedCategoryId] = useState<ID | null>(null);

  // Sync categories when initial categories change
  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  // Reset category selection when switching to transfer mode
  useEffect(() => {
    if (mode === "transfer") {
      setSelectedCategoryId(null);
    }
  }, [mode]);

  const incomeQuickCategories = useMemo(() => {
    return categories.filter((c) =>
      INCOME_QUICK_NAMES.has(c.name.toLowerCase()),
    );
  }, [categories]);

  const expenseCategories = useMemo(() => {
    // If a category name matches income quick chips, hide it from expense chips.
    return categories.filter(
      (c) => !INCOME_QUICK_NAMES.has(c.name.toLowerCase()),
    );
  }, [categories]);

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === selectedCategoryId) ?? null,
    [categories, selectedCategoryId],
  );

  const onCreateCategory = useCallback(
    async (input: Pick<Category, "name" | "icon" | "color">) => {
      if (mode === "transfer") return null;
      const name = input.name.trim();
      if (!name) return null;
      const exists = categories.some(
        (category) => category.name.trim().toLowerCase() === name.toLowerCase(),
      );
      if (exists) return null;
      try {
        const created = await categoryRepository.create(db, {
          name,
          icon: input.icon ?? null,
          color: input.color ?? null,
          is_custom: true,
        });
        setCategories((prev) => [...prev, created]);
        setSelectedCategoryId(created.id);
        return created;
      } catch (error) {
        console.error(error);
        Alert.alert(
          t("transaction.error"),
          t("transaction.error.createCategory"),
        );
        return null;
      }
    },
    [categories, db, mode, t],
  );

  return {
    selectedCategoryId,
    selectedCategory,
    expenseCategories,
    incomeQuickCategories,
    setSelectedCategoryId,
    onCreateCategory,
    setCategories,
  };
}
