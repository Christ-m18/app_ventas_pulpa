"use client";

import { useActionState, useState, useRef } from "react";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { isVideoSource } from "@/features/products/utils/productImage";
import type { AdminProductRow } from "../services/types";

type FormState = { ok?: boolean; error?: string } | undefined;

export function ProductForm({
  product,
  categories,
  action,
}: {
  product?: AdminProductRow;
  categories: Array<{ id: string; name: string }>;
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? "");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("El archivo excede 10 MB");
      return;
    }

    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload-product-image", { method: "POST", body });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Error al subir imagen");
        return;
      }
      setImageUrl(json.url);
      toast.success("Imagen subida correctamente");
    } catch {
      toast.error("No se pudo subir la imagen");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const isVideo = isVideoSource(imageUrl);

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p className="rounded-xl bg-brand-lime/15 px-4 py-3 text-sm font-semibold text-emerald-700">
          Guardado correctamente.
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            name="name"
            defaultValue={product?.name ?? ""}
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={product?.description ?? ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Precio (RD$)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            defaultValue={product?.price ?? ""}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="stock">Stock</Label>
          <Input
            id="stock"
            name="stock"
            type="number"
            inputMode="numeric"
            min="0"
            defaultValue={product?.stock ?? 0}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit">Unidad</Label>
          <select
            id="unit"
            name="unit"
            defaultValue={product?.unit ?? "lb"}
            className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="lb">Libra (lb)</option>
            <option value="kg">Kilogramo (kg)</option>
            <option value="paquete">Paquete</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category_id">Categoría</Label>
          <select
            id="category_id"
            name="category_id"
            defaultValue={product?.category_id ?? ""}
            className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">Sin categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Image upload section */}
        <div className="space-y-3 md:col-span-2">
          <Label>Imagen / Video del producto</Label>

          {/* Hidden input to send the URL with the form */}
          <input type="hidden" name="image_url" value={imageUrl} />

          {/* Preview */}
          {imageUrl ? (
            <div className="relative w-full max-w-xs">
              <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
                {isVideo ? (
                  <video
                    src={imageUrl}
                    className="h-48 w-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                ) : (
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="h-48 w-full object-cover"
                  />
                )}
              </div>
              <button
                type="button"
                onClick={() => setImageUrl("")}
                className="absolute -right-2 -top-2 rounded-full bg-destructive p-1.5 text-white shadow-md hover:bg-destructive/80"
                title="Eliminar imagen"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex h-32 w-full max-w-xs items-center justify-center rounded-xl border-2 border-dashed border-foreground/15 bg-muted/30">
              <div className="text-center text-muted-foreground">
                <ImagePlus className="mx-auto h-8 w-8 mb-1 opacity-40" />
                <p className="text-xs">Sin imagen</p>
              </div>
            </div>
          )}

          {/* Upload button */}
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" aria-hidden />
                  {imageUrl ? "Cambiar imagen" : "Subir imagen"}
                </>
              )}
            </Button>
            <span className="text-[10px] text-muted-foreground">
              JPG, PNG, WebP, MP4 — máx 10 MB
            </span>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="benefits">Beneficios (uno por línea)</Label>
          <Textarea
            id="benefits"
            name="benefits"
            rows={3}
            defaultValue={product?.benefits?.join("\n") ?? ""}
            placeholder="Rico en vitamina C&#10;Sin azúcar añadida"
          />
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="is_combo"
              defaultChecked={product?.is_combo ?? false}
              className="h-4 w-4 rounded border-input accent-brand-orange"
            />
            Es combo
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="is_featured"
              defaultChecked={product?.is_featured ?? false}
              className="h-4 w-4 rounded border-input accent-brand-orange"
            />
            Destacado
          </label>
        </div>
      </div>

      <Button
        type="submit"
        disabled={pending}
        className="bg-brand-orange text-white shadow-lg shadow-brand-orange/30 hover:bg-brand-orange/90"
      >
        {pending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
            Guardando...
          </>
        ) : product ? (
          "Guardar cambios"
        ) : (
          "Crear producto"
        )}
      </Button>
    </form>
  );
}
