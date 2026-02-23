import { useState, useEffect, useCallback } from "react";
import {
  initConnection,
  endConnection,
  fetchProducts,
  requestPurchase,
  getAvailablePurchases,
  purchaseUpdatedListener,
  purchaseErrorListener,
  finishTransaction,
  type Product,
  type Purchase,
} from "react-native-iap";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Create this product ID in App Store Connect (iOS) and Google Play Console (Android)
export const PREMIUM_PRODUCT_ID = "com.littlealchemy2.companion.premium_unlock";

const PURCHASE_STORAGE_KEY = "@premium_unlocked";

export function usePurchase() {
  const [isPremium, setIsPremium] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  const unlockPremium = useCallback(async () => {
    await AsyncStorage.setItem(PURCHASE_STORAGE_KEY, "true");
    setIsPremium(true);
  }, []);

  useEffect(() => {
    // Check persisted purchase state on mount
    AsyncStorage.getItem(PURCHASE_STORAGE_KEY).then((storedValue) => {
      if (storedValue === "true") setIsPremium(true);
    });

    let purchaseUpdateSub: ReturnType<typeof purchaseUpdatedListener>;
    let purchaseErrorSub: ReturnType<typeof purchaseErrorListener>;

    initConnection()
      .then(async () => {
        const products = await fetchProducts({
          skus: [PREMIUM_PRODUCT_ID],
          type: "in-app",
        });
        if (!!products?.length) setProduct(products[0] as Product);

        purchaseUpdateSub = purchaseUpdatedListener(
          async (purchase: Purchase) => {
            if (purchase.productId === PREMIUM_PRODUCT_ID) {
              await finishTransaction({ purchase, isConsumable: false });
              await unlockPremium();
              setIsPurchasing(false);
            }
          },
        );

        purchaseErrorSub = purchaseErrorListener((err: any) => {
          if ((err as any).code !== "E_USER_CANCELLED") {
            setError(err.message ?? "Purchase failed");
          }
          setIsPurchasing(false);
        });
      })
      .catch((err) => {
        console.error("IAP connection failed:", err);
      });

    return () => {
      purchaseUpdateSub?.remove();
      purchaseErrorSub?.remove();
      endConnection();
    };
  }, [unlockPremium]);

  const handlePurchase = useCallback(async () => {
    setError(null);
    setIsPurchasing(true);
    try {
      await requestPurchase({
        request: {
          apple: { sku: PREMIUM_PRODUCT_ID },
          android: { skus: [PREMIUM_PRODUCT_ID] },
        },
        type: "in-app",
      });
    } catch (err: any) {
      if (err?.code !== "E_USER_CANCELLED") {
        setError(err?.message ?? "Purchase failed");
      }
      setIsPurchasing(false);
    }
  }, []);

  const handleRestorePurchase = useCallback(async () => {
    setError(null);
    setIsPurchasing(true);
    try {
      const purchases = await getAvailablePurchases();
      const found = purchases?.some((p) => p.productId === PREMIUM_PRODUCT_ID);
      if (found) {
        await unlockPremium();
      } else {
        setError("No previous purchase found.");
      }
    } catch (err: any) {
      setError(err?.message ?? "Restore failed");
    } finally {
      setIsPurchasing(false);
    }
  }, [unlockPremium]);

  return { isPremium, isPurchasing, product, error, handlePurchase, handleRestorePurchase };
}
