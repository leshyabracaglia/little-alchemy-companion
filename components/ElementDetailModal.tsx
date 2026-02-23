import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { colors, getTierColor } from "../constants/colors";
import { Element, RECIPES_USING, TIER_NAMES } from "../constants/elements";
import { ElementIcon } from "./ElementIcon";
import { getElementById, getElementByName } from "../utils/elementUtils";

interface ElementDetailModalProps {
  element: Element | null;
  onClose: () => void;
  onSelectElement: (element: Element) => void;
}

function ModalHeader({
  element,
  onClose,
}: {
  element: Element;
  onClose: () => void;
}) {
  const tierColor = getTierColor(element.tier);
  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View style={styles.headerIconWrap}>
          <ElementIcon element={element} size={56} />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>{element.name}</Text>
          <View
            style={[styles.tierBadge, { backgroundColor: tierColor + "22" }]}
          >
            <Text style={[styles.tierBadgeText, { color: tierColor }]}>
              {TIER_NAMES[element.tier] ?? `Tier ${element.tier}`}
            </Text>
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>Done</Text>
      </TouchableOpacity>
    </View>
  );
}

function RecipeRow({
  ingredients,
  onSelectElement,
}: {
  ingredients: [string, string];
  onSelectElement: (element: Element) => void;
}) {
  const firstIngredientElement = getElementByName(ingredients[0]);
  const secondIngredientElement = getElementByName(ingredients[1]);

  const handleElementPress = (name: string) => {
    const ingredientElement = getElementByName(name);
    if (ingredientElement) onSelectElement(ingredientElement);
  };

  return (
    <View style={styles.recipeRow}>
      <TouchableOpacity
        style={styles.ingredientButton}
        onPress={() => handleElementPress(ingredients[0])}
      >
        {firstIngredientElement && (
          <ElementIcon element={firstIngredientElement} size={32} />
        )}
        <Text style={styles.ingredientText}>{ingredients[0]}</Text>
      </TouchableOpacity>
      <Text style={styles.plus}>+</Text>
      <TouchableOpacity
        style={styles.ingredientButton}
        onPress={() => handleElementPress(ingredients[1])}
      >
        {secondIngredientElement && (
          <ElementIcon element={secondIngredientElement} size={32} />
        )}
        <Text style={styles.ingredientText}>{ingredients[1]}</Text>
      </TouchableOpacity>
    </View>
  );
}

function RecipesSection({
  element,
  onSelectElement,
}: {
  element: Element;
  onSelectElement: (element: Element) => void;
}) {
  const { recipes, tier } = element;
  const emptyMessage =
    tier === 0
      ? "Available from the start"
      : "Unlocked after collecting 100 elements";

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Recipes</Text>
      {recipes.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        </View>
      ) : (
        recipes.map((recipe, index) => (
          <RecipeRow
            key={index}
            ingredients={recipe.ingredients}
            onSelectElement={onSelectElement}
          />
        ))
      )}
    </View>
  );
}

function UsedInSection({
  elementIds,
  onSelectElement,
}: {
  elementIds: string[];
  onSelectElement: (element: Element) => void;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        Used In ({elementIds.length} element{elementIds.length !== 1 ? "s" : ""}
        )
      </Text>
      {elementIds.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Not used in any other recipes</Text>
        </View>
      ) : (
        <View style={styles.usedInGrid}>
          {elementIds.map((elementId) => {
            const referencingElement = getElementById(elementId);
            if (!referencingElement) return null;
            return (
              <TouchableOpacity
                key={elementId}
                style={styles.usedInItem}
                onPress={() => onSelectElement(referencingElement)}
              >
                <ElementIcon element={referencingElement} size={48} />
                <Text style={styles.usedInName} numberOfLines={1}>
                  {referencingElement.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

export function ElementDetailModal({
  element,
  onClose,
  onSelectElement,
}: ElementDetailModalProps) {
  if (!element) return null;

  const elementIdsUsedInRecipes = RECIPES_USING[element.id] ?? [];

  return (
    <Modal
      visible={!!element}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <ModalHeader element={element} onClose={onClose} />
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <RecipesSection element={element} onSelectElement={onSelectElement} />
          <UsedInSection
            elementIds={elementIdsUsedInRecipes}
            onSelectElement={onSelectElement}
          />
          <View style={styles.bottomPadding} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 20,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerIconWrap: {
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 6,
  },
  tierBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tierBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  closeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  recipeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  ingredientButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  ingredientText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  plus: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: "600",
    marginHorizontal: 10,
  },
  usedInGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },
  usedInItem: {
    width: "33.33%",
    padding: 6,
    alignItems: "center",
  },
  usedInName: {
    color: colors.text,
    fontSize: 12,
    textAlign: "center",
    marginTop: 6,
  },
  bottomPadding: {
    height: 40,
  },
});
