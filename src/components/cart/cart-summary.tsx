"use client";

/**
 * Resumen del carrito: subtotal, envío, total.
 * Se usa tanto en /cart como en /checkout.
 *
 * Accesibilidad: aside landmark, progressbar role, aria-live en totales.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPrice, formatPriceVES } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types";
import type { CartItem } from "@/types";

interface CartSummaryProps {
  items: CartItem[];
  products: Map<string, Product>;
  /** Mostrar el botón de checkout (true en /cart, false en /checkout) */
  showCheckoutButton?: boolean;
  /** Mostrar el enlace "seguir comprando" */
  showContinueShopping?: boolean;
}

// Umbral de envío gratis (en centavos)
const FREE_SHIPPING_THRESHOLD = 5000; // $50.00
const SHIPPING_COST = 599; // $5.99

export function CartSummary({
  items,
  products,
  showCheckoutButton = true,
  showContinueShopping = true,
}: CartSummaryProps) {
  const router = useRouter();

  // Calcular subtotal
  const subtotal = items.reduce((sum, item) => {
    const product = products.get(item.product_id);
    if (!product) return sum;
    return sum + product.price * item.quantity;
  }, 0);

  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shipping = isFreeShipping ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const shippingProgress = Math.min(
    100,
    (subtotal / FREE_SHIPPING_THRESHOLD) * 100
  );

  return (
    <aside
      className="rounded-lg border border-gray-200 bg-gray-50 p-6"
      aria-label="Resumen del pedido"
    >
      <h2 className="text-lg font-semibold text-gray-900">
        Resumen del Pedido
      </h2>

      <dl className="mt-4 space-y-3">
        {/* Subtotal */}
        <div className="flex justify-between text-sm">
          <dt className="text-gray-600">
            Subtotal ({itemCount} {itemCount !== 1 ? "artículos" : "artículo"})
          </dt>
          <dd className="text-right">
            <span className="font-medium text-gray-900 block">
              {formatPrice(subtotal)}
            </span>
            <span className="text-xs text-gray-500 block">
              {formatPriceVES(subtotal)}
            </span>
          </dd>
        </div>

        {/* Envío */}
        <div className="flex justify-between text-sm">
          <dt className="text-gray-600">Envío</dt>
          <dd className="font-medium text-gray-900">
            {isFreeShipping ? (
              <span className="text-green-600">Gratis</span>
            ) : (
              formatPrice(shipping)
            )}
          </dd>
        </div>

        {/* Progreso envío gratis */}
        {!isFreeShipping && (
          <div className="rounded-lg bg-blue-50 p-3">
            <p className="text-xs text-blue-700">
              Agrega{" "}
              <span className="font-semibold">
                {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)}
              </span>{" "}
              más para obtener envío gratis
            </p>
            <div
              className="mt-1.5 h-1.5 w-full rounded-full bg-blue-200"
              role="progressbar"
              aria-valuenow={Math.round(shippingProgress)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Progreso hacia envío gratis: ${Math.round(shippingProgress)}%`}
            >
              <div
                className="h-1.5 rounded-full bg-blue-600 transition-all"
                style={{ width: `${shippingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Separador */}
        <div className="border-t border-gray-200 pt-3">
          <div className="flex justify-between">
            <dt className="text-base font-semibold text-gray-900">Total</dt>
            <dd className="text-right" aria-live="polite">
              <span className="text-base font-semibold text-gray-900 block">
                {formatPrice(total)}
              </span>
              <span className="text-xs text-gray-500 block">
                {formatPriceVES(total)}
              </span>
            </dd>
          </div>
        </div>
      </dl>

      {/* Acciones */}
      <div className="mt-6 space-y-3">
        {showCheckoutButton && (
          <Button
            size="lg"
            className="w-full"
            onClick={() => router.push(ROUTES.checkout)}
          >
            Proceder al Pago
          </Button>
        )}

        {showContinueShopping && (
          <Link
            href={ROUTES.products}
            className="block text-center text-sm text-primary hover:text-primary-dark transition-colors"
          >
            Seguir Comprando
          </Link>
        )}
      </div>
    </aside>
  );
}
