/**
 * Utilidades compartidas.
 */
import { clsx, type ClassValue } from "clsx";
import { VES_RATE, VES_SYMBOL } from "./constants";

// Combinar clases de Tailwind de forma segura
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Formatear precio en centavos a formato legible (USD)
export function formatPrice(priceInCents: number): string {
  return new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: "USD",
  }).format(priceInCents / 100);
}

// Formatear precio en centavos a Bolívares (Bs)
export function formatPriceVES(priceInCents: number): string {
  const usd = priceInCents / 100;
  const ves = usd * VES_RATE;
  return `${VES_SYMBOL} ${new Intl.NumberFormat("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(ves)}`;
}

// Formatear doble moneda: "$10.00 / Bs 783,10"
export function formatDualPrice(priceInCents: number): string {
  return `${formatPrice(priceInCents)} / ${formatPriceVES(priceInCents)}`;
}

// Generar slug desde un string
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Truncar texto
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "...";
}

// Calcular porcentaje de descuento
export function discountPercentage(
  price: number,
  compareAtPrice: number
): number {
  if (compareAtPrice <= 0) return 0;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}
