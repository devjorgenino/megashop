/**
 * Data fetching functions for products and categories.
 * Used ONLY in Server Components and Route Handlers.
 * All queries respect RLS automatically.
 */
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "@/lib/constants";
import type {
  Product,
  Category,
  ProductWithCategory,
  ProductFilters,
  PaginatedResponse,
} from "@/types";

/**
 * Fetches products with filters, search, sorting, and pagination.
 * Filters come from URL searchParams (SEO-friendly).
 */
export async function getProducts(
  filters: ProductFilters = {}
): Promise<PaginatedResponse<ProductWithCategory>> {
  const supabase = await createClient();

  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(
    Math.max(1, filters.pageSize ?? DEFAULT_PAGE_SIZE),
    MAX_PAGE_SIZE
  );
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Base query: active products with category
  let query = supabase
    .from("products")
    .select("*, categories(*)", { count: "exact" })
    .eq("is_active", true);

  // Filter by category (slug)
  if (filters.category) {
    // First look up the category by slug
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", filters.category)
      .single();

    if (cat) {
      query = query.eq("category_id", (cat as { id: string }).id);
    } else {
      // Category not found — return empty result
      return { data: [], count: 0, page, pageSize, totalPages: 0 };
    }
  }

  // Filter by search (name or description)
  if (filters.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
    );
  }

  // Filter by price range (in cents)
  if (filters.minPrice !== undefined) {
    query = query.gte("price", filters.minPrice);
  }
  if (filters.maxPrice !== undefined) {
    query = query.lte("price", filters.maxPrice);
  }

  // Sorting
  switch (filters.sortBy) {
    case "price_asc":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    case "name":
      query = query.order("name", { ascending: true });
      break;
    case "newest":
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  // Pagination
  query = query.range(from, to);

  const { data, count, error } = await query;

  if (error) {
    console.error("Error fetching products:", error);
    return { data: [], count: 0, page, pageSize, totalPages: 0 };
  }

  const totalCount = count ?? 0;

  return {
    data: (data as unknown as ProductWithCategory[]) ?? [],
    count: totalCount,
    page,
    pageSize,
    totalPages: Math.ceil(totalCount / pageSize),
  };
}

/**
 * Fetches a product by slug (for the product detail page).
 */
export async function getProductBySlug(
  slug: string
): Promise<ProductWithCategory | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*, categories(*)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !data) return null;

  return data as unknown as ProductWithCategory;
}

/**
 * Fetches related products (same category, excluding the current one).
 */
export async function getRelatedProducts(
  productId: string,
  categoryId: string | null,
  limit = 4
): Promise<Product[]> {
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .neq("id", productId)
    .limit(limit);

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  query = query.order("created_at", { ascending: false });

  const { data } = await query;

  return (data as unknown as Product[]) ?? [];
}

/**
 * Fetches featured products for the home page.
 */
export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data as unknown as Product[]) ?? [];
}

/**
 * Fetches all categories (for filters and navigation).
 */
export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  return (data as unknown as Category[]) ?? [];
}

/**
 * Fetches a category by slug.
 */
export async function getCategoryBySlug(
  slug: string
): Promise<Category | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!data) return null;

  return data as unknown as Category;
}
