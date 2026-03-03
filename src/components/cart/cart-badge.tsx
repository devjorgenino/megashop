"use client";

/**
 * Cart badge with hydration mismatch protection.
 * Zustand persist reads from localStorage AFTER mount,
 * so on SSR the count is 0. This component waits for mount
 * before rendering the real count.
 *
 * Accesibilidad: sr-only text para screen readers.
 */
import { useEffect, useState } from "react";
import { useCartStore } from "@/stores/cart-store";

export function CartBadge() {
  const [mounted, setMounted] = useState(false);
  const totalItems = useCartStore((state) => state.getTotalItems());

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render the badge until the store is hydrated
  if (!mounted || totalItems === 0) return null;

  const displayCount = totalItems > 9 ? "9+" : totalItems;

  return (
    <span
      className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-gray-900"
      aria-label={`${totalItems} artículo${totalItems !== 1 ? "s" : ""} en el carrito`}
    >
      {displayCount}
    </span>
  );
}
