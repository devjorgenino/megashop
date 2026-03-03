/**
 * Tipos compartidos de la aplicación.
 * Los tipos de DB se importan desde ./database.ts
 */

import type { Tables } from "./database";

// Re-exportar tipos de DB para uso directo
export type Product = Tables<"products">;
export type Category = Tables<"categories">;
export type Profile = Tables<"profiles">;
export type Order = Tables<"orders">;
export type OrderItem = Tables<"order_items">;
export type CartItemDB = Tables<"cart_items">;

// Producto con categoría incluida (para queries con join)
export type ProductWithCategory = Product & {
  categories: Category | null;
};

// Item del carrito (local o sincronizado)
export interface CartItem {
  product_id: string;
  quantity: number;
  // Datos del producto para mostrar en UI (se hidratan del catálogo)
  product?: Product;
}

// Orden con sus items expandidos
export type OrderWithItems = Order & {
  order_items: (OrderItem & {
    products: Product;
  })[];
};

// Respuesta paginada genérica
export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Filtros para el catálogo
export interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "price_asc" | "price_desc" | "newest" | "name";
  page?: number;
  pageSize?: number;
}
