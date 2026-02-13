import Typography from "@/src/components/typography.component";
import type { Category, ID } from "@/src/data/entities";
import {
  MaterialIcons,
  type AppIconName,
} from "@/src/components/icons/legacyVectorIcons";
import { useI18n } from "@/src/i18n/useI18n";
import { getCategoryIconName } from "@/src/utils/categories/icons";
import { getCategoryLabel } from "@/src/utils/categories/labels";
import { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type ColorValue,
} from "react-native";

type CategoryPickerColors = {
  text: string;
  mutedText: string;
  border: string;
  card: string;
  background: string;
  accent: string;
};

type CategoryPickerLabels = {
  triggerPlaceholder: string;
  pickTitle: string;
  frequentTitle: string;
  allTitle: string;
  createCategory: string;
  createTitle: string;
  categoryNameLabel: string;
  categoryNamePlaceholder: string;
  categoryIconLabel: string;
  createSave: string;
  createSaving: string;
  createCancel: string;
  errorNameEmpty: string;
  errorNameExists: string;
  errorCreateCategory: string;
  close: string;
  empty: string;
};

export type TransactionCategoryPickerProps = {
  selectedId: ID | null;
  categories: Category[];
  frequentCategories: Category[];
  colors: CategoryPickerColors;
  labels: CategoryPickerLabels;
  onSelect: (id: ID) => void;
  onCreateCategory: (input: { name: string; icon: AppIconName }) => Promise<boolean>;
};

const ICON_OPTIONS: AppIconName[] = [
  "shopping-basket",
  "shopping-cart",
  "restaurant",
  "directions-car",
  "receipt-long",
  "payments",
  "work",
  "add-circle",
  "home",
  "bolt",
  "account-balance-wallet",
  "category",
];

export function TransactionCategoryPicker({
  selectedId,
  categories,
  frequentCategories,
  colors,
  labels,
  onSelect,
  onCreateCategory,
}: TransactionCategoryPickerProps) {
  const [isVisible, setVisible] = useState(false);
  const [isCreating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<AppIconName>(ICON_OPTIONS[0]);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);
  const { locale, t } = useI18n();

  const categoriesById = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  );
  const frequentVisible = useMemo(() => {
    const seen = new Set<string>();
    return frequentCategories.filter((category) => {
      if (seen.has(category.id)) return false;
      if (!categoriesById.has(category.id)) return false;
      seen.add(category.id);
      return true;
    });
  }, [categoriesById, frequentCategories]);
  const regularCategories = useMemo(() => {
    if (frequentVisible.length === 0) return categories;
    const frequentIds = new Set(frequentVisible.map((category) => category.id));
    return categories.filter((category) => !frequentIds.has(category.id));
  }, [categories, frequentVisible]);

  const selectedCategory = useMemo(
    () => categories.find((item) => item.id === selectedId) ?? null,
    [categories, selectedId],
  );
  const selectedCategoryName = selectedCategory
    ? getCategoryLabel(selectedCategory, locale, t)
    : null;

  const openSheet = () => setVisible(true);
  const closeSheet = () => {
    setVisible(false);
    setCreating(false);
    setCreateError(null);
    setSubmitting(false);
  };
  const openCreate = () => {
    setCreating(true);
    setName("");
    setSelectedIcon(ICON_OPTIONS[0]);
    setCreateError(null);
  };
  const closeCreate = () => {
    setCreating(false);
    setCreateError(null);
    setSubmitting(false);
  };
  const handleCreate = async () => {
    if (isSubmitting) return;
    const trimmedName = name.trim();
    if (!trimmedName) {
      setCreateError(labels.errorNameEmpty);
      return;
    }
    const exists = categories.some(
      (category) =>
        category.name.trim().toLowerCase() === trimmedName.toLowerCase(),
    );
    if (exists) {
      setCreateError(labels.errorNameExists);
      return;
    }

    try {
      setSubmitting(true);
      const created = await onCreateCategory({ name: trimmedName, icon: selectedIcon });
      if (!created) {
        setCreateError(labels.errorCreateCategory);
        return;
      }
      closeSheet();
    } catch (error) {
      console.error(error);
      setCreateError(labels.errorCreateCategory);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <View style={styles.triggerWrap}>
        <Pressable
          onPress={openSheet}
          style={({ pressed }) => [
            styles.triggerButton,
            {
              borderColor: colors.border,
              backgroundColor: colors.card,
              opacity: pressed ? 0.9 : 1,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={labels.pickTitle}
        >
          <Typography
            variant="small"
            weight="700"
            color={selectedCategoryName ? colors.text : colors.mutedText}
            style={styles.triggerText}
          >
            {selectedCategoryName ?? labels.triggerPlaceholder}
          </Typography>
          <MaterialIcons name="expand-more" size={18} color={colors.mutedText} />
        </Pressable>
      </View>

      <Modal
        transparent
        visible={isVisible}
        animationType="slide"
        onRequestClose={closeSheet}
      >
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={closeSheet} />
          <View
            style={[
              styles.sheet,
              {
                backgroundColor: colors.background,
                borderTopColor: withAlpha(colors.border, "66"),
              },
            ]}
          >
            <View
              style={[
                styles.handle,
                { backgroundColor: withAlpha(colors.border, "AA") },
              ]}
            />
            <View style={styles.headerRow}>
              <Typography variant="subtitle" weight="700" color={colors.text}>
                {isCreating ? labels.createTitle : labels.pickTitle}
              </Typography>
              <Pressable
                onPress={closeSheet}
                accessibilityLabel={labels.close}
                style={({ pressed }) => [pressed && { opacity: 0.72 }]}
              >
                <MaterialIcons name="close" size={20} color={colors.mutedText} />
              </Pressable>
            </View>

            {isCreating ? (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.formContent}
                keyboardShouldPersistTaps="handled"
              >
                <Typography variant="small" weight="700" color={colors.text}>
                  {labels.categoryNameLabel}
                </Typography>
                <TextInput
                  value={name}
                  onChangeText={(value) => {
                    setName(value);
                    if (createError) setCreateError(null);
                  }}
                  placeholder={labels.categoryNamePlaceholder}
                  placeholderTextColor={colors.mutedText}
                  style={[
                    styles.nameInput,
                    {
                      color: colors.text,
                      borderColor: colors.border,
                      backgroundColor: colors.card,
                    },
                  ]}
                  autoCapitalize="words"
                  returnKeyType="done"
                />

                <Typography
                  variant="small"
                  weight="700"
                  color={colors.text}
                  style={styles.iconLabel}
                >
                  {labels.categoryIconLabel}
                </Typography>
                <View style={styles.iconGrid}>
                  {ICON_OPTIONS.map((iconName) => {
                    const isIconActive = selectedIcon === iconName;
                    return (
                      <Pressable
                        key={iconName}
                        onPress={() => {
                          setSelectedIcon(iconName);
                          if (createError) setCreateError(null);
                        }}
                        style={({ pressed }) => [
                          styles.iconButton,
                          {
                            borderColor: isIconActive
                              ? withAlpha(colors.accent, "55")
                              : colors.border,
                            backgroundColor: isIconActive
                              ? withAlpha(colors.accent, "12")
                              : colors.card,
                            opacity: pressed ? 0.85 : 1,
                          },
                        ]}
                      >
                        <MaterialIcons
                          name={iconName}
                          size={20}
                          color={isIconActive ? colors.accent : colors.mutedText}
                        />
                      </Pressable>
                    );
                  })}
                </View>

                {createError ? (
                  <Typography variant="small" color={colors.accent}>
                    {createError}
                  </Typography>
                ) : null}

                <View style={styles.formActions}>
                  <Pressable
                    onPress={closeCreate}
                    style={({ pressed }) => [
                      styles.formSecondary,
                      {
                        borderColor: colors.border,
                        backgroundColor: colors.card,
                        opacity: pressed ? 0.85 : 1,
                      },
                    ]}
                  >
                    <Typography variant="small" weight="700" color={colors.text}>
                      {labels.createCancel}
                    </Typography>
                  </Pressable>

                  <Pressable
                    onPress={handleCreate}
                    style={({ pressed }) => [
                      styles.formPrimary,
                      {
                        borderColor: withAlpha(colors.accent, "66"),
                        backgroundColor: withAlpha(colors.accent, "14"),
                        opacity: pressed || isSubmitting ? 0.85 : 1,
                      },
                    ]}
                    disabled={isSubmitting}
                  >
                    <Typography variant="small" weight="700" color={colors.accent}>
                      {isSubmitting ? labels.createSaving : labels.createSave}
                    </Typography>
                  </Pressable>
                </View>
              </ScrollView>
            ) : categories.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Typography variant="small" color={colors.mutedText}>
                  {labels.empty}
                </Typography>
                <Pressable
                  onPress={openCreate}
                  style={({ pressed }) => [
                    styles.createButton,
                    {
                      borderColor: withAlpha(colors.accent, "55"),
                      backgroundColor: withAlpha(colors.accent, "12"),
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}
                >
                  <MaterialIcons name="add-circle" size={16} color={colors.accent} />
                  <Typography variant="small" weight="700" color={colors.accent}>
                    {labels.createCategory}
                  </Typography>
                </Pressable>
              </View>
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
              >
                <Pressable
                  onPress={openCreate}
                  style={({ pressed }) => [
                    styles.createButton,
                    {
                      borderColor: withAlpha(colors.accent, "55"),
                      backgroundColor: withAlpha(colors.accent, "12"),
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}
                >
                  <MaterialIcons name="add-circle" size={16} color={colors.accent} />
                  <Typography variant="small" weight="700" color={colors.accent}>
                    {labels.createCategory}
                  </Typography>
                </Pressable>

                {frequentVisible.length > 0 ? (
                  <View style={styles.sectionWrap}>
                    <Typography variant="small" weight="700" color={colors.mutedText}>
                      {labels.frequentTitle}
                    </Typography>
                    <View style={styles.sectionList}>
                      {frequentVisible.map((category) => {
                        const isActive = category.id === selectedId;
                        return (
                          <Pressable
                            key={category.id}
                            onPress={() => {
                              onSelect(category.id);
                              closeSheet();
                            }}
                            style={({ pressed }) => [
                              styles.itemButton,
                              {
                                borderColor: isActive
                                  ? withAlpha(colors.accent, "55")
                                  : colors.border,
                                backgroundColor: isActive
                                  ? withAlpha(colors.accent, "12")
                                  : colors.card,
                                opacity: pressed ? 0.85 : 1,
                              },
                            ]}
                          >
                            <View style={styles.itemLeft}>
                              <MaterialIcons
                                name={getCategoryIconName(category.name, category.icon)}
                                size={18}
                                color={isActive ? colors.accent : colors.mutedText}
                              />
                              <Typography
                                variant="small"
                                weight={isActive ? "700" : "600"}
                                color={isActive ? colors.accent : colors.text}
                                style={styles.itemText}
                              >
                                {getCategoryLabel(category, locale, t)}
                              </Typography>
                            </View>
                            {isActive ? (
                              <MaterialIcons
                                name="check-circle"
                                size={18}
                                color={colors.accent}
                              />
                            ) : null}
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                ) : null}

                <View style={styles.sectionWrap}>
                  <Typography variant="small" weight="700" color={colors.mutedText}>
                    {labels.allTitle}
                  </Typography>
                  <View style={styles.sectionList}>
                    {regularCategories.map((category) => {
                      const isActive = category.id === selectedId;
                      return (
                        <Pressable
                          key={category.id}
                          onPress={() => {
                            onSelect(category.id);
                            closeSheet();
                          }}
                          style={({ pressed }) => [
                            styles.itemButton,
                            {
                              borderColor: isActive
                                ? withAlpha(colors.accent, "55")
                                : colors.border,
                              backgroundColor: isActive
                                ? withAlpha(colors.accent, "12")
                                : colors.card,
                              opacity: pressed ? 0.85 : 1,
                            },
                          ]}
                        >
                          <View style={styles.itemLeft}>
                            <MaterialIcons
                              name={getCategoryIconName(category.name, category.icon)}
                              size={18}
                              color={isActive ? colors.accent : colors.mutedText}
                            />
                            <Typography
                              variant="small"
                              weight={isActive ? "700" : "600"}
                              color={isActive ? colors.accent : colors.text}
                              style={styles.itemText}
                            >
                              {getCategoryLabel(category, locale, t)}
                            </Typography>
                          </View>
                          {isActive ? (
                            <MaterialIcons
                              name="check-circle"
                              size={18}
                              color={colors.accent}
                            />
                          ) : null}
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

function withAlpha(color: string, alphaHex: string): ColorValue {
  if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
    return `${color}${alphaHex}`;
  }
  return color;
}

const styles = StyleSheet.create({
  triggerWrap: {
    paddingHorizontal: 16,
    paddingTop: 10,
    alignItems: "center",
  },
  triggerButton: {
    minHeight: 42,
    maxWidth: "80%",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  triggerText: {
    textAlign: "center",
  },
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheet: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
    maxHeight: "72%",
  },
  handle: {
    width: 48,
    height: 5,
    borderRadius: 999,
    alignSelf: "center",
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  listContent: {
    gap: 8,
    paddingBottom: 6,
  },
  sectionWrap: {
    gap: 8,
  },
  sectionList: {
    gap: 8,
  },
  createButton: {
    minHeight: 42,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  itemButton: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexShrink: 1,
  },
  itemText: {
    flexShrink: 1,
  },
  emptyWrap: {
    paddingVertical: 28,
    alignItems: "center",
    gap: 12,
  },
  formContent: {
    gap: 10,
    paddingBottom: 6,
  },
  nameInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    minHeight: 44,
    fontSize: 14,
  },
  iconLabel: {
    marginTop: 2,
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  formActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  formSecondary: {
    flex: 1,
    minHeight: 42,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  formPrimary: {
    flex: 1,
    minHeight: 42,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
