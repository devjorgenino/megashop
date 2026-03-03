"use client";

/**
 * Fila de artículo del carrito.
 * Muestra imagen, nombre, precio, selector de cantidad y botón de eliminar.
 *
 * Accesibilidad: article element, aria-hidden en iconos, aria-live en cantidad,
 * role="group" en selector de cantidad.
 */
import Image from "next/image";
import Link from "next/link";
import { Trash2, Minus, Plus } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice, formatPriceVES } from "@/lib/utils";
import { MAX_CART_QUANTITY } from "@/lib/constants";
import type { Product } from "@/types";

interface CartItemRowProps {
  productId: string;
  quantity: number;
  product: Product | undefined;
}

export function CartItemRow({
  productId,
  quantity,
  product,
}: CartItemRowProps) {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  // Si no se pudo cargar el producto, mostrar un placeholder
  if (!product) {
    return (
      <article
        className="flex items-center gap-4 rounded-lg border border-gray-200 p-4"
        aria-label="Producto no disponible"
      >
        <div className="h-20 w-20 rounded-lg bg-gray-100" aria-hidden="true" />
        <div className="flex-1">
          <p className="text-sm text-gray-500">Producto no disponible</p>
          <p className="text-xs text-gray-400">ID: {productId}</p>
        </div>
        <button
          onClick={() => removeItem(productId)}
          className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
          aria-label="Eliminar artículo no disponible"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </article>
    );
  }

  const imageUrl = product.images?.[0] ?? "/placeholder-product.svg";
  const maxQty = Math.min(product.stock, MAX_CART_QUANTITY);
  const lineTotal = product.price * quantity;

  return (
    <article
      className="flex gap-4 rounded-lg border border-gray-200 p-4"
      aria-label={`${product.name}, cantidad ${quantity}`}
    >
      {/* Imagen */}
      <Link
        href={`/products/${product.slug}`}
        className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100"
        aria-label={`Ver ${product.name}`}
      >
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          sizes="96px"
          className="object-cover"
        />
      </Link>

      {/* Info */}
      <div className="flex flex-1 flex-col justify-between sm:flex-row sm:items-center">
        <div className="flex-1">
          <Link
            href={`/products/${product.slug}`}
            className="text-sm font-medium text-gray-900 hover:text-primary line-clamp-2 transition-colors"
          >
            {product.name}
          </Link>
          <p className="mt-1 text-sm font-semibold text-gray-900">
            {formatPrice(product.price)}
          </p>
          <p className="text-xs text-gray-500">
            {formatPriceVES(product.price)}
          </p>
          {product.stock <= 5 && product.stock > 0 && (
            <p className="mt-0.5 text-xs text-orange-600" role="status">
              Solo quedan {product.stock}
            </p>
          )}
          {product.stock <= 0 && (
            <p className="mt-0.5 text-xs text-red-600" role="alert">
              Agotado
            </p>
          )}
        </div>

        {/* Cantidad + Total de línea */}
        <div className="mt-3 flex items-center gap-4 sm:mt-0">
          {/* Selector de cantidad */}
          <div
            className="flex items-center rounded-lg border border-gray-300"
            role="group"
            aria-label={`Cantidad de ${product.name}`}
          >
            <button
              onClick={() => updateQuantity(productId, quantity - 1)}
              disabled={quantity <= 1}
              className="flex h-8 w-8 items-center justify-center text-gray-600 hover:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed rounded-l-lg transition-colors"
              aria-label="Disminuir cantidad"
            >
              <Minus className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <span
              className="flex h-8 w-10 items-center justify-center border-x border-gray-300 text-sm font-medium"
              aria-live="polite"
              aria-atomic="true"
            >
              {quantity}
            </span>
            <button
              onClick={() => updateQuantity(productId, quantity + 1)}
              disabled={quantity >= maxQty}
              className="flex h-8 w-8 items-center justify-center text-gray-600 hover:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed rounded-r-lg transition-colors"
              aria-label="Aumentar cantidad"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>

          {/* Total de línea */}
          <div className="w-24 text-right">
            <span className="text-sm font-semibold text-gray-900 block">
              {formatPrice(lineTotal)}
            </span>
            <span className="text-xs text-gray-500 block">
              {formatPriceVES(lineTotal)}
            </span>
          </div>

          {/* Eliminar */}
          <button
            onClick={() => removeItem(productId)}
            className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
            aria-label={`Eliminar ${product.name} del carrito`}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}
