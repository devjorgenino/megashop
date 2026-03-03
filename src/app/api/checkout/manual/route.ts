/**
 * Ruta API: POST /api/checkout/manual
 * Crea un pedido con pago manual (Pago Móvil, Zelle, Binance Pay, Transferencia).
 *
 * Flujo:
 * - Valida autenticación del usuario.
 * - Valida artículos del carrito y stock (igual que la ruta de Stripe).
 * - Acepta { items, paymentMethod, referenceNumber }.
 * - Crea el pedido con status "pending".
 * - Guarda stripe_session_id como "manual_<método>_<timestamp>" para identificarlo.
 * - Guarda stripe_payment_intent_id como el número de referencia del cliente.
 * - El admin luego verifica manualmente y cambia el estado a "paid".
 */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminSupabase } from "@supabase/supabase-js";
import { PAYMENT_METHODS } from "@/lib/constants";
import type { PaymentMethodKey } from "@/lib/constants";
import type { Product } from "@/types";

// Lógica de envío (misma que CartSummary y ruta Stripe)
const FREE_SHIPPING_THRESHOLD = 5000; // centavos
const SHIPPING_COST = 599; // centavos

interface ManualCheckoutItem {
  product_id: string;
  quantity: number;
}

interface ManualCheckoutBody {
  items: ManualCheckoutItem[];
  paymentMethod: PaymentMethodKey;
  referenceNumber: string;
}

// Cliente Supabase con service-role para saltear RLS
function getAdminClient() {
  return createAdminSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Verificar autenticación
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Se requiere autenticación" },
        { status: 401 }
      );
    }

    // Parsear body
    const body: ManualCheckoutBody = await request.json();
    const { items, paymentMethod, referenceNumber } = body;

    // Validar campos requeridos
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "El carrito está vacío" },
        { status: 400 }
      );
    }

    if (!paymentMethod) {
      return NextResponse.json(
        { error: "Debe seleccionar un método de pago" },
        { status: 400 }
      );
    }

    // Validar que el método de pago sea válido
    const validMethod = PAYMENT_METHODS.find((m) => m.key === paymentMethod);
    if (!validMethod) {
      return NextResponse.json(
        { error: "Método de pago no válido" },
        { status: 400 }
      );
    }

    if (!referenceNumber || referenceNumber.trim().length === 0) {
      return NextResponse.json(
        { error: "Debe ingresar el número de referencia del pago" },
        { status: 400 }
      );
    }

    // Validar productos y stock
    const productIds = items.map((item) => item.product_id);
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("*")
      .in("id", productIds)
      .eq("is_active", true);

    if (productsError || !products) {
      return NextResponse.json(
        { error: "Error al validar los productos" },
        { status: 500 }
      );
    }

    const productMap = new Map<string, Product>();
    for (const product of products as unknown as Product[]) {
      productMap.set(product.id, product);
    }

    // Verificar que todos los productos existan y tengan stock
    for (const item of items) {
      const product = productMap.get(item.product_id);
      if (!product) {
        return NextResponse.json(
          { error: `Producto no encontrado: ${item.product_id}` },
          { status: 400 }
        );
      }
      if (product.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `Stock insuficiente para "${product.name}". Disponible: ${product.stock}`,
          },
          { status: 400 }
        );
      }
    }

    // Calcular totales
    const subtotal = items.reduce((sum, item) => {
      const product = productMap.get(item.product_id);
      if (!product) return sum;
      return sum + product.price * item.quantity;
    }, 0);

    const needsShipping = subtotal < FREE_SHIPPING_THRESHOLD;
    const shippingCost = needsShipping ? SHIPPING_COST : 0;
    const orderTotal = subtotal + shippingCost;

    // Crear pedido en la DB con estado "pending"
    const adminSupabase = getAdminClient();
    const timestamp = Date.now();

    const { data: order, error: orderError } = await adminSupabase
      .from("orders")
      .insert({
        user_id: user.id,
        status: "pending",
        total: orderTotal,
        stripe_session_id: `manual_${paymentMethod}_${timestamp}`,
        stripe_payment_intent_id: referenceNumber.trim(),
      })
      .select("id")
      .single();

    if (orderError || !order) {
      console.error("Error al crear pedido manual:", orderError?.message);
      return NextResponse.json(
        { error: "Error al crear el pedido" },
        { status: 500 }
      );
    }

    // Insertar artículos del pedido
    const orderItemRows = items
      .map((item) => {
        const product = productMap.get(item.product_id);
        if (!product) return null;
        return {
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: product.price,
        };
      })
      .filter(Boolean);

    if (orderItemRows.length > 0) {
      const { error: itemsError } = await adminSupabase
        .from("order_items")
        .insert(orderItemRows);
      if (itemsError) {
        console.error(
          "Error al insertar artículos del pedido:",
          itemsError.message
        );
      }
    }

    // Limpiar cart_items de la DB
    await adminSupabase.from("cart_items").delete().eq("user_id", user.id);

    return NextResponse.json({ orderId: order.id });
  } catch (error) {
    console.error("Error de checkout manual:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
