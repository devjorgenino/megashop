# MegaShop

Plataforma e-commerce fullstack construida con **Next.js 16**, **React 19**, **Supabase** y **Stripe**. Diseñada para el mercado venezolano con soporte de precios duales (USD / Bolívares) y métodos de pago locales.

![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=nextdotjs)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-Auth_%2B_DB-3FCF8E?logo=supabase)
![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?logo=stripe)
![WCAG](https://img.shields.io/badge/WCAG_2.1-AA-green)

---

## Características

### Tienda

- Catálogo de productos con filtros por categoría, búsqueda, precio y ordenamiento
- Paginación server-side
- Carrito de compras persistente (Zustand + sincronización con Supabase)
- Precios duales: **USD** y **Bolívares (VES)** con tasa configurable
- Diseño responsive inspirado en el tema Orchid Store
- Autenticación con Supabase Auth (email + OAuth)

### Pagos

- **Stripe Checkout** para pagos internacionales
- **Pago Móvil** — transferencia bancaria instantánea (Venezuela)
- **Zelle** — transferencia en USD
- **Binance Pay** — pago con criptomonedas
- **Transferencia Bancaria** — transferencia nacional en bolívares
- Flujo manual: el cliente selecciona método, ve datos de cuenta, ingresa referencia, el admin verifica

### Panel de Administración

- Dashboard con estadísticas en tiempo real (productos, pedidos, ingresos, clientes)
- Gráficas interactivas con Recharts:
  - Ingresos mensuales (barras)
  - Pedidos por estado (pastel)
  - Productos más vendidos (barras horizontales)
- Generación de reportes PDF (jsPDF):
  - Reporte de ventas
  - Reporte de productos
  - Reporte de pedidos
- CRUD completo de productos con imágenes (Supabase Storage)
- Gestión de pedidos con actualización de estado
- Protección por rol de administrador

### Accesibilidad (WCAG 2.1 AA)

- Skip-to-content link
- Navegación por teclado completa con focus traps en modales
- `aria-label`, `aria-expanded`, `aria-haspopup`, `role="menu"` en todos los componentes interactivos
- `prefers-reduced-motion` respetado en todas las animaciones
- Contraste de colores AAA en texto principal
- Tablas de datos `sr-only` como alternativa a las gráficas
- `aria-live` regions para anuncios dinámicos

---

## Tech Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, Tailwind CSS v4, Lucide Icons |
| Fuente | Poppins (Google Fonts via `next/font`) |
| Base de datos | Supabase (PostgreSQL + RLS) |
| Autenticación | Supabase Auth |
| Almacenamiento | Supabase Storage |
| Pagos | Stripe + métodos manuales venezolanos |
| Estado | Zustand |
| Gráficas | Recharts |
| Reportes | jsPDF + jspdf-autotable |
| Lenguaje | TypeScript 5 |

---

## Inicio Rápido

### Prerrequisitos

- Node.js 18+
- Cuenta de [Supabase](https://supabase.com)
- Cuenta de [Stripe](https://stripe.com) (opcional, para pagos internacionales)

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/ecommerce.git
cd ecommerce

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
```

### Variables de Entorno

Crear un archivo `.env.local` con las siguientes variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Base de Datos

Ejecutar los scripts SQL en tu proyecto de Supabase:

```bash
# 1. Crear tablas, funciones, políticas RLS y triggers
# Ejecutar el contenido de supabase/schema.sql en el SQL Editor de Supabase

# 2. (Opcional) Poblar con datos de ejemplo
# Ejecutar el contenido de supabase/seed.sql
```

### Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# En otra terminal (opcional, para webhooks de Stripe)
npm run stripe:listen
```

Abrir [http://localhost:3000](http://localhost:3000).

### Build de Producción

```bash
npm run build
npm start
```

---

## Estructura del Proyecto

```
src/
├── app/
│   ├── (store)/              # Rutas públicas de la tienda
│   │   ├── (auth)/           # Login y registro
│   │   ├── account/          # Cuenta del usuario y pedidos
│   │   ├── cart/             # Carrito de compras
│   │   ├── checkout/         # Proceso de pago (Stripe + manual)
│   │   ├── products/         # Catálogo y detalle de producto
│   │   └── page.tsx          # Homepage
│   ├── admin/                # Panel de administración
│   │   ├── orders/           # Gestión de pedidos
│   │   ├── products/         # CRUD de productos
│   │   ├── dashboard-charts  # Gráficas del dashboard
│   │   ├── report-buttons    # Generación de reportes PDF
│   │   └── page.tsx          # Dashboard principal
│   └── api/
│       ├── checkout/         # API de checkout (Stripe + manual)
│       └── webhooks/         # Webhooks de Stripe
├── components/
│   ├── cart/                 # Componentes del carrito
│   ├── layout/               # Header, Footer, Sidebar, UserNav
│   ├── products/             # ProductCard, Filters, Grid, Pagination
│   └── ui/                   # Button, Input, Toast (primitivos)
├── hooks/                    # useUser, useCartSync
├── lib/
│   ├── supabase/             # Cliente de Supabase (server, client, middleware)
│   ├── auth.ts               # Helpers de autenticación
│   ├── constants.ts          # Constantes globales y métodos de pago
│   ├── products.ts           # Queries de productos
│   └── utils.ts              # formatPrice, formatPriceVES, cn, etc.
├── stores/                   # Zustand (cart-store)
└── types/                    # TypeScript types (database, index)
```

---

## Configuración

### Tasa de Cambio USD/VES

Editar `src/lib/constants.ts`:

```typescript
export const VES_RATE = 78.31; // 1 USD = X Bolívares
```

### Métodos de Pago

Los datos de cuenta para cada método de pago se configuran en `src/lib/constants.ts` en el array `PAYMENT_METHODS`. Actualizar con los datos reales de tu negocio:

```typescript
export const PAYMENT_METHODS: PaymentMethodConfig[] = [
  {
    key: "pago_movil",
    label: "Pago Móvil",
    details: [
      { label: "Banco", value: "Tu Banco" },
      { label: "Teléfono", value: "04XX-000-0000" },
      { label: "Cédula", value: "V-00.000.000" },
    ],
    // ...
  },
  // ...
];
```

---

## Scripts Disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con Turbopack |
| `npm run build` | Build de producción |
| `npm start` | Servidor de producción |
| `npm run lint` | Linter con ESLint |
| `npm run stripe:listen` | Escuchar webhooks de Stripe en desarrollo |

---

## Licencia

Este proyecto es privado. Todos los derechos reservados.
