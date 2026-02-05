import type { Category, ID, TransactionType } from "@/src/data/entities";
import { categoryRepository } from "@/src/data/repositories";
import { useI18n } from "@/src/i18n/useI18n";
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
  /** Candidate name for creating a new category from note */
  createCategoryCandidate: string | null;
  /** Set the selected category ID */
  setSelectedCategoryId: (id: ID | null) => void;
  /** Create a new category from the candidate name */
  onCreateCategory: () => Promise<void>;
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
  note: string
): UseCategorySelectionResult {
  const { t } = useI18n();
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
      INCOME_QUICK_NAMES.has(c.name.toLowerCase())
    );
  }, [categories]);

  const expenseCategories = useMemo(() => {
    // If a category name matches income quick chips, hide it from expense chips.
    return categories.filter(
      (c) => !INCOME_QUICK_NAMES.has(c.name.toLowerCase())
    );
  }, [categories]);

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === selectedCategoryId) ?? null,
    [categories, selectedCategoryId]
  );

  const createCategoryCandidate = useMemo(() => {
    const name = note.trim();
    if (!name) return null;
    const exists = categories.some(
      (c) => c.name.trim().toLowerCase() === name.toLowerCase()
    );
    if (exists) return null;
    // For transfers, categories are irrelevant.
    if (mode === "transfer") return null;
    return name;
  }, [categories, mode, note]);

  const onCreateCategory = useCallback(async () => {
    if (!createCategoryCandidate) return;
    try {
      const created = await categoryRepository.create({
        name: createCategoryCandidate,
        icon: null,
        color: null,
        is_custom: true,
      });
      setCategories((prev) => [...prev, created]);
      setSelectedCategoryId(created.id);
    } catch (error) {
      console.error(error);
      Alert.alert(
        t("transaction.error"),
        t("transaction.error.createCategory")
      );
    }
  }, [createCategoryCandidate]);

  return {
    selectedCategoryId,
    selectedCategory,
    expenseCategories,
    incomeQuickCategories,
    createCategoryCandidate,
    setSelectedCategoryId,
    onCreateCategory,
    setCategories,
  };
}
