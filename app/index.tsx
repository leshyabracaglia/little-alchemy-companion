import { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../constants/colors";
import { ELEMENTS, Element } from "../constants/elements";
import { ElementCard } from "../components/ElementCard";
import { ElementDetailModal } from "../components/ElementDetailModal";
import { PaywallModal } from "../components/PaywallModal";
import { usePurchase } from "../hooks/usePurchase";

export default function BrowseScreen() {
  const {
    isPremium,
    isPurchasing,
    product,
    error,
    handlePurchase,
    handleRestorePurchase,
  } = usePurchase();

  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [paywallVisible, setPaywallVisible] = useState(false);

  const handleElementPress = (element: Element) => {
    if (!isPremium && element.tier >= 4) {
      setPaywallVisible(true);
      return;
    }
    setSelectedElement(element);
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredElements = useMemo(() => {
    if (!searchQuery.trim()) return ELEMENTS;
    const query = searchQuery.toLowerCase();
    return ELEMENTS.filter((element) =>
      element.name.toLowerCase().includes(query),
    );
  }, [searchQuery]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingScreen}>
          <Text style={styles.loadingTitle}>Little Alchemy 2</Text>
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={styles.spinner}
          />
          <Text style={styles.loadingSubtitle}>Loading elements...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
          {filteredElements.length} result
          {filteredElements.length !== 1 ? "s" : ""}
        </Text>
      )}

      <FlatList
        data={filteredElements}
        keyExtractor={(element) => element.id}
        renderItem={({ item: element }) => (
          <ElementCard
            element={element}
            onPress={() => handleElementPress(element)}
            isLocked={!isPremium && element.tier >= 4}
          />
        )}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
      />

      <ElementDetailModal
        element={selectedElement}
        onClose={() => setSelectedElement(null)}
        onSelectElement={setSelectedElement}
      />

      <PaywallModal
        visible={paywallVisible}
        onClose={() => setPaywallVisible(false)}
        onPurchase={handlePurchase}
        onRestore={handleRestorePurchase}
        isPurchasing={isPurchasing}
        product={product}
        error={error}
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
  loadingScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 32,
  },
  spinner: {
    marginBottom: 16,
  },
  loadingSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
