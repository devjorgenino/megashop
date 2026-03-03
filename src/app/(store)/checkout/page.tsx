/**
 * Página de checkout.
 * Protegida por middleware (redirige a /login si no hay sesión).
 */
import { CheckoutContent } from "./checkout-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pagar",
};

export default function CheckoutPage() {
  return <CheckoutContent />;
}
