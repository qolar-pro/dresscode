import { supabaseAdmin } from './supabase';

/**
 * Upload an image file to Supabase Storage
 * Returns the public URL of the uploaded image
 */
export async function uploadImage(
  file: File,
  bucketName: string = 'product-images'
): Promise<string> {
  // Sanitize filename to prevent collisions and illegal characters
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const fileName = `${timestamp}-${sanitizedName}`;

  const { data, error } = await supabaseAdmin.storage
    .from(bucketName)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw error;
  }

  // Get public URL
  const { data: publicUrlData } = supabaseAdmin.storage
    .from(bucketName)
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}

/**
 * Delete an image from Supabase Storage
 */
export async function deleteImage(
  fileName: string,
  bucketName: string = 'product-images'
): Promise<void> {
  const { error } = await supabaseAdmin.storage
    .from(bucketName)
    .remove([fileName]);

  if (error) {
    throw error;
  }
}
