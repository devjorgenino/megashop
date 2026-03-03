/**
 * Ruta API: POST /api/checkout
 * Crea una sesión de Stripe Checkout con los artículos del carrito validados.
 *
 * Estrategia:
 * - Crea el pedido en la DB con estado "pending" inmediatamente (antes del redirect a Stripe).
 * - Guarda stripe_session_id para que la página de éxito pueda encontrarlo de inmediato.
 * - El webhook (/api/webhooks/stripe) después lo marca como "paid", decrementa stock,
 *   y limpia cart_items de la DB.
 * - Esto significa que los pedidos aparecen instantáneamente incluso si el webhook se retrasa
 *   (o no está configurado en desarrollo).
 */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminSupabase } from "@supabase/supabase-js";
import { stripe } from "@/lib/stripe/server";
import { CURRENCY, ROUTES } from "@/lib/constants";
import type { Product } from "@/types";

// Lógica de envío (refleja CartSummary)
const FREE_SHIPPING_THRESHOLD = 5000; // centavos
const SHIPPING_COST = 599; // centavos

interface CheckoutItem {
  product_id: string;
  quantity: number;
}

// Cliente Supabase con service-role para saltear RLS en creación de pedidos
function getAdminClient() {
  return createAdminSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Verificar que el usuario esté autenticado
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
    const body = await request.json();
    const items: CheckoutItem[] = body.items;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "El carrito está vacío" }, { status: 400 });
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

    // Construir line items de Stripe
    const lineItems = items
      .map((item) => {
        const product = productMap.get(item.product_id);
        if (!product) return null;
        return {
          price_data: {
            currency: CURRENCY,
            product_data: {
              name: product.name,
              description: product.description || undefined,
              images:
                product.images?.length &&
                product.images[0].startsWith("https://")
                  ? [product.images[0]]
                  : undefined,
            },
            unit_amount: product.price, // ya en centavos
          },
          quantity: item.quantity,
        };
      })
      .filter(Boolean) as {
      price_data: {
        currency: string;
        product_data: {
          name: string;
          description?: string;
          images?: string[];
        };
        unit_amount: number;
      };
      quantity: number;
    }[];

    // Calcular subtotal para el total del pedido y envío
    const subtotal = items.reduce((sum, item) => {
      const product = productMap.get(item.product_id);
      if (!product) return sum;
      return sum + product.price * item.quantity;
    }, 0);

    // Agregar envío como line item si aplica
    const needsShipping = subtotal < FREE_SHIPPING_THRESHOLD;
    const shippingCost = needsShipping ? SHIPPING_COST : 0;
    if (needsShipping) {
      lineItems.push({
        price_data: {
          currency: CURRENCY,
          product_data: {
            name: "Envío",
            description: `Envío gratis en pedidos mayores a $${(FREE_SHIPPING_THRESHOLD / 100).toFixed(2)}`,
          },
          unit_amount: SHIPPING_COST,
        },
        quantity: 1,
      });
    }

    const orderTotal = subtotal + shippingCost;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Codificar artículos del carrito en metadata para el webhook
    const cartMeta = JSON.stringify(
      items.map((i) => ({ p: i.product_id, q: i.quantity }))
    );

    // Crear sesión de Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: user.email,
      line_items: lineItems,
      metadata: {
        user_id: user.id,
        cart_items: cartMeta,
      },
      success_url: `${appUrl}${ROUTES.checkout}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}${ROUTES.checkout}`,
    });

    // ─── Crear pedido en DB inmediatamente (status: "pending") ───────────────
    const adminSupabase = getAdminClient();

    const { data: order, error: orderError } = await adminSupabase
      .from("orders")
      .insert({
        user_id: user.id,
        status: "pending",
        total: orderTotal,
        stripe_session_id: session.id,
      })
      .select("id")
      .single();

    if (orderError || !order) {
      console.error("Error al crear pedido pendiente:", orderError?.message);
    } else {
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
          console.error("Error al insertar artículos del pedido:", itemsError.message);
        }
      }

      // Limpiar cart_items de la DB inmediatamente
      await adminSupabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id);
    }
    // ─────────────────────────────────────────────────────────────────────────

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error de checkout:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
