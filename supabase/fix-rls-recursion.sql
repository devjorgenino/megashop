-- ============================================
-- MIGRATION: Fix RLS infinite recursion
-- Run this in Supabase SQL Editor AFTER schema.sql
-- ============================================
-- Problem: Admin policies on profiles table query profiles itself,
-- causing "infinite recursion detected in policy for relation profiles".
-- Fix: Create a SECURITY DEFINER function that bypasses RLS.
-- ============================================

-- 1. Create the helper function
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- 2. Drop old recursive policies
drop policy if exists "Admins can view all profiles" on public.profiles;
drop policy if exists "Admins can manage categories" on public.categories;
drop policy if exists "Admins can view all products" on public.products;
drop policy if exists "Admins can manage products" on public.products;
drop policy if exists "Admins can view all orders" on public.orders;
drop policy if exists "Admins can view all order items" on public.order_items;
drop policy if exists "Admins can upload product images" on storage.objects;
drop policy if exists "Admins can delete product images" on storage.objects;

-- 3. Recreate with is_admin() function
create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin());

create policy "Admins can manage categories"
  on public.categories for all
  using (public.is_admin());

create policy "Admins can view all products"
  on public.products for select
  using (public.is_admin());

create policy "Admins can manage products"
  on public.products for all
  using (public.is_admin());

create policy "Admins can view all orders"
  on public.orders for select
  using (public.is_admin());

create policy "Admins can view all order items"
  on public.order_items for select
  using (public.is_admin());

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
