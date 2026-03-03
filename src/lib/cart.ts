/**
 * Cart synchronization functions for Supabase.
 * Used from Client Components (browser client).
 *
 * Hybrid strategy:
 * - Anonymous users: cart lives only in localStorage (Zustand persist)
 * - Authenticated users: on login, merge localStorage → DB
 * - Subsequent changes: written to both localStorage and DB
 */
import { createClient } from "@/lib/supabase/client";
import { MAX_CART_QUANTITY } from "@/lib/constants";
import type { CartItem } from "@/types";

const supabase = createClient();

/**
 * Loads the cart items from the database.
 */
export async function loadCartFromDB(userId: string): Promise<CartItem[]> {
  const { data, error } = await supabase
    .from("cart_items")
    .select("product_id, quantity")
    .eq("user_id", userId);

  if (error || !data) return [];

  return (data as { product_id: string; quantity: number }[]).map((item) => ({
    product_id: item.product_id,
    quantity: item.quantity,
  }));
}

/**
 * Saves the entire cart to the database.
 * Replaces ALL items for the user (delete + insert).
 */
export async function saveCartToDB(
  userId: string,
  items: CartItem[]
): Promise<void> {
  // Delete current items
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from("cart_items").delete().eq("user_id", userId);

  if (items.length === 0) return;

  // Insert new items
  const rows = items.map((item) => ({
    user_id: userId,
    product_id: item.product_id,
    quantity: Math.min(item.quantity, MAX_CART_QUANTITY),
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from("cart_items").insert(rows);
}

/**
 * Merges the local cart (localStorage) with the DB cart.
 * Strategy: local cart takes priority (user just added items).
 * If a product exists in both, quantities are summed (up to MAX_CART_QUANTITY).
 * If a product only exists in DB, it is kept.
 */
export function mergeCartItems(
  localItems: CartItem[],
  dbItems: CartItem[]
): CartItem[] {
  const merged = new Map<string, CartItem>();

  // First add DB items
  for (const item of dbItems) {
    merged.set(item.product_id, { ...item });
  }

  // Then merge local items (they take priority)
  for (const item of localItems) {
    const existing = merged.get(item.product_id);
    if (existing) {
      // Sum quantities
      merged.set(item.product_id, {
        product_id: item.product_id,
        quantity: Math.min(
          existing.quantity + item.quantity,
          MAX_CART_QUANTITY
        ),
      });
    } else {
      merged.set(item.product_id, { ...item });
    }
  }

  return Array.from(merged.values());
}

/**
 * Removes a specific item from the cart in DB.
 */
export async function removeCartItemFromDB(
  userId: string,
  productId: string
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from("cart_items")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);
}

/**
 * Updates the quantity of a cart item in DB (upsert).
 */
export async function upsertCartItemInDB(
  userId: string,
  productId: string,
  quantity: number
): Promise<void> {
  if (quantity <= 0) {
    await removeCartItemFromDB(userId, productId);
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from("cart_items")
    .upsert(
      {
        user_id: userId,
        product_id: productId,
        quantity: Math.min(quantity, MAX_CART_QUANTITY),
      },
      { onConflict: "user_id,product_id" }
    );
}
