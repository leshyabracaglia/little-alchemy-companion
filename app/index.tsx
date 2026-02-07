import { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TextInput,
} from "react-native";
import { colors } from "../constants/colors";
import { ELEMENTS, Element } from "../constants/elements";
import { ElementCard } from "../components/ElementCard";
import { ElementDetailModal } from "../components/ElementDetailModal";

export default function BrowseScreen() {
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredElements = useMemo(() => {
    if (!searchQuery.trim()) return ELEMENTS;
    const query = searchQuery.toLowerCase();
    return ELEMENTS.filter((el) => el.name.toLowerCase().includes(query));
  }, [searchQuery]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Little Alchemy 2</Text>
        <Text style={styles.subtitle}>{ELEMENTS.length} elements</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search elements..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {searchQuery.length > 0 && (
        <Text style={styles.resultCount}>
          {filteredElements.length} result{filteredElements.length !== 1 ? "s" : ""}
        </Text>
      )}

      <FlatList
        data={filteredElements}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ElementCard element={item} onPress={() => setSelectedElement(item)} />
        )}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
      />

      <ElementDetailModal
        element={selectedElement}
        onClose={() => setSelectedElement(null)}
        onSelectElement={setSelectedElement}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchInput: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultCount: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    fontSize: 13,
    color: colors.textSecondary,
  },
  listContent: {
    paddingBottom: 20,
  },
});
