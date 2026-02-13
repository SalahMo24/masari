import Typography from "@/src/components/typography.component";
import type { TransactionType } from "@/src/data/entities";
import { StyleSheet, TextInput, View } from "react-native";

export interface NoteSectionProps {
  mode: TransactionType;
  note: string;
  onNoteChange: (text: string) => void;
  // Labels
  whatForLabel: string;
  placeholder: string;
  // Theme colors
  textColor: string;
  mutedTextColor: string;
  borderColor: string;
  cardColor: string;
}

export function NoteSection({
  mode,
  note,
  onNoteChange,
  whatForLabel,
  placeholder,
  textColor,
  mutedTextColor,
  borderColor,
  cardColor,
}: NoteSectionProps) {
  if (mode === "transfer") {
    return null;
  }

  return (
    <View style={styles.section}>
      <Typography style={[styles.questionLabel, { color: textColor }]}>
        {whatForLabel}
      </Typography>
      <TextInput
        value={note}
        onChangeText={onNoteChange}
        placeholder={placeholder}
        placeholderTextColor={mutedTextColor}
        style={[
          mode === "expense" ? styles.noteInputUnderline : styles.noteInputBox,
          {
            color: textColor,
            borderColor: borderColor,
            backgroundColor:
              mode === "income" ? `${cardColor}CC` : "transparent",
          },
        ]}
        returnKeyType="done"
      />
      {mode === "expense" ? (
        <View style={[styles.underline, { backgroundColor: borderColor }]} />
      ) : null}

    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  questionLabel: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 10,
  },
  noteInputUnderline: {
    fontSize: 20,
    paddingVertical: 0,
  },
  underline: {
    height: 1,
    width: "100%",
    marginTop: 8,
  },
  noteInputBox: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
});
