import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { colors, getTierColor } from "../constants/colors";
import {
  Element,
  ELEMENT_BY_ID,
  RECIPES_USING,
  TIER_NAMES,
} from "../constants/elements";

interface ElementDetailModalProps {
  element: Element | null;
  onClose: () => void;
  onSelectElement: (element: Element) => void;
}

function toId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function getIconUrl(url: string | null, size: number = 72): string | null {
  if (!url) return null;
  return url.replace("/revision/latest", `/revision/latest/scale-to-width-down/${size}`);
}

function ElementIcon({ element, size = 40 }: { element: Element; size?: number }) {
  const tierColor = getTierColor(element.tier);
  const iconUrl = getIconUrl(element.iconUrl, size * 2);

  return (
    <View style={[styles.iconContainer, { width: size, height: size, backgroundColor: tierColor + "22" }]}>
      {iconUrl ? (
        <Image
          source={{ uri: iconUrl }}
          style={{ width: size * 0.75, height: size * 0.75 }}
          resizeMode="contain"
        />
      ) : (
        <Text style={[styles.iconText, { color: tierColor, fontSize: size * 0.4 }]}>
          {element.name.charAt(0)}
        </Text>
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

  const tierColor = getTierColor(element.tier);
  const usedIn = RECIPES_USING[element.id] || [];

  const handleElementPress = (name: string) => {
    const id = toId(name);
    const el = ELEMENT_BY_ID[id];
    if (el) {
      onSelectElement(el);
    }
  };

  const getIngredientElement = (name: string): Element | null => {
    const id = toId(name);
    return ELEMENT_BY_ID[id] || null;
  };

  return (
    <Modal
      visible={!!element}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <ElementIcon element={element} size={56} />
            <View style={styles.headerInfo}>
              <Text style={styles.title}>{element.name}</Text>
              <View
                style={[styles.tierBadge, { backgroundColor: tierColor + "22" }]}
              >
                <Text style={[styles.tierBadgeText, { color: tierColor }]}>
                  {TIER_NAMES[element.tier] || `Tier ${element.tier}`}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Done</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Recipes Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recipes</Text>
            {element.recipes.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  {element.tier === 0
                    ? "Available from the start"
                    : "Unlocked after collecting 100 elements"}
                </Text>
              </View>
            ) : (
              element.recipes.map((recipe, index) => {
                const el1 = getIngredientElement(recipe.ingredients[0]);
                const el2 = getIngredientElement(recipe.ingredients[1]);
                return (
                  <View key={index} style={styles.recipeRow}>
                    <TouchableOpacity
                      style={styles.ingredientButton}
                      onPress={() => handleElementPress(recipe.ingredients[0])}
                    >
                      {el1 && <ElementIcon element={el1} size={32} />}
                      <Text style={styles.ingredientText}>
                        {recipe.ingredients[0]}
                      </Text>
                    </TouchableOpacity>
                    <Text style={styles.plus}>+</Text>
                    <TouchableOpacity
                      style={styles.ingredientButton}
                      onPress={() => handleElementPress(recipe.ingredients[1])}
                    >
                      {el2 && <ElementIcon element={el2} size={32} />}
                      <Text style={styles.ingredientText}>
                        {recipe.ingredients[1]}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </View>

          {/* Used In Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Used In ({usedIn.length} element{usedIn.length !== 1 ? "s" : ""})
            </Text>
            {usedIn.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  Not used in any other recipes
                </Text>
              </View>
            ) : (
              <View style={styles.usedInGrid}>
                {usedIn.map((id) => {
                  const el = ELEMENT_BY_ID[id];
                  if (!el) return null;
                  return (
                    <TouchableOpacity
                      key={id}
                      style={styles.usedInItem}
                      onPress={() => onSelectElement(el)}
                    >
                      <ElementIcon element={el} size={48} />
                      <Text style={styles.usedInName} numberOfLines={1}>
                        {el.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

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
  iconContainer: {
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    overflow: "hidden",
  },
  iconText: {
    fontWeight: "bold",
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
