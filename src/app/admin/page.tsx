/**
 * Panel de administración - Dashboard.
 * Muestra estadísticas generales, gráficas y botones de reportes.
 *
 * Server Component: obtiene datos de Supabase y los pasa a
 * Client Components (DashboardCharts, ReportButtons).
 */
import { createClient } from "@/lib/supabase/server";
import { formatPrice, cn } from "@/lib/utils";
import { Package, ShoppingBag, DollarSign, Users } from "lucide-react";
import Link from "next/link";
import { ROUTES, PAYMENT_METHODS } from "@/lib/constants";
import { DashboardCharts } from "./dashboard-charts";
import type { MonthlyRevenue, OrdersByStatus, TopProduct } from "./dashboard-charts";
import { ReportButtons } from "./report-buttons";
import type { ReportProduct, ReportOrder, ReportSalesSummary } from "./report-buttons";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Panel de Administración",
};

/* ── Helpers ──────────────────────────────────────────────────────── */

const MONTH_NAMES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  paid: "Pagado",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

const ALL_STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"];

function getPaymentMethodLabel(stripeSessionId: string | null): string {
  if (!stripeSessionId) return "Stripe";
  if (stripeSessionId.startsWith("manual_")) {
    const key = stripeSessionId.split("_")[1];
    const method = PAYMENT_METHODS.find((m) => m.key === key);
    return method?.label ?? key;
  }
  return "Stripe";
}

/* ── Page ─────────────────────────────────────────────────────────── */

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Obtener todas las estadísticas en paralelo
  const [
    productsRes,
    ordersRes,
    paidOrdersRes,
    customersRes,
    allOrdersRes,
    productsFullRes,
    orderItemsRes,
  ] = await Promise.all([
    // Count products
    supabase.from("products").select("*", { count: "exact", head: true }),
    // Count orders
    supabase.from("orders").select("*", { count: "exact", head: true }),
    // Sum revenue from paid orders
    supabase.from("orders").select("total").eq("status", "paid"),
    // Count unique customers
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "customer"),
    // All orders for charts + reports
    supabase
      .from("orders")
      .select("id, created_at, status, total, user_id, stripe_session_id")
      .order("created_at", { ascending: false }),
    // All products for reports
    supabase
      .from("products")
      .select("id, name, price, stock, is_active, category_id, categories(name)")
      .order("name"),
    // All order items for top products
    supabase
      .from("order_items")
      .select("product_id, quantity, unit_price, products(name)")
      .not("products", "is", null),
  ]);

  /* ── Stat card values ──────────────────────────────────────────── */

  const totalProducts = productsRes.count ?? 0;
  const totalOrders = ordersRes.count ?? 0;
  const totalCustomers = customersRes.count ?? 0;
  const revenue = (
    (paidOrdersRes.data as { total: number }[] | null) ?? []
  ).reduce((sum: number, o: { total: number }) => sum + o.total, 0);

  /* ── Monthly revenue for chart ─────────────────────────────────── */

  const now = new Date();
  const monthlyMap = new Map<string, number>();
  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyMap.set(key, 0);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allOrders = (allOrdersRes.data ?? []) as any[];
  for (const order of allOrders) {
    if (order.status === "paid" || order.status === "delivered" || order.status === "shipped") {
      const d = new Date(order.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (monthlyMap.has(key)) {
        monthlyMap.set(key, (monthlyMap.get(key) || 0) + order.total / 100);
      }
    }
  }

  const monthlyRevenue: MonthlyRevenue[] = Array.from(monthlyMap.entries()).map(
    ([key, total]) => {
      const monthIdx = parseInt(key.split("-")[1], 10) - 1;
      return { month: MONTH_NAMES[monthIdx], total };
    }
  );

  /* ── Orders by status for chart ────────────────────────────────── */

  const statusCounts = new Map<string, number>();
  for (const s of ALL_STATUSES) statusCounts.set(s, 0);
  for (const order of allOrders) {
    statusCounts.set(order.status, (statusCounts.get(order.status) || 0) + 1);
  }

  const ordersByStatus: OrdersByStatus[] = ALL_STATUSES.map((s) => ({
    status: s,
    label: STATUS_LABELS[s] || s,
    count: statusCounts.get(s) || 0,
  })).filter((o) => o.count > 0);

  /* ── Top products for chart ────────────────────────────────────── */

  const productSales = new Map<string, { name: string; sold: number; revenue: number }>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orderItems = (orderItemsRes.data ?? []) as any[];
  for (const item of orderItems) {
    const name = item.products?.name ?? "Producto eliminado";
    const existing = productSales.get(item.product_id) || {
      name,
      sold: 0,
      revenue: 0,
    };
    existing.sold += item.quantity;
    existing.revenue += (item.unit_price * item.quantity) / 100;
    productSales.set(item.product_id, existing);
  }

  const topProducts: TopProduct[] = Array.from(productSales.values())
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 8);

  /* ── Report data ───────────────────────────────────────────────── */

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reportProducts: ReportProduct[] = ((productsFullRes.data ?? []) as any[]).map(
    (p) => ({
      name: p.name,
      price: p.price,
      stock: p.stock,
      category: p.categories?.name ?? "Sin categoría",
      is_active: p.is_active,
    })
  );

  // Get customer profiles for order mapping
  const customerIds = [...new Set(allOrders.map((o) => o.user_id))];
  let profilesMap = new Map<string, string>();
  if (customerIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", customerIds);
    if (profiles) {
      for (const p of profiles as { id: string; full_name: string | null }[]) {
        profilesMap.set(p.id, p.full_name || "Cliente");
      }
    }
  }

  const reportOrders: ReportOrder[] = allOrders.map((o) => ({
    id: o.id,
    created_at: o.created_at,
    status: o.status,
    total: o.total,
    customer: profilesMap.get(o.user_id) || "Cliente",
    payment_method: getPaymentMethodLabel(o.stripe_session_id),
  }));

  const salesSummary: ReportSalesSummary = {
    totalRevenue: revenue,
    totalOrders,
    totalCustomers,
    totalProducts,
    topProducts,
    monthlyRevenue,
  };

  /* ── Stat cards config ─────────────────────────────────────────── */

  const stats = [
    {
      label: "Total Productos",
      value: totalProducts.toString(),
      icon: Package,
      href: ROUTES.adminProducts,
      color: "text-blue-600 bg-blue-100",
    },
    {
      label: "Total Pedidos",
      value: totalOrders.toString(),
      icon: ShoppingBag,
      href: ROUTES.adminOrders,
      color: "text-green-600 bg-green-100",
    },
    {
      label: "Ingresos",
      value: formatPrice(revenue),
      icon: DollarSign,
      href: ROUTES.adminOrders,
      color: "text-emerald-600 bg-emerald-100",
    },
    {
      label: "Total Clientes",
      value: totalCustomers.toString(),
      icon: Users,
      href: ROUTES.admin,
      color: "text-purple-600 bg-purple-100",
    },
  ];

  /* ── Render ─────────────────────────────────────────────────────── */

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Panel de Control</h1>
      <p className="mt-1 text-sm text-gray-500">
        Resumen del rendimiento de tu tienda.
      </p>

      {/* Cuadrícula de estadísticas */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-lg",
                    stat.color
                  )}
                >
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Gráficas */}
      <DashboardCharts
        monthlyRevenue={monthlyRevenue}
        ordersByStatus={ordersByStatus}
        topProducts={topProducts}
      />

      {/* Reportes PDF */}
      <ReportButtons
        products={reportProducts}
        orders={reportOrders}
        salesSummary={salesSummary}
      />

      {/* Acciones rápidas */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900">Acciones Rápidas</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={`${ROUTES.adminProducts}/new`}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors"
          >
            + Agregar Producto
          </Link>
          <Link
            href={ROUTES.adminProducts}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Gestionar Productos
          </Link>
          <Link
            href={ROUTES.adminOrders}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Ver Pedidos
          </Link>
        </div>
      </div>
    </div>
  );
}
