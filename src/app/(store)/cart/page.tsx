/**
 * Página del carrito.
 * Renderiza el componente CartContent (Client Component).
 */
import { CartContent } from "./cart-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Carrito de Compras",
};

export default function CartPage() {
  return <CartContent />;
}
