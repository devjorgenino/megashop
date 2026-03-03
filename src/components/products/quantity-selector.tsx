"use client";

/**
 * Selector de cantidad para la página de detalle del producto.
 *
 * Accesibilidad: role="group" con aria-label, aria-live en cantidad,
 * aria-hidden en iconos, role="alert" en warning.
 */
import { Minus, Plus } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { MAX_CART_QUANTITY } from "@/lib/constants";

interface QuantitySelectorProps {
  productId: string;
  stock: number;
}

export function QuantitySelector({ productId, stock }: QuantitySelectorProps) {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const addItem = useCartStore((state) => state.addItem);

  const currentItem = items.find((item) => item.product_id === productId);
  const quantity = currentItem?.quantity ?? 1;
  const maxQty = Math.min(stock, MAX_CART_QUANTITY);

  if (stock <= 0) return null;

  if (!currentItem) {
    return null;
  }

  return (
    <div
      className="flex items-center gap-3"
      role="group"
      aria-label="Selector de cantidad"
    >
      <span className="text-sm font-medium text-gray-700">Cantidad:</span>
      <div className="flex items-center rounded-lg border border-gray-300">
        <button
          onClick={() => updateQuantity(productId, quantity - 1)}
          disabled={quantity <= 1}
          className="flex h-9 w-9 items-center justify-center text-gray-600 hover:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed rounded-l-lg transition-colors"
          aria-label="Disminuir cantidad"
        >
          <Minus className="h-4 w-4" aria-hidden="true" />
        </button>
        <span
          className="flex h-9 w-10 items-center justify-center border-x border-gray-300 text-sm font-medium"
          aria-live="polite"
          aria-atomic="true"
        >
          {quantity}
        </span>
        <button
          onClick={() => addItem(productId, 1)}
          disabled={quantity >= maxQty}
          className="flex h-9 w-9 items-center justify-center text-gray-600 hover:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed rounded-r-lg transition-colors"
          aria-label="Aumentar cantidad"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      {quantity >= maxQty && (
        <span className="text-xs text-orange-600" role="alert">
          Cantidad máxima
        </span>
      )}
    </div>
  );
}
