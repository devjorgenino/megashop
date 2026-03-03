/**
 * Tipos generados manualmente para Supabase.
 * En producción, genera estos tipos automáticamente con:
 * npx supabase gen types typescript --project-id <id> > src/types/database.ts
 */

export type UserRole = "admin" | "customer";

export type OrderStatus =
  | "pending"
  | "paid"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: UserRole;
          full_name?: string | null;
          avatar_url?: string | null;
        };
        Update: {
          role?: UserRole;
          full_name?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
        };
        Update: {
          name?: string;
          slug?: string;
          description?: string | null;
        };
      };
      products: {
        Row: {
          id: string;
          category_id: string | null;
          name: string;
          slug: string;
          description: string | null;
          price: number; // en centavos USD
          compare_at_price: number | null;
          stock: number;
          images: string[];
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id?: string | null;
          name: string;
          slug: string;
          description?: string | null;
          price: number;
          compare_at_price?: number | null;
          stock?: number;
          images?: string[];
          is_active?: boolean;
        };
        Update: {
          category_id?: string | null;
          name?: string;
          slug?: string;
          description?: string | null;
          price?: number;
          compare_at_price?: number | null;
          stock?: number;
          images?: string[];
          is_active?: boolean;
          updated_at?: string;
        };
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          quantity: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          quantity: number;
        };
        Update: {
          quantity?: number;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          status: OrderStatus;
          total: number; // en centavos USD
          stripe_session_id: string | null;
          stripe_payment_intent_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          status?: OrderStatus;
          total: number;
          stripe_session_id?: string | null;
          stripe_payment_intent_id?: string | null;
        };
        Update: {
          status?: OrderStatus;
          stripe_session_id?: string | null;
          stripe_payment_intent_id?: string | null;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: number; // en centavos USD
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
        };
        Update: {
          quantity?: number;
          unit_price?: number;
        };
      };
    };
  };
}

// Helpers para acceder a tipos de tablas
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
