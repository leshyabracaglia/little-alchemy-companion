
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { colors, getTierColor } from "../constants/colors";
import { Element } from "../constants/elements";

interface ElementCardProps {
  element: Element;
  onPress: () => void;
}

function getIconUrl(url: string | null): string | null {
  if (!url) return null;
  // Convert SVG URL to PNG by adding scale parameter
  return url.replace("/revision/latest", "/revision/latest/scale-to-width-down/72");
}

export function ElementCard({ element, onPress }: ElementCardProps) {
  const tierColor = getTierColor(element.tier);
  const iconUrl = getIconUrl(element.iconUrl);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: tierColor + "22" }]}>
        {iconUrl ? (
          <Image
            source={{ uri: iconUrl }}
            style={styles.icon}
            resizeMode="contain"
          />
        ) : (
          <Text style={[styles.iconText, { color: tierColor }]}>
            {element.name.charAt(0)}
          </Text>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{element.name}</Text>
        <Text style={styles.recipes}>
          {element.recipes.length === 0
            ? element.tier === 0
              ? "Starter"
              : "Special"
            : `${element.recipes.length} recipe${element.recipes.length !== 1 ? "s" : ""}`}
        </Text>
      </View>
      <View style={[styles.tierBadge, { backgroundColor: tierColor + "22" }]}>
        <Text style={[styles.tierText, { color: tierColor }]}>
          {element.tier === -1 ? "Special" : element.tier === 0 ? "Start" : `T${element.tier}`}
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
  icon: {
    width: 36,
    height: 36,
  },
  iconText: {
    fontSize: 20,
    fontWeight: "bold",
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
});
