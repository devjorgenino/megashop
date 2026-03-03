/**
 * API Route: POST /api/webhooks/stripe
 * Handles Stripe webhook events (checkout.session.completed).
 *
 * Since /api/checkout now creates the order immediately in "pending" status,
 * this webhook's job is to:
 * 1. Verify the Stripe signature
 * 2. Find the existing "pending" order by stripe_session_id
 * 3. Update it to "paid"
 * 4. Decrement stock for each product
 * (cart_items are already cleared by /api/checkout)
 *
 * If no order exists yet (edge case), it creates one as a fallback.
 */
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { createClient } from "@supabase/supabase-js";
import type Stripe from "stripe";

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    try {
      await handleCheckoutCompleted(session);
    } catch (error) {
      console.error("Error handling checkout.session.completed:", error);
      // Return 200 so Stripe doesn't keep retrying
      return NextResponse.json(
        { error: "Handler error, but acknowledged" },
        { status: 200 }
      );
    }
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const supabase = getAdminClient();

  const userId = session.metadata?.user_id;
  const cartItemsRaw = session.metadata?.cart_items;

  if (!userId) {
    console.error("Missing user_id in session metadata:", session.id);
    return;
  }

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id || null;

  // ── Case 1: order already exists (created by /api/checkout) ──────────────
  const { data: existingOrder } = await supabase
    .from("orders")
    .select("id, status")
    .eq("stripe_session_id", session.id)
    .single();

  if (existingOrder) {
    // Already paid — idempotent, nothing to do
    if (existingOrder.status === "paid") {
      console.log("Order already paid for session:", session.id);
      return;
    }

    // Update pending → paid and record payment_intent
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "paid",
        stripe_payment_intent_id: paymentIntentId,
      })
      .eq("id", existingOrder.id);

    if (updateError) {
      throw new Error(`Failed to update order to paid: ${updateError.message}`);
    }

    // Decrement stock using order_items already saved
    await decrementStock(supabase, existingOrder.id);

    console.log(`Order ${existingOrder.id} marked as paid (session: ${session.id})`);
    return;
  }

  // ── Case 2: fallback — order wasn't created by /api/checkout ─────────────
  if (!cartItemsRaw) {
    console.error("No order found and no cart metadata for session:", session.id);
    return;
  }

  const cartItems: { p: string; q: number }[] = JSON.parse(cartItemsRaw);
  const productIds = cartItems.map((item) => item.p);

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, price, stock, name")
    .in("id", productIds);

  if (productsError || !products) {
    throw new Error(`Failed to fetch products: ${productsError?.message}`);
  }

  const productMap = new Map<
    string,
    { id: string; price: number; stock: number; name: string }
  >();
  for (const product of products) {
    productMap.set(product.id, product);
  }

  let orderTotal = 0;
  const orderItems: { product_id: string; quantity: number; unit_price: number }[] = [];

  for (const item of cartItems) {
    const product = productMap.get(item.p);
    if (!product) continue;
    orderItems.push({ product_id: item.p, quantity: item.q, unit_price: product.price });
    orderTotal += product.price * item.q;
  }

  if (orderItems.length === 0) {
    console.error("No valid order items for session:", session.id);
    return;
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      status: "paid",
      total: orderTotal,
      stripe_session_id: session.id,
      stripe_payment_intent_id: paymentIntentId,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    throw new Error(`Failed to create order: ${orderError?.message}`);
  }

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems.map((item) => ({ order_id: order.id, ...item })));

  if (itemsError) {
    console.error("Failed to create order items:", itemsError.message);
  }

  // Decrement stock
  for (const item of orderItems) {
    const product = productMap.get(item.product_id);
    if (!product) continue;
    const newStock = Math.max(0, product.stock - item.quantity);
    await supabase.from("products").update({ stock: newStock }).eq("id", item.product_id);
  }

  // Clear cart_items from DB (fallback — should already be cleared)
  await supabase.from("cart_items").delete().eq("user_id", userId);

  console.log(`Order ${order.id} created via webhook for session ${session.id}`);
}

async function decrementStock(
  supabase: ReturnType<typeof getAdminClient>,
  orderId: string
) {
  // Fetch order items to know what to decrement
  const { data: items } = await supabase
    .from("order_items")
    .select("product_id, quantity")
    .eq("order_id", orderId);

  if (!items || items.length === 0) return;

  for (const item of items) {
    // Read current stock then decrement
    const { data: product } = await supabase
      .from("products")
      .select("stock")
      .eq("id", item.product_id)
      .single();

    if (!product) continue;

    const newStock = Math.max(0, product.stock - item.quantity);
    const { error } = await supabase
      .from("products")
      .update({ stock: newStock })
      .eq("id", item.product_id);

    if (error) {
      console.error(`Failed to decrement stock for ${item.product_id}:`, error.message);
    }
  }
}
