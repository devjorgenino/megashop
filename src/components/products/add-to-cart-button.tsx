"use client";

/**
 * Botón para agregar un producto al carrito.
 * Client Component porque usa el store de Zustand.
 *
 * Accesibilidad: aria-live para feedback, aria-hidden en iconos,
 * aria-label descriptivo.
 */
import { ShoppingCart, Check } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/stores/cart-store";
import { MAX_CART_QUANTITY } from "@/lib/constants";
import { Button, type ButtonProps } from "@/components/ui/button";

interface AddToCartButtonProps extends Omit<ButtonProps, "onClick"> {
  productId: string;
  stock: number;
}

export function AddToCartButton({
  productId,
  stock,
  ...buttonProps
}: AddToCartButtonProps) {
  const [justAdded, setJustAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const items = useCartStore((state) => state.items);

  const currentInCart =
    items.find((item) => item.product_id === productId)?.quantity ?? 0;
  const isOutOfStock = stock <= 0;
  const isMaxReached = currentInCart >= MAX_CART_QUANTITY;

  function handleAddToCart() {
    if (isOutOfStock || isMaxReached) return;

    addItem(productId);
    setJustAdded(true);

    // Announce to screen readers
    const announcer = document.getElementById("announcer");
    if (announcer) {
      announcer.textContent = "Producto agregado al carrito";
    }

    setTimeout(() => setJustAdded(false), 1500);
  }

  if (isOutOfStock) {
    return (
      <Button
        variant="secondary"
        disabled
        aria-label="Producto agotado, no disponible"
        {...buttonProps}
      >
        Agotado
      </Button>
    );
  }

  return (
    <Button
      onClick={handleAddToCart}
      variant={justAdded ? "secondary" : "primary"}
      disabled={isMaxReached}
      aria-label={
        justAdded
          ? "Producto agregado al carrito"
          : isMaxReached
            ? "Cantidad máxima alcanzada"
            : "Agregar al carrito"
      }
      {...buttonProps}
    >
      {justAdded ? (
        <>
          <Check className="mr-1 h-4 w-4" aria-hidden="true" />
          <span aria-live="polite">Agregado</span>
        </>
      ) : (
        <>
          <ShoppingCart className="mr-1 h-4 w-4" aria-hidden="true" />
          {isMaxReached ? "Máximo en carrito" : "Agregar al Carrito"}
        </>
      )}
    </Button>
  );
}
