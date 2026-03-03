"use client";

/**
 * Botones para generar reportes PDF del dashboard.
 * Usa jsPDF + jspdf-autotable para crear PDFs con tablas.
 *
 * Accesibilidad: aria-label descriptivos, aria-busy durante generación,
 * role="status" en mensajes de feedback.
 */
import { useState, useCallback } from "react";
import { FileText, Download, Loader2 } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

/* ── Tipos ────────────────────────────────────────────────────────── */

export interface ReportProduct {
  name: string;
  price: number; // cents
  stock: number;
  category: string;
  is_active: boolean;
}

export interface ReportOrder {
  id: string;
  created_at: string;
  status: string;
  total: number; // cents
  customer: string;
  payment_method: string;
}

export interface ReportSalesSummary {
  totalRevenue: number; // cents
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  topProducts: { name: string; sold: number; revenue: number }[];
  monthlyRevenue: { month: string; total: number }[];
}

interface ReportButtonsProps {
  products: ReportProduct[];
  orders: ReportOrder[];
  salesSummary: ReportSalesSummary;
}

/* ── Helpers ──────────────────────────────────────────────────────── */

function fmtPrice(cents: number): string {
  return `$${(cents / 100).toLocaleString("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-VE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  paid: "Pagado",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

function today(): string {
  return new Date().toLocaleDateString("es-VE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/* ── PDF generators (lazy-loaded) ────────────────────────────────── */

async function loadJsPDF() {
  const { jsPDF } = await import("jspdf");
  const autoTableModule = await import("jspdf-autotable");
  // jspdf-autotable adds autoTable to jsPDF prototype on import
  void autoTableModule;
  return jsPDF;
}

function addHeader(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  doc: any,
  title: string
) {
  doc.setFontSize(18);
  doc.setTextColor(41, 100, 240); // primary
  doc.text(APP_NAME, 14, 18);
  doc.setFontSize(14);
  doc.setTextColor(51, 51, 51);
  doc.text(title, 14, 28);
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(`Generado: ${today()}`, 14, 35);
  doc.setDrawColor(229, 231, 235);
  doc.line(14, 38, doc.internal.pageSize.getWidth() - 14, 38);
  return 45; // Y position after header
}

async function generateSalesReport(summary: ReportSalesSummary) {
  const JsPDF = await loadJsPDF();
  const doc = new JsPDF();
  let y = addHeader(doc, "Reporte de Ventas");

  // Summary cards
  doc.setFontSize(11);
  doc.setTextColor(51, 51, 51);
  const summaryData = [
    ["Ingresos Totales", fmtPrice(summary.totalRevenue)],
    ["Total Pedidos", summary.totalOrders.toString()],
    ["Total Clientes", summary.totalCustomers.toString()],
    ["Total Productos", summary.totalProducts.toString()],
  ];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (doc as any).autoTable({
    startY: y,
    head: [["Concepto", "Valor"]],
    body: summaryData,
    theme: "grid",
    headStyles: { fillColor: [41, 100, 240], fontSize: 10 },
    bodyStyles: { fontSize: 10 },
    margin: { left: 14, right: 14 },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 12;

  // Monthly revenue table
  doc.setFontSize(12);
  doc.text("Ingresos Mensuales", 14, y);
  y += 4;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (doc as any).autoTable({
    startY: y,
    head: [["Mes", "Ingresos (USD)"]],
    body: summary.monthlyRevenue.map((m) => [m.month, `$${m.total.toLocaleString("es-VE", { minimumFractionDigits: 2 })}`]),
    theme: "striped",
    headStyles: { fillColor: [41, 100, 240], fontSize: 10 },
    bodyStyles: { fontSize: 10 },
    margin: { left: 14, right: 14 },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 12;

  // Top products
  if (summary.topProducts.length > 0) {
    doc.setFontSize(12);
    doc.text("Productos Más Vendidos", 14, y);
    y += 4;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (doc as any).autoTable({
      startY: y,
      head: [["Producto", "Unidades", "Ingresos"]],
      body: summary.topProducts.map((p) => [
        p.name,
        p.sold.toString(),
        `$${p.revenue.toLocaleString("es-VE", { minimumFractionDigits: 2 })}`,
      ]),
      theme: "striped",
      headStyles: { fillColor: [41, 100, 240], fontSize: 10 },
      bodyStyles: { fontSize: 10 },
      margin: { left: 14, right: 14 },
    });
  }

  doc.save(`${APP_NAME}_Reporte_Ventas_${new Date().toISOString().slice(0, 10)}.pdf`);
}

async function generateProductsReport(products: ReportProduct[]) {
  const JsPDF = await loadJsPDF();
  const doc = new JsPDF();
  let y = addHeader(doc, "Reporte de Productos");

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Total: ${products.length} productos`, 14, y);
  y += 6;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (doc as any).autoTable({
    startY: y,
    head: [["Producto", "Categoría", "Precio", "Stock", "Estado"]],
    body: products.map((p) => [
      p.name.length > 35 ? p.name.slice(0, 33) + "..." : p.name,
      p.category,
      fmtPrice(p.price),
      p.stock.toString(),
      p.is_active ? "Activo" : "Inactivo",
    ]),
    theme: "striped",
    headStyles: { fillColor: [41, 100, 240], fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 55 },
      1: { cellWidth: 35 },
      2: { cellWidth: 25, halign: "right" },
      3: { cellWidth: 20, halign: "center" },
      4: { cellWidth: 22, halign: "center" },
    },
    margin: { left: 14, right: 14 },
  });

  doc.save(`${APP_NAME}_Reporte_Productos_${new Date().toISOString().slice(0, 10)}.pdf`);
}

async function generateOrdersReport(orders: ReportOrder[]) {
  const JsPDF = await loadJsPDF();
  const doc = new JsPDF("landscape");
  let y = addHeader(doc, "Reporte de Pedidos");

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Total: ${orders.length} pedidos`, 14, y);
  y += 6;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (doc as any).autoTable({
    startY: y,
    head: [["ID", "Fecha", "Cliente", "Método", "Estado", "Total"]],
    body: orders.map((o) => [
      o.id.slice(0, 8) + "...",
      fmtDate(o.created_at),
      o.customer,
      o.payment_method,
      STATUS_LABELS[o.status] || o.status,
      fmtPrice(o.total),
    ]),
    theme: "striped",
    headStyles: { fillColor: [41, 100, 240], fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    margin: { left: 14, right: 14 },
  });

  doc.save(`${APP_NAME}_Reporte_Pedidos_${new Date().toISOString().slice(0, 10)}.pdf`);
}

/* ── Componente ───────────────────────────────────────────────────── */

export function ReportButtons({
  products,
  orders,
  salesSummary,
}: ReportButtonsProps) {
  const [generating, setGenerating] = useState<string | null>(null);

  const handleGenerate = useCallback(
    async (type: "sales" | "products" | "orders") => {
      setGenerating(type);
      try {
        switch (type) {
          case "sales":
            await generateSalesReport(salesSummary);
            break;
          case "products":
            await generateProductsReport(products);
            break;
          case "orders":
            await generateOrdersReport(orders);
            break;
        }
      } catch (err) {
        console.error("Error generating report:", err);
      } finally {
        setGenerating(null);
      }
    },
    [salesSummary, products, orders]
  );

  const reports = [
    {
      key: "sales" as const,
      label: "Reporte de Ventas",
      description: "Ingresos, resumen mensual y top productos",
      icon: FileText,
    },
    {
      key: "products" as const,
      label: "Reporte de Productos",
      description: "Catálogo completo con precios y stock",
      icon: FileText,
    },
    {
      key: "orders" as const,
      label: "Reporte de Pedidos",
      description: "Historial completo de pedidos",
      icon: FileText,
    },
  ];

  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Generar Reportes
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {reports.map((report) => {
          const Icon = report.icon;
          const isLoading = generating === report.key;
          return (
            <button
              key={report.key}
              onClick={() => handleGenerate(report.key)}
              disabled={generating !== null}
              aria-busy={isLoading}
              aria-label={`Descargar ${report.label} en PDF`}
              className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 text-left transition-all hover:shadow-md hover:border-primary/30 focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {isLoading ? (
                  <Loader2
                    className="h-5 w-5 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <Icon className="h-5 w-5" aria-hidden="true" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                  {report.label}
                  <Download className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {isLoading ? "Generando..." : report.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
      {generating && (
        <p className="mt-2 text-xs text-gray-500" role="status">
          Generando reporte, por favor espera...
        </p>
      )}
    </section>
  );
}
