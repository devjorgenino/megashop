"use client";

/**
 * Contenido del carrito (Client Component).
 * Carga datos de productos para hidratar el carrito.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { createClient } from "@/lib/supabase/client";
import { ROUTES } from "@/lib/constants";
import { CartItemRow } from "@/components/cart/cart-item-row";
import { CartSummary } from "@/components/cart/cart-summary";
import type { Product } from "@/types";

export function CartContent() {
  const items = useCartStore((state) => state.items);
  const [products, setProducts] = useState<Map<string, Product>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  // Cargar datos de productos del carrito
  useEffect(() => {
    async function loadProducts() {
      if (items.length === 0) {
        setProducts(new Map());
        setIsLoading(false);
        return;
      }

      const supabase = createClient();
      const productIds = items.map((item) => item.product_id);

      const { data } = await supabase
        .from("products")
        .select("*")
        .in("id", productIds);

      const productMap = new Map<string, Product>();
      if (data) {
        for (const product of data as unknown as Product[]) {
          productMap.set(product.id, product);
        }
      }

      setProducts(productMap);
      setIsLoading(false);
    }

    loadProducts();
  }, [items]);

  // Estado de carga
  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900">Carrito de Compras</h1>
        <div className="mt-8 space-y-4" aria-label="Cargando carrito" role="status">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-lg border border-gray-200 bg-gray-50"
            />
          ))}
        </div>
      </div>
    );
  }

  // Carrito vacío
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900">Carrito de Compras</h1>
        <div className="mt-12 text-center">
          <ShoppingCart className="mx-auto h-16 w-16 text-gray-300" aria-hidden="true" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900">
            Tu carrito está vacío
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Parece que aún no has agregado ningún producto.
          </p>
          <Link
            href={ROUTES.products}
            className="mt-6 inline-block rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Explorar Productos
          </Link>
        </div>
      </div>
    );
  }

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900">
        Carrito de Compras ({totalItems}{" "}
        {totalItems === 1 ? "artículo" : "artículos"})
      </h1>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Lista de artículos */}
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <CartItemRow
              key={item.product_id}
              productId={item.product_id}
              quantity={item.quantity}
              product={products.get(item.product_id)}
            />
          ))}
        </div>

        {/* Resumen */}
        <div className="lg:col-span-1">
          <CartSummary items={items} products={products} />
        </div>
      </div>
    </div>
  );
}
