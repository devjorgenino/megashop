"use client";

/**
 * Formulario reutilizable para crear/editar un producto.
 * Se usa en /admin/products/new y /admin/products/[id]/edit.
 */
import { useActionState, useState } from "react";
import { createProduct, updateProduct, type ProductActionResult } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Upload, ImageIcon } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import type { Product, Category } from "@/types";

interface ProductFormProps {
  product?: Product;
  categories: Category[];
}

export function ProductForm({ product, categories }: ProductFormProps) {
  const isEditing = !!product;

  const action = isEditing ? updateProduct : createProduct;
  const [state, formAction, isPending] = useActionState<ProductActionResult, FormData>(
    action,
    {}
  );

  // Estado para imágenes existentes (ya guardadas)
  const [existingImages, setExistingImages] = useState<string[]>(
    product?.images ?? []
  );

  // Estado para previews de nuevas imágenes
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    // Crear previews
    const previews = files.map((file) => URL.createObjectURL(file));
    setNewImagePreviews((prev) => [...prev, ...previews]);
    setNewImageFiles((prev) => [...prev, ...files]);

    // Resetear input
    e.target.value = "";
  }

  function removeExistingImage(index: number) {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  }

  function removeNewImage(index: number) {
    // Revocar la URL del preview
    URL.revokeObjectURL(newImagePreviews[index]);
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
  }

  // Handler personalizado para incluir archivos de imagen
  function handleSubmit(formData: FormData) {
    // Adjuntar imágenes existentes como JSON
    formData.set("existingImages", JSON.stringify(existingImages));

    // Adjuntar nuevos archivos
    formData.delete("newImages");
    for (const file of newImageFiles) {
      formData.append("newImages", file);
    }

    formAction(formData);
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {/* ID del producto (oculto, solo modo edición) */}
      {isEditing && (
        <input type="hidden" name="productId" value={product.id} />
      )}

      {/* Error */}
      {state.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      {/* Nombre */}
      <Input
        id="name"
        name="name"
        label="Nombre del Producto *"
        placeholder="Ej: Audífonos Bluetooth Inalámbricos"
        defaultValue={product?.name ?? ""}
        required
      />

      {/* Descripción */}
      <div>
        <label
          htmlFor="description"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          placeholder="Descripción del producto..."
          defaultValue={product?.description ?? ""}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
        />
      </div>

      {/* Precio + Precio comparativo */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          id="price"
          name="price"
          type="number"
          step="0.01"
          min="0"
          label="Precio (USD) *"
          placeholder="79.99"
          defaultValue={
            product ? (product.price / 100).toFixed(2) : ""
          }
          required
        />
        <Input
          id="compareAtPrice"
          name="compareAtPrice"
          type="number"
          step="0.01"
          min="0"
          label="Precio Anterior (USD)"
          placeholder="99.99 (precio original para mostrar descuento)"
          defaultValue={
            product?.compare_at_price
              ? (product.compare_at_price / 100).toFixed(2)
              : ""
          }
        />
      </div>

      {/* Stock + Categoría */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          id="stock"
          name="stock"
          type="number"
          min="0"
          label="Stock"
          placeholder="50"
          defaultValue={product?.stock?.toString() ?? "0"}
        />
        <div>
          <label
            htmlFor="categoryId"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Categoría
          </label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={product?.category_id ?? ""}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
          >
            <option value="">Sin categoría</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Activo/Inactivo */}
      <div>
        <label
          htmlFor="isActive"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Estado
        </label>
        <select
          id="isActive"
          name="isActive"
          defaultValue={product?.is_active !== false ? "true" : "false"}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none sm:w-auto"
        >
          <option value="true">Activo (visible en la tienda)</option>
          <option value="false">Borrador (oculto de la tienda)</option>
        </select>
      </div>

      {/* Imágenes */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Imágenes
        </label>

        {/* Imágenes existentes */}
        {existingImages.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-3">
            {existingImages.map((url, i) => (
              <div
                key={i}
                className="group relative h-24 w-24 overflow-hidden rounded-lg border border-gray-200"
              >
                <img
                  src={url}
                  alt={`Imagen del producto ${i + 1}`}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeExistingImage(i)}
                  className="absolute top-1 right-1 rounded-full bg-red-500 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                >
                  <X className="h-3 w-3" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Previews de nuevas imágenes */}
        {newImagePreviews.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-3">
            {newImagePreviews.map((url, i) => (
              <div
                key={`new-${i}`}
                className="group relative h-24 w-24 overflow-hidden rounded-lg border-2 border-dashed border-blue-300"
              >
                <img
                  src={url}
                  alt={`Nueva imagen ${i + 1}`}
                  className="h-full w-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-blue-600/80 px-1 py-0.5 text-center text-[10px] text-white">
                  Nueva
                </div>
                <button
                  type="button"
                  onClick={() => removeNewImage(i)}
                  className="absolute top-1 right-1 rounded-full bg-red-500 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                >
                  <X className="h-3 w-3" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Botón de subida */}
        <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-4 text-sm text-gray-500 transition-colors hover:border-blue-400 hover:text-blue-600">
          <Upload className="h-5 w-5" aria-hidden="true" />
          <span>Haz clic para subir imágenes</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleImageSelect}
            className="hidden"
          />
        </label>
        <p className="mt-1 text-xs text-gray-400">
          JPEG, PNG o WebP. Máximo 5MB por imagen.
        </p>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-3 border-t border-gray-200 pt-6">
        <Button type="submit" isLoading={isPending}>
          {isEditing ? "Actualizar Producto" : "Crear Producto"}
        </Button>
        <Link
          href={ROUTES.adminProducts}
          className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
