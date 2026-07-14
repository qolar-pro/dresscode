// Maps the storefront catalog to 3D assets for the live sneaker viewer.
//
// Today every product renders the same high-quality CC0 base model
// (public/models/shoe.glb — Khronos "MaterialsVariantsShoe", royalty-free),
// differentiated by its three artist-made PBR material variants and a colour
// tint per colorway. To give a product its OWN silhouette later, drop a new
// .glb into public/models/ and point its id at it in MODEL_BY_PRODUCT.

export const BASE_MODEL = "/models/shoe.glb";

// The KHR_materials_variants baked into the base model, in order.
export const MODEL_VARIANTS = ["midnight", "beach", "street"] as const;
export type ModelVariant = (typeof MODEL_VARIANTS)[number];

// Per-product model override (falls back to BASE_MODEL). Add entries as real
// per-silhouette models are added to public/models/.
export const MODEL_BY_PRODUCT: Record<number, string> = {};

export function modelForProduct(productId: number): string {
  return MODEL_BY_PRODUCT[productId] ?? BASE_MODEL;
}

// Pick a built-in material variant for a given colorway index so each colorway
// swatch shows a visibly different, professionally-made look.
export function variantForColorwayIndex(index: number): ModelVariant {
  return MODEL_VARIANTS[index % MODEL_VARIANTS.length];
}
