import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors, getTierColor } from "../constants/colors";
import { Element } from "../constants/elements";
import { ElementIcon } from "./ElementIcon";
import { getTierDisplayText } from "../utils/elementUtils";

function getElementCardSubtitle(element: Element, isLocked: boolean): string {
  if (isLocked) return "Premium element";
  if (element.recipes.length === 0 && element.tier === 0) return "Starter";
  if (element.recipes.length === 0) return "Special";
  const recipeCount = element.recipes.length;
  const pluralSuffix = recipeCount !== 1 ? "s" : "";
  return `${recipeCount} recipe${pluralSuffix}`;
}

interface ElementCardProps {
  element: Element;
  onPress: () => void;
  isLocked?: boolean;
}

export function ElementCard({
  element,
  onPress,
  isLocked = false,
}: ElementCardProps) {
  const tierColor = getTierColor(element.tier);

  return (
    <TouchableOpacity
      style={[styles.card, isLocked && styles.cardLocked]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[styles.iconContainer, { backgroundColor: tierColor + "22" }]}
      >
        {isLocked ? (
          <Text style={styles.lockIcon}>🔒</Text>
        ) : (
          <ElementIcon element={element} size={48} />
        )}
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, isLocked && styles.textLocked]}>
          {element.name}
        </Text>
        <Text style={[styles.recipes, isLocked && styles.textLocked]}>
          {getElementCardSubtitle(element, isLocked)}
        </Text>
      </View>
      <View style={[styles.tierBadge, { backgroundColor: tierColor + "22" }]}>
        <Text
          style={[
            styles.tierText,
            { color: isLocked ? colors.textMuted : tierColor },
          ]}
        >
          {getTierDisplayText(element.tier)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconContainer: {
    marginRight: 12,
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  recipes: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tierText: {
    fontSize: 12,
    fontWeight: "600",
  },
  cardLocked: {
    opacity: 0.5,
  },
  lockIcon: {
    fontSize: 20,
  },
  textLocked: {
    color: colors.textMuted,
  },
});
