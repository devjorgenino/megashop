"use client";

/**
 * Gráficas del dashboard de administración.
 * Usa Recharts para visualizar ingresos por mes, pedidos por estado
 * y productos más vendidos.
 *
 * Accesibilidad: role="img" con aria-label descriptivo en cada gráfica,
 * tablas de datos ocultas accesibles para lectores de pantalla.
 */
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

/* ── Tipos de datos que recibe del server ─────────────────────────── */

export interface MonthlyRevenue {
  month: string; // "Ene", "Feb", etc.
  total: number; // en USD (ya dividido entre 100)
}

export interface OrdersByStatus {
  status: string;
  label: string;
  count: number;
}

export interface TopProduct {
  name: string;
  sold: number;
  revenue: number; // en USD
}

interface DashboardChartsProps {
  monthlyRevenue: MonthlyRevenue[];
  ordersByStatus: OrdersByStatus[];
  topProducts: TopProduct[];
}

/* ── Colores ──────────────────────────────────────────────────────── */

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  paid: "#10b981",
  shipped: "#3b82f6",
  delivered: "#06b6d4",
  cancelled: "#ef4444",
};

const PRODUCT_COLORS = [
  "#2964f0",
  "#fbb017",
  "#10b981",
  "#8b5cf6",
  "#ef4444",
  "#06b6d4",
  "#f97316",
  "#ec4899",
];

/* ── Formateadores ────────────────────────────────────────────────── */

function fmtUSD(value: number) {
  return `$${value.toLocaleString("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/* ── Custom Tooltip con buen contraste ────────────────────────────── */

function ChartTooltip({
  active,
  payload,
  label,
  valuePrefix = "",
  valueSuffix = "",
}: {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any[];
  label?: string;
  valuePrefix?: string;
  valueSuffix?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg text-sm">
      {label && <p className="font-medium text-gray-900 mb-1">{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} className="text-gray-700">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full mr-1.5"
            style={{ backgroundColor: entry.color || entry.fill }}
            aria-hidden="true"
          />
          {valuePrefix}
          {typeof entry.value === "number"
            ? entry.value.toLocaleString("es-VE")
            : entry.value}
          {valueSuffix}
        </p>
      ))}
    </div>
  );
}

/* ── Componente principal ─────────────────────────────────────────── */

export function DashboardCharts({
  monthlyRevenue,
  ordersByStatus,
  topProducts,
}: DashboardChartsProps) {
  const totalOrders = ordersByStatus.reduce((s, o) => s + o.count, 0);

  return (
    <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
      {/* ── Ingresos Mensuales ───────────────────────────────────── */}
      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          Ingresos Mensuales (USD)
        </h3>
        <div
          role="img"
          aria-label={`Gráfica de barras mostrando ingresos mensuales. ${monthlyRevenue
            .map((m) => `${m.month}: ${fmtUSD(m.total)}`)
            .join(", ")}`}
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={monthlyRevenue}
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "#6b7280" }}
                axisLine={{ stroke: "#e5e7eb" }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#6b7280" }}
                axisLine={{ stroke: "#e5e7eb" }}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                content={
                  <ChartTooltip valuePrefix="$" />
                }
              />
              <Bar
                dataKey="total"
                fill="#2964f0"
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
                name="Ingresos"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Tabla accesible para lectores de pantalla */}
        <table className="sr-only">
          <caption>Ingresos mensuales en USD</caption>
          <thead>
            <tr>
              <th>Mes</th>
              <th>Ingresos</th>
            </tr>
          </thead>
          <tbody>
            {monthlyRevenue.map((m) => (
              <tr key={m.month}>
                <td>{m.month}</td>
                <td>{fmtUSD(m.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* ── Pedidos por Estado ───────────────────────────────────── */}
      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          Pedidos por Estado
        </h3>
        <div
          role="img"
          aria-label={`Gráfica circular de pedidos. ${ordersByStatus
            .map(
              (o) =>
                `${o.label}: ${o.count} (${
                  totalOrders > 0
                    ? Math.round((o.count / totalOrders) * 100)
                    : 0
                }%)`
            )
            .join(", ")}`}
        >
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={ordersByStatus}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={95}
                dataKey="count"
                nameKey="label"
                paddingAngle={2}
                stroke="none"
              >
                {ordersByStatus.map((entry) => (
                  <Cell
                    key={entry.status}
                    fill={STATUS_COLORS[entry.status] || "#94a3b8"}
                  />
                ))}
              </Pie>
              <Tooltip
                content={
                  <ChartTooltip valueSuffix=" pedidos" />
                }
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                iconSize={10}
                formatter={(value: string) => (
                  <span className="text-xs text-gray-700">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <table className="sr-only">
          <caption>Distribución de pedidos por estado</caption>
          <thead>
            <tr>
              <th>Estado</th>
              <th>Cantidad</th>
            </tr>
          </thead>
          <tbody>
            {ordersByStatus.map((o) => (
              <tr key={o.status}>
                <td>{o.label}</td>
                <td>{o.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* ── Productos Más Vendidos ───────────────────────────────── */}
      <section className="rounded-lg border border-gray-200 bg-white p-5 xl:col-span-2">
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          Productos Más Vendidos
        </h3>
        {topProducts.length === 0 ? (
          <p className="text-sm text-gray-500 py-8 text-center">
            Aún no hay datos de ventas.
          </p>
        ) : (
          <>
            <div
              role="img"
              aria-label={`Gráfica de barras horizontales. ${topProducts
                .map((p) => `${p.name}: ${p.sold} vendidos`)
                .join(", ")}`}
            >
              <ResponsiveContainer width="100%" height={Math.max(200, topProducts.length * 48)}>
                <BarChart
                  data={topProducts}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f0f0f0"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={{ stroke: "#e5e7eb" }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={{ stroke: "#e5e7eb" }}
                    width={150}
                    tickFormatter={(v: string) =>
                      v.length > 22 ? v.slice(0, 20) + "..." : v
                    }
                  />
                  <Tooltip
                    content={
                      <ChartTooltip valueSuffix=" vendidos" />
                    }
                  />
                  <Bar dataKey="sold" name="Unidades vendidas" maxBarSize={32} radius={[0, 4, 4, 0]}>
                    {topProducts.map((_, i) => (
                      <Cell
                        key={i}
                        fill={PRODUCT_COLORS[i % PRODUCT_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <table className="sr-only">
              <caption>Productos más vendidos</caption>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Unidades vendidas</th>
                  <th>Ingresos</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p) => (
                  <tr key={p.name}>
                    <td>{p.name}</td>
                    <td>{p.sold}</td>
                    <td>{fmtUSD(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </section>
    </div>
  );
}
