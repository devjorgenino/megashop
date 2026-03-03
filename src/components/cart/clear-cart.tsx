"use client";

/**
 * Invisible component that clears the Zustand cart on mount.
 * Used on the checkout success page after Stripe payment.
 */
import { useEffect } from "react";
import { useCartStore } from "@/stores/cart-store";

export function ClearCart() {
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return null;
}
