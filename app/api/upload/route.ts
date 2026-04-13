import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/lib/image-upload';
import { requireAdmin } from '@/lib/auth-middleware';

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth) return auth;

  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Check file type (MIME type)
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Check file extension
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      return NextResponse.json(
        { error: `Invalid file extension. Allowed: ${allowedExtensions.join(', ')}` },
        { status: 400 }
      );
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
    }

    // Check file magic bytes (verify it's actually an image)
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer.slice(0, 12));

    const isValidImage =
      // PNG
      (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) ||
      // JPEG
      (bytes[0] === 0xFF && bytes[1] === 0xD8) ||
      // GIF
      (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) ||
      // WebP
      (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46);

    if (!isValidImage) {
      return NextResponse.json({ error: 'File is not a valid image' }, { status: 400 });
    }

    const publicUrl = await uploadImage(file);
    return NextResponse.json({ url: publicUrl });
  } catch (error: any) {
    console.error('Image upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
