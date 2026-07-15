import fs from 'fs';
import path from 'path';
import { isSupabaseConfigured, supabaseAdmin } from './supabase';

const LOCAL_UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

/**
 * Upload an image file.
 *
 * When Supabase Storage is configured it uploads to the bucket and returns the
 * public URL. Otherwise (local dev) it writes the file to `public/uploads/` and
 * returns a same-origin `/uploads/<name>` URL, so the admin image picker works
 * locally without a storage backend.
 */
export async function uploadImage(
  file: File,
  bucketName: string = 'product_images'
): Promise<string> {
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const fileName = `${timestamp}-${sanitizedName}`;

  if (!isSupabaseConfigured()) {
    if (!fs.existsSync(LOCAL_UPLOAD_DIR)) {
      fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(path.join(LOCAL_UPLOAD_DIR, fileName), buffer);
    return `/uploads/${fileName}`;
  }

  const { data, error } = await supabaseAdmin.storage
    .from(bucketName)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data: publicUrlData } = supabaseAdmin.storage
    .from(bucketName)
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}

/**
 * Delete an image.
 */
export async function deleteImage(
  fileName: string,
  bucketName: string = 'product_images'
): Promise<void> {
  if (!isSupabaseConfigured()) {
    const local = path.join(LOCAL_UPLOAD_DIR, fileName);
    try {
      if (fs.existsSync(local)) fs.unlinkSync(local);
    } catch {
      // best-effort
    }
    return;
  }

  const { error } = await supabaseAdmin.storage
    .from(bucketName)
    .remove([fileName]);

  if (error) {
    throw error;
  }
}
