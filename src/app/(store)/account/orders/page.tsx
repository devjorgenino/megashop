/**
 * Página de pedidos del cliente.
 * Obtiene los pedidos del usuario con order_items + products join.
 * Muestra el historial de pedidos con badges de estado y detalles.
 */
import Link from "next/link";
import { Package, ChevronRight } from "lucide-react";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ROUTES } from "@/lib/constants";
import { formatPrice, formatPriceVES } from "@/lib/utils";
import type { Metadata } from "next";
import type { OrderWithItems } from "@/types";
import type { OrderStatus } from "@/types/database";

export const metadata: Metadata = {
  title: "Mis Pedidos",
};

const STATUS_STYLES: Record<OrderStatus, { bg: string; text: string }> = {
  pending: { bg: "bg-yellow-100", text: "text-yellow-800" },
  paid: { bg: "bg-green-100", text: "text-green-800" },
  shipped: { bg: "bg-blue-100", text: "text-blue-800" },
  delivered: { bg: "bg-gray-100", text: "text-gray-800" },
  cancelled: { bg: "bg-red-100", text: "text-red-800" },
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pendiente",
  paid: "Pagado",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

export default async function OrdersPage() {
  const user = await requireAuth();

  const supabase = await createClient();

  // Obtener pedidos con artículos e info de productos, más recientes primero
  const { data: orders } = await (supabase as any)
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
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const typedOrders = (orders || []) as OrderWithItems[];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Mis Pedidos</h1>
        <Link
          href={ROUTES.account}
          className="text-sm text-blue-600 hover:text-blue-500"
        >
          Volver a Mi Cuenta
        </Link>
      </div>

      {typedOrders.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-gray-300 p-12 text-center">
          <Package className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
          <p className="mt-4 text-gray-500">
            Aún no tienes pedidos. Comienza a comprar para ver tu historial aquí.
          </p>
          <Link
            href={ROUTES.products}
            className="mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Explorar Productos
          </Link>
        </div>
      ) : (
        <section className="mt-8 space-y-4" aria-label="Lista de pedidos">
          {typedOrders.map((order) => {
            const statusStyle =
              STATUS_STYLES[order.status] || STATUS_STYLES.pending;
            const statusLabel =
              STATUS_LABELS[order.status] || order.status;
            const itemCount = order.order_items.reduce(
              (sum, item) => sum + item.quantity,
              0
            );
            const createdAt = new Date(order.created_at).toLocaleDateString(
              "es-VE",
              {
                year: "numeric",
                month: "short",
                day: "numeric",
              }
            );

            return (
              <div
                key={order.id}
                className="rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-sm"
              >
                {/* Encabezado del pedido */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-mono text-sm font-medium text-gray-900">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-500">{createdAt}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}
                    >
                      {statusLabel}
                    </span>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatPrice(order.total)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatPriceVES(order.total)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Vista previa de artículos */}
                <div className="mt-3 flex items-center gap-2">
                  {/* Mostrar hasta 4 imágenes de productos */}
                  <div className="flex -space-x-2">
                    {order.order_items.slice(0, 4).map((item) => (
                      <div
                        key={item.id}
                        className="relative h-10 w-10 overflow-hidden rounded-lg border-2 border-white bg-gray-100"
                      >
                        {item.products?.images?.[0] ? (
                          <img
                            src={item.products.images[0]}
                            alt={item.products.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Package className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                      </div>
                    ))}
                    {order.order_items.length > 4 && (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-white bg-gray-100 text-xs font-medium text-gray-500">
                        +{order.order_items.length - 4}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {itemCount} {itemCount === 1 ? "artículo" : "artículos"}
                  </p>
                </div>

                {/* Lista expandible de artículos */}
                <details className="mt-3 group">
                  <summary className="flex cursor-pointer items-center text-xs font-medium text-blue-600 hover:text-blue-500">
                    <ChevronRight className="mr-1 h-3 w-3 transition-transform group-open:rotate-90" />
                    Ver artículos
                  </summary>
                  <div className="mt-2 space-y-2 border-t border-gray-100 pt-2">
                    {order.order_items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="truncate text-gray-700">
                            {item.products?.name || "Producto"}
                          </span>
                          <span className="flex-shrink-0 text-xs text-gray-400">
                            &times;{item.quantity}
                          </span>
                        </div>
                        <span className="flex-shrink-0 font-medium text-gray-900">
                          {formatPrice(item.unit_price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}
