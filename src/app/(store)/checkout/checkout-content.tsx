"use client";

/**
 * Contenido de la página de checkout.
 * Requiere login (el middleware ya lo verifica).
 * Muestra un resumen final del pedido y selector de método de pago.
 *
 * Flujos de pago:
 * - Tarjeta (Stripe): Redirige a Stripe Checkout.
 * - Pago Móvil / Zelle / Binance Pay / Transferencia: Muestra datos de la cuenta,
 *   pide número de referencia, y crea un pedido "pending" vía /api/checkout/manual.
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Lock,
  CreditCard,
  Smartphone,
  DollarSign,
  Bitcoin,
  Building2,
  Copy,
  Check,
} from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/stores/cart-store";
import { useUser } from "@/hooks/use-user";
import { createClient } from "@/lib/supabase/client";
import { ROUTES, PAYMENT_METHODS } from "@/lib/constants";
import type { PaymentMethodKey } from "@/lib/constants";
import { formatPrice, formatPriceVES } from "@/lib/utils";
import { CartSummary } from "@/components/cart/cart-summary";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types";

// Constantes (mismas que CartSummary)
const FREE_SHIPPING_THRESHOLD = 5000;
const SHIPPING_COST = 599;

// Tipo para todos los métodos de pago posibles (Stripe + manuales)
type PaymentType = "stripe" | PaymentMethodKey;

// Iconos para cada método de pago
const PAYMENT_ICONS: Record<PaymentType, typeof CreditCard> = {
  stripe: CreditCard,
  pago_movil: Smartphone,
  zelle: DollarSign,
  binance: Bitcoin,
  transferencia: Building2,
};

export function CheckoutContent() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const { user, isLoading: isUserLoading } = useUser();
  const [products, setProducts] = useState<Map<string, Product>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado del método de pago
  const [selectedMethod, setSelectedMethod] = useState<PaymentType>("stripe");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Cargar productos
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

  // Redirigir al carrito si está vacío
  useEffect(() => {
    if (!isLoading && items.length === 0) {
      router.push(ROUTES.cart);
    }
  }, [isLoading, items.length, router]);

  // Copiar texto al portapapeles
  async function handleCopy(text: string, fieldLabel: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldLabel);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // Si falla, ignorar silenciosamente
    }
  }

  /**
   * Iniciar el proceso de pago con Stripe.
   */
  async function handleStripeCheckout() {
    if (!user) {
      router.push(`${ROUTES.login}?redirectTo=${ROUTES.checkout}`);
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const lineItems = items
        .map((item) => {
          const product = products.get(item.product_id);
          if (!product) return null;
          return {
            product_id: item.product_id,
            quantity: item.quantity,
          };
        })
        .filter(Boolean);

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: lineItems }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al crear la sesión de pago");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ocurrió un error inesperado"
      );
      setIsProcessing(false);
    }
  }

  /**
   * Iniciar el proceso de pago manual (Venezuela).
   */
  async function handleManualCheckout() {
    if (!user) {
      router.push(`${ROUTES.login}?redirectTo=${ROUTES.checkout}`);
      return;
    }

    if (!referenceNumber.trim()) {
      setError("Debes ingresar el número de referencia del pago");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const lineItems = items
        .map((item) => {
          const product = products.get(item.product_id);
          if (!product) return null;
          return {
            product_id: item.product_id,
            quantity: item.quantity,
          };
        })
        .filter(Boolean);

      const response = await fetch("/api/checkout/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lineItems,
          paymentMethod: selectedMethod,
          referenceNumber: referenceNumber.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al procesar el pago");
      }

      // Redirigir a la página de éxito con el order_id
      router.push(
        `${ROUTES.checkout}/success?order_id=${data.orderId}`
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ocurrió un error inesperado"
      );
      setIsProcessing(false);
    }
  }

  // Manejar el clic en el botón de pago
  function handlePayment() {
    if (selectedMethod === "stripe") {
      handleStripeCheckout();
    } else {
      handleManualCheckout();
    }
  }

  // Obtener la config del método manual seleccionado
  const selectedManualMethod =
    selectedMethod !== "stripe"
      ? PAYMENT_METHODS.find((m) => m.key === selectedMethod)
      : null;

  // Estado de carga
  if (isLoading || isUserLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="mt-8 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-lg bg-gray-100"
            />
          ))}
        </div>
      </div>
    );
  }

  // Carrito vacío — la redirección ocurre en useEffect
  if (items.length === 0) {
    return null;
  }

  // Calcular totales
  const subtotal = items.reduce((sum, item) => {
    const product = products.get(item.product_id);
    if (!product) return sum;
    return sum + product.price * item.quantity;
  }, 0);

  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shipping = isFreeShipping ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Encabezado */}
      <div className="flex items-center gap-3">
        <Link
          href={ROUTES.cart}
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          aria-label="Volver al carrito"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Pagar</h1>
      </div>

      {/* Error */}
      {error && (
        <div role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-5">
        {/* Columna izquierda: Artículos + Método de pago */}
        <div className="lg:col-span-3 space-y-6">
          {/* Artículos del pedido */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Artículos del Pedido
            </h2>
            <div className="mt-4 space-y-3">
              {items.map((item) => {
                const product = products.get(item.product_id);
                if (!product) return null;
                return (
                  <div
                    key={item.product_id}
                    className="flex items-center gap-3 rounded-lg border border-gray-200 p-3"
                  >
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      {product.images?.[0] && (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Cant: {item.quantity} x {formatPrice(product.price)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatPriceVES(product.price * item.quantity)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatPrice(product.price * item.quantity)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Info del usuario */}
          {user && (
            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900">Cuenta</h3>
              <p className="mt-1 text-sm text-gray-600">{user.email}</p>
            </div>
          )}

          {/* Selector de método de pago */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Método de Pago
            </h2>
            <div className="mt-4 space-y-3" role="radiogroup" aria-label="Método de pago">
              {/* Opción: Tarjeta (Stripe) */}
              <button
                type="button"
                role="radio"
                aria-checked={selectedMethod === "stripe"}
                onClick={() => {
                  setSelectedMethod("stripe");
                  setError(null);
                }}
                className={`w-full flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-colors ${
                  selectedMethod === "stripe"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    selectedMethod === "stripe"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <CreditCard className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">
                    Tarjeta de Crédito/Débito
                  </p>
                  <p className="text-xs text-gray-500">
                    Pago seguro procesado por Stripe (Visa, Mastercard, etc.)
                  </p>
                </div>
                <div
                  className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                    selectedMethod === "stripe"
                      ? "border-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  {selectedMethod === "stripe" && (
                    <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                  )}
                </div>
              </button>

              {/* Opciones manuales (Venezuela) */}
              {PAYMENT_METHODS.map((method) => {
                const Icon = PAYMENT_ICONS[method.key] || Building2;
                const isSelected = selectedMethod === method.key;
                return (
                  <button
                    key={method.key}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => {
                      setSelectedMethod(method.key);
                      setError(null);
                    }}
                    className={`w-full flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-colors ${
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        isSelected
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {method.label}
                      </p>
                      <p className="text-xs text-gray-500">
                        {method.description}
                      </p>
                    </div>
                    <div
                      className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? "border-blue-500" : "border-gray-300"
                      }`}
                    >
                      {isSelected && (
                        <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detalles del método manual seleccionado */}
          {selectedManualMethod && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-5">
              <h3 className="text-sm font-semibold text-blue-900">
                Datos para {selectedManualMethod.label}
              </h3>
              <p className="mt-1 text-xs text-blue-700">
                Realiza el pago a los siguientes datos y luego ingresa el número
                de referencia abajo.
              </p>

              {/* Datos de la cuenta */}
              <div className="mt-4 space-y-2">
                {selectedManualMethod.details.map((detail) => (
                  <div
                    key={detail.label}
                    className="flex items-center justify-between rounded-lg bg-white px-3 py-2"
                  >
                    <div>
                      <p className="text-xs text-gray-500">{detail.label}</p>
                      <p className="text-sm font-medium text-gray-900">
                        {detail.value}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(detail.value, detail.label)}
                      className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      title="Copiar"
                      aria-label="Copiar"
                    >
                      {copiedField === detail.label ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>

              {/* Monto a pagar */}
              <div className="mt-4 rounded-lg bg-white px-3 py-2">
                <p className="text-xs text-gray-500">Monto a pagar</p>
                <p className="text-sm font-bold text-gray-900">
                  {formatPrice(total)}{" "}
                  <span className="font-normal text-gray-500">
                    / {formatPriceVES(total)}
                  </span>
                </p>
              </div>

              {/* Campo de referencia */}
              <div className="mt-4">
                <label
                  htmlFor="referenceNumber"
                  className="block text-sm font-medium text-blue-900"
                >
                  Número de Referencia
                </label>
                <input
                  id="referenceNumber"
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder={selectedManualMethod.referencePlaceholder}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-blue-700">
                  Ingresa el comprobante o número de referencia de tu pago para
                  que podamos verificarlo.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Columna derecha: Resumen + Botón de pago */}
        <div className="lg:col-span-2">
          <CartSummary
            items={items}
            products={products}
            showCheckoutButton={false}
            showContinueShopping={false}
          />

          <div className="mt-4">
            <Button
              size="lg"
              className="w-full"
              onClick={handlePayment}
              isLoading={isProcessing}
              disabled={
                isProcessing ||
                (selectedMethod !== "stripe" && !referenceNumber.trim())
              }
            >
              {selectedMethod === "stripe" ? (
                <>
                    <Lock className="mr-2 h-4 w-4" aria-hidden="true" />
                  Pagar {formatPrice(total)}
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Confirmar Pago {formatPrice(total)}
                </>
              )}
            </Button>
            <p className="mt-2 text-center text-xs text-gray-400">
              {selectedMethod === "stripe" ? (
                <>
                  <Lock className="mr-1 inline h-3 w-3" aria-hidden="true" />
                  Pago seguro procesado por Stripe
                </>
              ) : (
                <>
                  Tu pedido quedará pendiente hasta que verifiquemos el pago
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
