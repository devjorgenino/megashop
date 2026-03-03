/**
 * Tarjeta de producto — estilo Orchid Store.
 * Server Component. El botón de carrito es un Client Component anidado.
 *
 * Accesibilidad: article element, aria-label on image link, focus-visible on quick view,
 * aria-hidden on decorative icons.
 */
import Link from "next/link";
import Image from "next/image";
import { Eye } from "lucide-react";
import { formatPrice, formatPriceVES, discountPercentage } from "@/lib/utils";
import { AddToCartButton } from "./add-to-cart-button";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const hasDiscount =
    product.compare_at_price !== null &&
    product.compare_at_price > product.price;

  const discount = hasDiscount
    ? discountPercentage(product.price, product.compare_at_price!)
    : 0;

  const imageUrl = product.images?.[0] ?? "/placeholder-product.svg";

  return (
    <article
      className="group relative flex flex-col rounded-xl bg-white shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
      aria-label={product.name}
    >
      {/* Imagen */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <Link
          href={`/products/${product.slug}`}
          className="absolute inset-0"
          aria-label={`Ver ${product.name}`}
          tabIndex={-1}
        >
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </Link>

        {/* Badge de oferta */}
        {hasDiscount && (
          <span className="absolute top-3 left-3 rounded-md bg-sale px-2.5 py-1 text-xs font-bold text-white shadow-sm pointer-events-none">
            -{discount}%
          </span>
        )}

        {/* Agotado */}
        {product.stock <= 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-none">
            <span className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow">
              Agotado
            </span>
          </div>
        )}

        {/* Acciones rápidas (hover + focus) */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 group-focus-within:opacity-100 group-focus-within:translate-x-0 transition-all duration-300">
          <Link
            href={`/products/${product.slug}`}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md hover:bg-primary hover:text-white focus-visible:bg-primary focus-visible:text-white transition-colors"
            aria-label={`Vista rápida de ${product.name}`}
          >
            <Eye className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-4">
        <Link
          href={`/products/${product.slug}`}
          className="text-sm font-medium text-gray-800 hover:text-primary transition-colors line-clamp-2 leading-snug"
        >
          {product.name}
        </Link>

        {/* Precio USD */}
        <div className="mt-2 flex items-center gap-2">
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">
              <span className="sr-only">Precio anterior: </span>
              {formatPrice(product.compare_at_price!)}
            </span>
          )}
          <span
            className={`text-lg font-bold ${hasDiscount ? "text-sale" : "text-gray-900"}`}
          >
            {formatPrice(product.price)}
          </span>
        </div>

        {/* Precio en Bolívares */}
        <p className="mt-0.5 text-xs text-gray-500">
          {formatPriceVES(product.price)}
        </p>

        {/* Indicador de stock */}
        {product.stock > 0 && product.stock <= 5 && (
          <p className="mt-1 text-xs text-orange-600 font-medium" role="status">
            Solo quedan {product.stock} en stock
          </p>
        )}

        {/* Botón agregar al carrito */}
        <div className="mt-auto pt-3">
          <AddToCartButton
            productId={product.id}
            stock={product.stock}
            size="sm"
            className="w-full"
          />
        </div>
      </div>
    </article>
  );
}
