/**
 * Zustand cart store.
 * Hybrid cart: persists in localStorage for anonymous users.
 * Syncs with Supabase when the user logs in.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types";
import { CART_STORAGE_KEY, MAX_CART_QUANTITY } from "@/lib/constants";

interface CartState {
  items: CartItem[];
  // Actions
  addItem: (productId: string, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setItems: (items: CartItem[]) => void;
  // Getters
  getItemCount: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (productId, quantity = 1) => {
        set((state) => {
          const existing = state.items.find(
            (item) => item.product_id === productId
          );
          if (existing) {
            // Increment quantity, capped at MAX_CART_QUANTITY
            return {
              items: state.items.map((item) =>
                item.product_id === productId
                  ? {
                      ...item,
                      quantity: Math.min(
                        item.quantity + quantity,
                        MAX_CART_QUANTITY
                      ),
                    }
                  : item
              ),
            };
          }
          // Add new item
          return {
            items: [
              ...state.items,
              {
                product_id: productId,
                quantity: Math.min(quantity, MAX_CART_QUANTITY),
              },
            ],
          };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.product_id !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.product_id === productId
              ? { ...item, quantity: Math.min(quantity, MAX_CART_QUANTITY) }
              : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      setItems: (items) => set({ items }),

      getItemCount: () => {
        return get().items.length;
      },

      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: CART_STORAGE_KEY,
      // Only persist items, not functions
      partialize: (state) => ({ items: state.items }),
    }
  )
);
