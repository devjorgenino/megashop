/**
 * Página de confirmación de pedido.
 * El usuario llega aquí después de:
 * - Pagar con Stripe (session_id en query params), o
 * - Confirmar un pago manual (order_id en query params).
 *
 * Para Stripe:
 * 1. Verifica que la sesión de Stripe esté pagada.
 * 2. Si el pedido sigue "pending", lo actualiza a "paid" y decrementa el stock.
 * 3. Muestra los detalles del pedido.
 *
 * Para pagos manuales:
 * 1. Busca el pedido por ID y verifica que pertenece al usuario.
 * 2. Muestra los detalles del pedido con estado "Pendiente de verificación".
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/server";
import { createClient as createAdminSupabase } from "@supabase/supabase-js";
import { ROUTES, PAYMENT_METHODS } from "@/lib/constants";
import { formatPrice, formatPriceVES } from "@/lib/utils";
import { ClearCart } from "@/components/cart/clear-cart";
import type { Metadata } from "next";
import type { OrderWithItems } from "@/types";

export const metadata: Metadata = {
  title: "Pedido Confirmado",
};

interface Props {
  searchParams: Promise<{ session_id?: string; order_id?: string }>;
}

function getAdminClient() {
  return createAdminSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * Determina si un pedido fue manual a partir de stripe_session_id.
 * Los pagos manuales tienen formato "manual_<método>_<timestamp>".
 */
function parseManualPayment(stripeSessionId: string | null) {
  if (!stripeSessionId || !stripeSessionId.startsWith("manual_")) {
    return null;
  }
  // "manual_pago_movil_1234567890" → extraer método
  const parts = stripeSessionId.replace("manual_", "").split("_");
  // El timestamp es el último elemento; el método es todo lo anterior
  const timestamp = parts.pop();
  const methodKey = parts.join("_");
  const method = PAYMENT_METHODS.find((m) => m.key === methodKey);
  return {
    methodKey,
    methodLabel: method?.label ?? methodKey,
    timestamp,
  };
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { session_id, order_id } = await searchParams;

  // Necesitamos al menos un identificador
  if (!session_id && !order_id) {
    redirect(ROUTES.home);
  }

  const supabase = await createClient();

  // Verificar que el usuario esté autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(ROUTES.login);
  }

  let isManualPayment = false;
  let manualPaymentInfo: ReturnType<typeof parseManualPayment> = null;

  // ── Flujo Stripe ──────────────────────────────────────────────────────────
  if (session_id) {
    let stripeSession: Awaited<
      ReturnType<typeof stripe.checkout.sessions.retrieve>
    > | null = null;
    try {
      stripeSession = await stripe.checkout.sessions.retrieve(session_id);
    } catch (err) {
      console.error("Error al recuperar la sesión de Stripe:", err);
    }

    const isPaid = stripeSession?.payment_status === "paid";

    if (isPaid) {
      const adminSupabase = getAdminClient();

      const { data: existingOrder } = await adminSupabase
        .from("orders")
        .select("id, status")
        .eq("stripe_session_id", session_id)
        .eq("user_id", user.id)
        .single();

      if (existingOrder && existingOrder.status === "pending") {
        await adminSupabase
          .from("orders")
          .update({
            status: "paid",
            stripe_payment_intent_id:
              typeof stripeSession?.payment_intent === "string"
                ? stripeSession.payment_intent
                : (stripeSession?.payment_intent as any)?.id ?? null,
          })
          .eq("id", existingOrder.id);

        // Decrementar stock
        const { data: orderItems } = await adminSupabase
          .from("order_items")
          .select("product_id, quantity")
          .eq("order_id", existingOrder.id);

        if (orderItems && orderItems.length > 0) {
          for (const item of orderItems) {
            const { data: product } = await adminSupabase
              .from("products")
              .select("stock")
              .eq("id", item.product_id)
              .single();

            if (product) {
              const newStock = Math.max(0, product.stock - item.quantity);
              await adminSupabase
                .from("products")
                .update({ stock: newStock })
                .eq("id", item.product_id);
            }
          }
        }
      }
    }
  }

  // ── Obtener el pedido para mostrarlo ──────────────────────────────────────
  let orderQuery;

  if (session_id) {
    // Stripe: buscar por stripe_session_id
    orderQuery = (supabase as any)
      .from("orders")
      .select(
        `
        *,
        order_items (
          *,
          products (*)
        )
      `
      )
      .eq("stripe_session_id", session_id)
      .eq("user_id", user.id)
      .single();
  } else {
    // Manual: buscar por order_id
    orderQuery = (supabase as any)
      .from("orders")
      .select(
        `
        *,
        order_items (
          *,
          products (*)
        )
      `
      )
      .eq("id", order_id)
      .eq("user_id", user.id)
      .single();
  }

  const { data: order } = await orderQuery;
  const typedOrder = order as OrderWithItems | null;

  // Detectar si es pago manual
  if (typedOrder) {
    manualPaymentInfo = parseManualPayment(
      typedOrder.stripe_session_id ?? null
    );
    isManualPayment = manualPaymentInfo !== null;
  }

  // Mapa de estados traducidos
  const statusLabels: Record<string, string> = {
    pending: "Pendiente",
    paid: "Pagado",
    shipped: "Enviado",
    delivered: "Entregado",
    cancelled: "Cancelado",
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Limpiar el carrito del cliente (Zustand) */}
      <ClearCart />

      <div className="text-center">
        {isManualPayment ? (
          <>
            <Clock className="mx-auto h-16 w-16 text-amber-500" aria-hidden="true" />
            <h1 className="mt-4 text-2xl font-bold text-gray-900">
              ¡Pedido Recibido!
            </h1>
            <p className="mt-2 text-gray-500">
              Tu pedido fue registrado exitosamente. Nuestro equipo verificará
              tu pago por{" "}
              <span className="font-medium text-gray-700">
                {manualPaymentInfo?.methodLabel}
              </span>{" "}
              y actualizará el estado de tu pedido.
            </p>
            {typedOrder?.stripe_payment_intent_id && (
              <p className="mt-2 text-sm text-gray-400">
                Referencia:{" "}
                <span className="font-mono font-medium text-gray-600">
                  {typedOrder.stripe_payment_intent_id}
                </span>
              </p>
            )}
          </>
        ) : (
          <>
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" aria-hidden="true" />
            <h1 className="mt-4 text-2xl font-bold text-gray-900">
              ¡Gracias por tu pedido!
            </h1>
            <p className="mt-2 text-gray-500">
              Tu pago fue exitoso. Te enviaremos un correo de confirmación con
              los detalles de tu pedido en breve.
            </p>
          </>
        )}
      </div>

      {/* Detalles del pedido */}
      {typedOrder ? (
        <div className="mt-10">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <p className="text-sm text-gray-500">Número de pedido</p>
                <p className="font-mono text-sm font-medium text-gray-900">
                  #{typedOrder.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Estado</p>
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    isManualPayment && typedOrder.status === "pending"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {isManualPayment && typedOrder.status === "pending"
                    ? "Pendiente de Verificación"
                    : (statusLabels[typedOrder.status] ?? typedOrder.status)}
                </span>
              </div>
            </div>

            {/* Método de pago (solo para manuales) */}
            {isManualPayment && (
              <div className="border-b border-gray-100 py-3">
                <p className="text-xs text-gray-500">Método de pago</p>
                <p className="text-sm font-medium text-gray-900">
                  {manualPaymentInfo?.methodLabel}
                </p>
              </div>
            )}

            {/* Artículos del pedido */}
            <div className="mt-4 space-y-3">
              {typedOrder.order_items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {item.products?.images?.[0] && (
                      <img
                        src={item.products.images[0]}
                        alt={item.products.name}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.products?.name || "Producto"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Cant: {item.quantity} &times; {formatPrice(item.unit_price)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatPrice(item.unit_price * item.quantity)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatPriceVES(item.unit_price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
              <p className="text-sm font-semibold text-gray-900">Total</p>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">
                  {formatPrice(typedOrder.total)}
                </p>
                <p className="text-xs text-gray-500">
                  {formatPriceVES(typedOrder.total)}
                </p>
              </div>
            </div>
          </div>

          {/* Aviso para pagos manuales */}
          {isManualPayment && typedOrder.status === "pending" && (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm text-amber-800">
                <strong>Nota:</strong> Tu pedido será procesado una vez que
                nuestro equipo verifique el pago. Este proceso generalmente toma
                entre 15 minutos y 2 horas en horario laboral. Puedes consultar
                el estado de tu pedido en la sección &quot;Mis Pedidos&quot;.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-10 rounded-lg border border-dashed border-gray-300 p-8 text-center">
          <p className="text-sm text-gray-500">
            Tu pedido se está procesando. Puede tardar un momento en aparecer.
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Actualiza esta página en unos segundos para ver los detalles de tu
            pedido.
          </p>
        </div>
      )}

      {/* Acciones */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href={ROUTES.accountOrders}
          className="rounded-lg bg-blue-600 px-6 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700"
        >
          Ver Mis Pedidos
        </Link>
        <Link
          href={ROUTES.products}
          className="rounded-lg border border-gray-300 px-6 py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Seguir Comprando
        </Link>
      </div>
    </div>
  );
}
