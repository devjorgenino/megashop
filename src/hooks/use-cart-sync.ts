"use client";

/**
 * Hook that syncs the Zustand cart (localStorage)
 * with the Supabase database when the user logs in.
 *
 * Flow:
 * 1. User browses anonymously → cart in localStorage
 * 2. User logs in → merge localStorage + DB → save to DB + Zustand
 * 3. User browses while logged in → every change is saved to DB
 * 4. User logs out → Zustand cart stays in localStorage
 */
import { useEffect, useRef } from "react";
import { useCartStore } from "@/stores/cart-store";
import { createClient } from "@/lib/supabase/client";
import {
  loadCartFromDB,
  saveCartToDB,
  mergeCartItems,
} from "@/lib/cart";
import type { User } from "@supabase/supabase-js";

export function useCartSync() {
  const supabase = createClient();
  const hasSynced = useRef(false);
  const currentUserId = useRef<string | null>(null);

  useEffect(() => {
    // Listen for session changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const user: User | null = session?.user ?? null;

      if (event === "SIGNED_IN" && user && !hasSynced.current) {
        // Merge local cart with DB on login
        await syncOnLogin(user.id);
        currentUserId.current = user.id;
        hasSynced.current = true;
      }

      if (event === "SIGNED_OUT") {
        // On logout, keep the local cart as-is
        currentUserId.current = null;
        hasSynced.current = false;
      }
    });

    // Initial check: if a session already exists, sync
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user && !hasSynced.current) {
        syncOnLogin(user.id).then(() => {
          currentUserId.current = user.id;
          hasSynced.current = true;
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Subscribe to store changes to persist to DB
  useEffect(() => {
    const unsubscribe = useCartStore.subscribe((state, prevState) => {
      if (!currentUserId.current) return;
      // Only save if items actually changed
      if (state.items !== prevState.items) {
        saveCartToDB(currentUserId.current, state.items);
      }
    });

    return unsubscribe;
  }, []);
}

/**
 * Syncs the cart when the user logs in.
 */
async function syncOnLogin(userId: string) {
  const localItems = useCartStore.getState().items;
  const dbItems = await loadCartFromDB(userId);

  if (localItems.length === 0 && dbItems.length === 0) {
    return; // Nothing to sync
  }

  if (localItems.length === 0) {
    // Only DB items → load into local store
    useCartStore.getState().setItems(dbItems);
    return;
  }

  if (dbItems.length === 0) {
    // Only local items → save to DB
    await saveCartToDB(userId, localItems);
    return;
  }

  // Items in both → merge
  const merged = mergeCartItems(localItems, dbItems);
  useCartStore.getState().setItems(merged);
  await saveCartToDB(userId, merged);
}
