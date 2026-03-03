"use client";

/**
 * Layout shell: Header + cart sync + toast notifications.
 * Only the Header needs to be a Client Component (useUser, useCartSync).
 * The Footer is an async Server Component and lives in the server layout.
 */
import { Header } from "./header";
import { useCartSync } from "@/hooks/use-cart-sync";
import { ToastContainer } from "@/components/ui/toast";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  useCartSync();

  return (
    <>
      <Header />
      {children}
      <ToastContainer />
    </>
  );
}
