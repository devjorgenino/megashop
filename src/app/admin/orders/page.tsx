/**
 * Página de listado de pedidos del admin.
 */
import { createClient } from "@/lib/supabase/server";
import { OrderTable } from "./order-table";
import type { Order } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gestionar Pedidos",
};

export default async function AdminOrdersPage() {
  const supabase = await createClient();

  // Obtener pedidos con nombre del cliente
  const { data: orders } = await supabase
    .from("orders")
    .select("*, profiles(full_name)")
    .order("created_at", { ascending: false });

  const count = (orders ?? []).length;

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
        <p className="mt-1 text-sm text-gray-500">
          {count} {count !== 1 ? "pedidos" : "pedido"} en total
        </p>
      </div>

      <div className="mt-6">
        <OrderTable
          orders={
            (orders as unknown as (Order & {
              profiles: { full_name: string | null } | null;
            })[]) ?? []
          }
        />
      </div>
    </div>
  );
}
