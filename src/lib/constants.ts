/**
 * Constantes globales de la aplicación.
 */

export const APP_NAME = "MegaShop";
export const APP_DESCRIPTION =
  "Tu tienda en línea de moda, electrónica, muebles, deportes y más. Grandes ofertas todos los días.";

// Paginación
export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 48;

// Carrito
export const MAX_CART_QUANTITY = 10;
export const CART_STORAGE_KEY = "megashop-cart";

// Moneda
export const CURRENCY = "usd";
export const CURRENCY_SYMBOL = "$";

// Tasa de cambio USD → Bolívares (Bs)
// IMPORTANTE: Actualizar esta tasa periódicamente según el BCV
export const VES_RATE = 78.31; // 1 USD = 78.31 Bs (tasa BCV referencial)
export const VES_SYMBOL = "Bs";

// Imágenes
export const PRODUCT_IMAGE_BUCKET = "product-images";
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

// Métodos de pago para Venezuela
export type PaymentMethodKey =
  | "pago_movil"
  | "zelle"
  | "binance"
  | "transferencia";

export interface PaymentMethodConfig {
  key: PaymentMethodKey;
  label: string;
  description: string;
  /** Detalles de la cuenta que se muestran al cliente */
  details: { label: string; value: string }[];
  /** Placeholder para el campo de referencia */
  referencePlaceholder: string;
}

// IMPORTANTE: Actualizar estos datos con los datos reales de tu negocio
export const PAYMENT_METHODS: PaymentMethodConfig[] = [
  {
    key: "pago_movil",
    label: "Pago Móvil",
    description: "Transferencia inmediata desde tu banco en Venezuela",
    details: [
      { label: "Banco", value: "Banco Mercantil" },
      { label: "Teléfono", value: "0412-000-0000" },
      { label: "Cédula", value: "V-00.000.000" },
    ],
    referencePlaceholder: "Ej: 20260303120000",
  },
  {
    key: "zelle",
    label: "Zelle",
    description: "Transferencia directa en dólares desde tu banco en USA",
    details: [
      { label: "Correo electrónico", value: "pagos@megashop.com" },
      { label: "Titular", value: "MegaShop LLC" },
    ],
    referencePlaceholder: "Ej: ID de transacción o confirmación",
  },
  {
    key: "binance",
    label: "Binance Pay",
    description: "Pago con criptomonedas vía Binance",
    details: [
      { label: "Binance Pay ID", value: "000000000" },
      { label: "Correo Binance", value: "pagos@megashop.com" },
    ],
    referencePlaceholder: "Ej: ID de orden de Binance Pay",
  },
  {
    key: "transferencia",
    label: "Transferencia Bancaria",
    description: "Transferencia nacional en bolívares",
    details: [
      { label: "Banco", value: "Banco Mercantil" },
      { label: "Tipo de cuenta", value: "Corriente" },
      { label: "Número de cuenta", value: "0000-0000-00-0000000000" },
      { label: "Titular", value: "MegaShop C.A." },
      { label: "RIF", value: "J-00000000-0" },
    ],
    referencePlaceholder: "Ej: Número de referencia de la transferencia",
  },
];

// Rutas
export const ROUTES = {
  home: "/",
  products: "/products",
  cart: "/cart",
  checkout: "/checkout",
  login: "/login",
  register: "/register",
  account: "/account",
  accountOrders: "/account/orders",
  admin: "/admin",
  adminProducts: "/admin/products",
  adminOrders: "/admin/orders",
} as const;
