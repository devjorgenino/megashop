/**
 * Cliente Stripe para el SERVER.
 * Usa la secret key. NUNCA importar este archivo en el cliente.
 */
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
  typescript: true,
});
