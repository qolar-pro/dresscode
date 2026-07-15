import { MetadataRoute } from 'next';
import { supabaseAdmin } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch products for dynamic URLs
  let productUrls: MetadataRoute.Sitemap = [];
  try {
    const { data: products } = await supabaseAdmin
      .from('products')
      .select('id, created_at')
      .order('created_at', { ascending: false });

    if (products) {
      productUrls = products.map((product: { id: number; created_at: string }) => ({
        url: `https://sneakerair.com/product/${product.id}`,
        lastModified: new Date(product.created_at),
        changeFrequency: 'weekly',
        priority: 0.7,
      }));
    }
  } catch (error) {
    console.warn('Failed to fetch products for sitemap:', error);
  }

  return [
    {
      url: 'https://sneakerair.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://sneakerair.com/shop',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: 'https://sneakerair.com/contact',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: 'https://sneakerair.com/legal/privacy-policy',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: 'https://sneakerair.com/legal/terms-of-service',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: 'https://sneakerair.com/legal/return-policy',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    ...productUrls,
  ];
}
