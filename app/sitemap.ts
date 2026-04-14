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
      productUrls = products.map((product) => ({
        url: `https://blancographics.xyz/product/${product.id}`,
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
      url: 'https://blancographics.xyz',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://blancographics.xyz/shop',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: 'https://blancographics.xyz/contact',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: 'https://blancographics.xyz/legal/privacy-policy',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: 'https://blancographics.xyz/legal/terms-of-service',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: 'https://blancographics.xyz/legal/return-policy',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    ...productUrls,
  ];
}
