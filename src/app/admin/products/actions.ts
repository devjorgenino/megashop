"use server";

/**
 * Server Actions para gestión de productos (admin).
 * Todas las acciones verifican que el usuario sea admin.
 */
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { ROUTES, PRODUCT_IMAGE_BUCKET } from "@/lib/constants";

export type ProductActionResult = {
  error?: string;
  success?: boolean;
};

/**
 * Crear un nuevo producto.
 */
export async function createProduct(
  _prevState: ProductActionResult,
  formData: FormData
): Promise<ProductActionResult> {
  await requireAdmin();
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const priceStr = formData.get("price") as string;
  const compareAtPriceStr = formData.get("compareAtPrice") as string;
  const stockStr = formData.get("stock") as string;
  const categoryId = formData.get("categoryId") as string;
  const isActive = formData.get("isActive") === "true";
  const existingImages = formData.get("existingImages") as string;

  // Validaciones
  if (!name || !priceStr) {
    return { error: "El nombre y el precio son obligatorios" };
  }

  const price = Math.round(parseFloat(priceStr) * 100); // Dólares → centavos
  if (isNaN(price) || price < 0) {
    return { error: "Precio inválido" };
  }

  const compareAtPrice = compareAtPriceStr
    ? Math.round(parseFloat(compareAtPriceStr) * 100)
    : null;

  const stock = parseInt(stockStr) || 0;
  const slug = slugify(name);

  // Parsear imágenes existentes (URLs)
  let images: string[] = [];
  if (existingImages) {
    try {
      images = JSON.parse(existingImages);
    } catch {
      images = [];
    }
  }

  // Subir nuevas imágenes
  const newImageFiles = formData.getAll("newImages") as File[];
  for (const file of newImageFiles) {
    if (!file || file.size === 0) continue;
    const ext = file.name.split(".").pop();
    const fileName = `${slug}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: uploadData, error: uploadError } = await (supabase as any).storage
      .from(PRODUCT_IMAGE_BUCKET)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      return { error: `Error al subir imagen: ${uploadError.message}` };
    }

    // Obtener URL pública
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: urlData } = (supabase as any).storage
      .from(PRODUCT_IMAGE_BUCKET)
      .getPublicUrl(uploadData.path);

    images.push(urlData.publicUrl);
  }

  // Insertar producto
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("products").insert({
    name,
    slug,
    description: description || null,
    price,
    compare_at_price: compareAtPrice,
    stock,
    category_id: categoryId || null,
    is_active: isActive,
    images,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Ya existe un producto con este nombre" };
    }
    return { error: error.message };
  }

  revalidatePath(ROUTES.adminProducts);
  revalidatePath(ROUTES.products);
  redirect(ROUTES.adminProducts);
}

/**
 * Actualizar un producto existente.
 */
export async function updateProduct(
  _prevState: ProductActionResult,
  formData: FormData
): Promise<ProductActionResult> {
  await requireAdmin();
  const supabase = await createClient();

  const productId = formData.get("productId") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const priceStr = formData.get("price") as string;
  const compareAtPriceStr = formData.get("compareAtPrice") as string;
  const stockStr = formData.get("stock") as string;
  const categoryId = formData.get("categoryId") as string;
  const isActive = formData.get("isActive") === "true";
  const existingImages = formData.get("existingImages") as string;

  if (!productId || !name || !priceStr) {
    return { error: "ID del producto, nombre y precio son obligatorios" };
  }

  const price = Math.round(parseFloat(priceStr) * 100);
  if (isNaN(price) || price < 0) {
    return { error: "Precio inválido" };
  }

  const compareAtPrice = compareAtPriceStr
    ? Math.round(parseFloat(compareAtPriceStr) * 100)
    : null;

  const stock = parseInt(stockStr) || 0;
  const slug = slugify(name);

  let images: string[] = [];
  if (existingImages) {
    try {
      images = JSON.parse(existingImages);
    } catch {
      images = [];
    }
  }

  // Subir nuevas imágenes
  const newImageFiles = formData.getAll("newImages") as File[];
  for (const file of newImageFiles) {
    if (!file || file.size === 0) continue;
    const ext = file.name.split(".").pop();
    const fileName = `${slug}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: uploadData, error: uploadError } = await (supabase as any).storage
      .from(PRODUCT_IMAGE_BUCKET)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      return { error: `Error al subir imagen: ${uploadError.message}` };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: urlData } = (supabase as any).storage
      .from(PRODUCT_IMAGE_BUCKET)
      .getPublicUrl(uploadData.path);

    images.push(urlData.publicUrl);
  }

  // Actualizar producto
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("products")
    .update({
      name,
      slug,
      description: description || null,
      price,
      compare_at_price: compareAtPrice,
      stock,
      category_id: categoryId || null,
      is_active: isActive,
      images,
    })
    .eq("id", productId);

  if (error) {
    if (error.code === "23505") {
      return { error: "Ya existe un producto con este nombre" };
    }
    return { error: error.message };
  }

  revalidatePath(ROUTES.adminProducts);
  revalidatePath(ROUTES.products);
  revalidatePath(`/products/${slug}`);
  redirect(ROUTES.adminProducts);
}

/**
 * Eliminar un producto.
 */
export async function deleteProduct(productId: string): Promise<ProductActionResult> {
  await requireAdmin();
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("products")
    .delete()
    .eq("id", productId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(ROUTES.adminProducts);
  revalidatePath(ROUTES.products);
  return { success: true };
}

/**
 * Alternar el estado activo/inactivo de un producto.
 */
export async function toggleProductActive(
  productId: string,
  isActive: boolean
): Promise<ProductActionResult> {
  await requireAdmin();
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("products")
    .update({ is_active: isActive })
    .eq("id", productId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(ROUTES.adminProducts);
  revalidatePath(ROUTES.products);
  return { success: true };
}
