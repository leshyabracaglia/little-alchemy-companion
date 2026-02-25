import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { colors } from "../constants/colors";
import type { Product } from "react-native-iap";

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  onPurchase: () => void;
  onRestore: () => void;
  isPurchasing: boolean;
  product: Product | null;
  error: string | null;
}

export function PaywallModal({
  visible,
  onClose,
  onPurchase,
  onRestore,
  isPurchasing,
  product,
  error,
}: PaywallModalProps) {
  const price = product?.displayPrice ?? "$0.99";

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.lockIcon}>🔐</Text>

          <Text style={styles.title}>Unlock Premium</Text>
          <Text style={styles.subtitle}>
            Discover all advanced elements
          </Text>

          <View style={styles.featuresCard}>
            <FeatureRow text="All tier 4+ elements" />
            <FeatureRow text="Full recipes & combinations" />
            <FeatureRow text="One-time purchase, no subscription" />
          </View>

          {error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity
            style={[
              styles.purchaseButton,
              isPurchasing && styles.purchaseButtonDisabled,
            ]}
            onPress={onPurchase}
            disabled={isPurchasing}
          >
            {isPurchasing ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={styles.purchaseButtonText}>
                Unlock for {price}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.restoreButton}
            onPress={onRestore}
            disabled={isPurchasing}
          >
            <Text style={styles.restoreText}>Restore previous purchase</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function FeatureRow({ text }: { text: string }) {
  return (
    <View style={styles.featureRow}>
      <Text style={styles.featureBullet}>✦</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  closeButton: {
    alignSelf: "flex-end",
    padding: 20,
    paddingBottom: 0,
  },
  closeText: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingBottom: 48,
  },
  lockIcon: {
    fontSize: 56,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 32,
  },
  featuresCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    width: "100%",
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 32,
    gap: 12,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  featureBullet: {
    color: colors.primary,
    fontSize: 12,
  },
  featureText: {
    color: colors.text,
    fontSize: 15,
  },
  error: {
    color: "#f87171",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  purchaseButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
  },
  purchaseButtonDisabled: {
    opacity: 0.6,
  },
  purchaseButtonText: {
    color: colors.background,
    fontSize: 17,
    fontWeight: "700",
  },
  restoreButton: {
    paddingVertical: 8,
  },
  restoreText: {
    color: colors.textSecondary,
    fontSize: 14,
    textDecorationLine: "underline",
  },
});
