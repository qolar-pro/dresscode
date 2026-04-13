import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Admin pages use meta robots tags instead of disallow (defense in depth)
    },
    sitemap: 'https://blancographics.xyz/sitemap.xml',
  };
}
