"use client";

/**
 * Tabla de pedidos con selector de estado inline.
 * Muestra detalles de pago manual (método y referencia) cuando aplica.
 */
import { useState } from "react";
import { formatPrice } from "@/lib/utils";
import { PAYMENT_METHODS } from "@/lib/constants";
import { updateOrderStatus } from "./actions";
import type { Order } from "@/types";
import type { OrderStatus } from "@/types/database";

interface OrderTableProps {
  orders: (Order & { profiles: { full_name: string | null } | null })[];
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "Pendiente" },
  { value: "paid", label: "Pagado" },
  { value: "shipped", label: "Enviado" },
  { value: "delivered", label: "Entregado" },
  { value: "cancelled", label: "Cancelado" },
];

/**
 * Parsea stripe_session_id para detectar pagos manuales.
 * Formato: "manual_<método>_<timestamp>"
 */
function parseManualPayment(stripeSessionId: string | null) {
  if (!stripeSessionId || !stripeSessionId.startsWith("manual_")) {
    return null;
  }
  const parts = stripeSessionId.replace("manual_", "").split("_");
  parts.pop(); // eliminar timestamp
  const methodKey = parts.join("_");
  const method = PAYMENT_METHODS.find((m) => m.key === methodKey);
  return {
    methodKey,
    methodLabel: method?.label ?? methodKey,
  };
}

export function OrderTable({ orders }: OrderTableProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleStatusChange(orderId: string, status: OrderStatus) {
    setLoadingId(orderId);
    const result = await updateOrderStatus(orderId, status);
    if (result.error) {
      alert(`Error: ${result.error}`);
    }
    setLoadingId(null);
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
        <p className="text-gray-500">Aún no hay pedidos.</p>
        <p className="mt-1 text-sm text-gray-400">
          Los pedidos aparecerán aquí cuando los clientes realicen compras.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200" aria-label="Tabla de pedidos">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
              Pedido
            </th>
            <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 sm:table-cell">
              Cliente
            </th>
            <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 md:table-cell">
              Pago
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">
              Total
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500">
              Estado
            </th>
            <th className="hidden px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500 md:table-cell">
              Fecha
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {orders.map((order) => {
            const isLoading = loadingId === order.id;
            const manualInfo = parseManualPayment(
              order.stripe_session_id ?? null
            );

            return (
              <tr
                key={order.id}
                className={isLoading ? "opacity-50" : "hover:bg-gray-50"}
              >
                {/* ID del pedido */}
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-gray-900 font-mono">
                    {order.id.slice(0, 8)}...
                  </p>
                </td>

                {/* Cliente */}
                <td className="hidden px-4 py-3 sm:table-cell">
                  <p className="text-sm text-gray-600">
                    {order.profiles?.full_name || "Desconocido"}
                  </p>
                  <p className="text-xs text-gray-400 font-mono">
                    {order.user_id.slice(0, 8)}...
                  </p>
                </td>

                {/* Método de pago */}
                <td className="hidden px-4 py-3 md:table-cell">
                  {manualInfo ? (
                    <div>
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                        {manualInfo.methodLabel}
                      </span>
                      {order.stripe_payment_intent_id && (
                        <p
                          className="mt-0.5 text-xs text-gray-400 font-mono truncate max-w-[140px]"
                          title={order.stripe_payment_intent_id}
                        >
                          Ref: {order.stripe_payment_intent_id}
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                      Stripe
                    </span>
                  )}
                </td>

                {/* Total */}
                <td className="px-4 py-3 text-right">
                  <span className="text-sm font-semibold text-gray-900">
                    {formatPrice(order.total)}
                  </span>
                </td>

                {/* Selector de estado */}
                <td className="px-4 py-3 text-center">
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(
                        order.id,
                        e.target.value as OrderStatus
                      )
                    }
                    disabled={isLoading}
                    aria-label="Cambiar estado del pedido"
                    className={`rounded-full px-2.5 py-1 text-xs font-medium border-0 cursor-pointer focus:ring-2 focus:ring-blue-500 ${
                      STATUS_COLORS[order.status as OrderStatus] ??
                      "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </td>

                {/* Fecha */}
                <td className="hidden px-4 py-3 text-right md:table-cell">
                  <span className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString("es-VE", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
