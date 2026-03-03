"use server";

/**
 * Server Actions para gestión de pedidos (admin).
 */
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";
import type { OrderStatus } from "@/types/database";

export type OrderActionResult = {
  error?: string;
  success?: boolean;
};

/**
 * Actualizar el estado de un pedido.
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<OrderActionResult> {
  await requireAdmin();
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(ROUTES.adminOrders);
  return { success: true };
}
