import Typography from "@/src/components/typography.component";
import type { Category, ID } from "@/src/data/entities";
import { MaterialIcons } from "@/src/components/icons/legacyVectorIcons";
import { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
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
  close: string;
  empty: string;
};

export type TransactionCategoryPickerProps = {
  selectedId: ID | null;
  categories: Category[];
  colors: CategoryPickerColors;
  labels: CategoryPickerLabels;
  onSelect: (id: ID) => void;
};

export function TransactionCategoryPicker({
  selectedId,
  categories,
  colors,
  labels,
  onSelect,
}: TransactionCategoryPickerProps) {
  const [isVisible, setVisible] = useState(false);

  const selectedCategoryName = useMemo(
    () => categories.find((item) => item.id === selectedId)?.name ?? null,
    [categories, selectedId],
  );

  const openSheet = () => setVisible(true);
  const closeSheet = () => setVisible(false);

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
                {labels.pickTitle}
              </Typography>
              <Pressable
                onPress={closeSheet}
                accessibilityLabel={labels.close}
                style={({ pressed }) => [pressed && { opacity: 0.72 }]}
              >
                <MaterialIcons name="close" size={20} color={colors.mutedText} />
              </Pressable>
            </View>

            {categories.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Typography variant="small" color={colors.mutedText}>
                  {labels.empty}
                </Typography>
              </View>
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
              >
                {categories.map((category) => {
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
                      <Typography
                        variant="small"
                        weight={isActive ? "700" : "600"}
                        color={isActive ? colors.accent : colors.text}
                        style={styles.itemText}
                      >
                        {category.name}
                      </Typography>
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
  itemButton: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemText: {
    flexShrink: 1,
  },
  emptyWrap: {
    paddingVertical: 28,
    alignItems: "center",
  },
});
