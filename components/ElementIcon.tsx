import { View, Text, StyleSheet, Image } from "react-native";
import { getTierColor } from "../constants/colors";
import { Element } from "../constants/elements";
import { getIconUrl } from "../utils/elementUtils";

export interface ElementIconProps {
  element: Element;
  size?: number;
}

export function ElementIcon({ element, size = 40 }: ElementIconProps) {
  const tierColor = getTierColor(element.tier);
  const iconUrl = getIconUrl(element.iconUrl, size * 2);

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          backgroundColor: tierColor + "22",
        },
      ]}
    >
      {iconUrl ? (
        <Image
          source={{ uri: iconUrl }}
          style={{ width: size * 0.75, height: size * 0.75 }}
          resizeMode="contain"
        />
      ) : (
        <Text
          style={[
            styles.fallbackText,
            { color: tierColor, fontSize: size * 0.4 },
          ]}
        >
          {element.name.charAt(0)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  fallbackText: {
    fontWeight: "bold",
  },
});
