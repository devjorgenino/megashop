-- ============================================
-- SCHEMA DE BASE DE DATOS PARA SHOPNEXT
-- Ejecutar en Supabase SQL Editor en este orden.
-- ============================================

-- 1. PROFILES (extensión de auth.users con rol)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  role text not null default 'customer' check (role in ('admin', 'customer')),
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Crear perfil automáticamente cuando un usuario se registra
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper: verificar si el usuario actual es admin.
-- SECURITY DEFINER evita la recursión RLS al leer profiles desde policies.
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- RLS para profiles
alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Admins pueden ver todos los perfiles
create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin());

-- 2. CATEGORIES
create table public.categories (
  id uuid not null default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

-- Catálogo público: todos pueden leer
create policy "Categories are viewable by everyone"
  on public.categories for select
  using (true);

-- Solo admins pueden modificar categorías
create policy "Admins can manage categories"
  on public.categories for all
  using (public.is_admin());

-- 3. PRODUCTS
create table public.products (
  id uuid not null default gen_random_uuid() primary key,
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  price integer not null check (price >= 0),           -- centavos USD
  compare_at_price integer check (compare_at_price >= 0),
  stock integer not null default 0 check (stock >= 0),
  images text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Índices para búsqueda y filtros
create index idx_products_category on public.products(category_id);
create index idx_products_slug on public.products(slug);
create index idx_products_active on public.products(is_active);
create index idx_products_price on public.products(price);

alter table public.products enable row level security;

-- Productos activos son públicos
create policy "Active products are viewable by everyone"
  on public.products for select
  using (is_active = true);

-- Admins ven todos los productos (incluidos inactivos)
create policy "Admins can view all products"
  on public.products for select
  using (public.is_admin());

-- Admins pueden crear/editar/eliminar productos
create policy "Admins can manage products"
  on public.products for all
  using (public.is_admin());

-- 4. CART_ITEMS (para carrito sincronizado)
create table public.cart_items (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0 and quantity <= 10),
  created_at timestamptz not null default now(),
  -- Un usuario no puede tener el mismo producto dos veces
  unique(user_id, product_id)
);

alter table public.cart_items enable row level security;

-- Cada usuario solo ve y gestiona su propio carrito
create policy "Users can manage their own cart"
  on public.cart_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 5. ORDERS
create table public.orders (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
  total integer not null check (total >= 0),            -- centavos USD
  stripe_session_id text,
  stripe_payment_intent_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_orders_user on public.orders(user_id);
create index idx_orders_status on public.orders(status);
create index idx_orders_stripe_session on public.orders(stripe_session_id);

alter table public.orders enable row level security;

-- Usuarios ven solo sus propias órdenes
create policy "Users can view their own orders"
  on public.orders for select
  using (auth.uid() = user_id);

-- Admins ven todas las órdenes
create policy "Admins can view all orders"
  on public.orders for select
  using (public.is_admin());

-- Solo el servidor (service role) puede crear/actualizar órdenes
-- Los clientes no crean órdenes directamente, lo hace el API route
create policy "Service role can manage orders"
  on public.orders for all
  using (true)
  with check (true);

-- 6. ORDER_ITEMS
create table public.order_items (
  id uuid not null default gen_random_uuid() primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price integer not null check (unit_price >= 0),  -- centavos USD
  created_at timestamptz not null default now()
);

create index idx_order_items_order on public.order_items(order_id);

alter table public.order_items enable row level security;

-- Usuarios ven items de sus propias órdenes
create policy "Users can view their own order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );

-- Admins ven todos los order items
create policy "Admins can view all order items"
  on public.order_items for select
  using (public.is_admin());

-- Service role puede gestionar order items
create policy "Service role can manage order items"
  on public.order_items for all
  using (true)
  with check (true);

-- ============================================
-- FUNCIÓN: Actualizar updated_at automáticamente
-- ============================================
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

create trigger update_products_updated_at
  before update on public.products
  for each row execute function public.update_updated_at();

create trigger update_orders_updated_at
  before update on public.orders
  for each row execute function public.update_updated_at();

-- ============================================
-- STORAGE: Bucket para imágenes de productos
-- ============================================
-- Ejecutar estos en el SQL Editor de Supabase:

insert into storage.buckets (id, name, public)
  values ('product-images', 'product-images', true);

-- Cualquiera puede ver las imágenes
create policy "Product images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- Solo admins pueden subir/eliminar imágenes
create policy "Admins can upload product images"
  on storage.objects for insert
  with check (
    bucket_id = 'product-images'
    and public.is_admin()
  );

create policy "Admins can delete product images"
  on storage.objects for delete
  using (
    bucket_id = 'product-images'
    and public.is_admin()
  );
