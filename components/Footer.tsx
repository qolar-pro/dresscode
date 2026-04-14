'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin, X, Ruler } from 'lucide-react';

export default function Footer() {
  const { t } = useLanguage();
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  return (
    <>
    <footer className="relative bg-charcoal-900 dark:bg-charcoal-950 text-pearl-50 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1920&q=80"
          alt=""
          className="w-full h-full object-cover opacity-10"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal-900/95 to-charcoal-950/98" />
      </div>
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-16">
          {/* Brand */}
          <div>
            <h3 className="font-display text-3xl tracking-tight mb-6">DRESS CODE</h3>
            <p className="text-neutral-400 leading-relaxed mb-8 font-light">
              Your destination for modern, sophisticated women's fashion. 
              Curated styles that define your presence.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 border border-neutral-700 hover:border-pearl-50 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-pearl-50 hover:text-charcoal-900">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 border border-neutral-700 hover:border-pearl-50 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-pearl-50 hover:text-charcoal-900">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 border border-neutral-700 hover:border-pearl-50 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-pearl-50 hover:text-charcoal-900">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs tracking-[0.3em] uppercase font-medium mb-8 text-neutral-400">{t('footer.shop')}</h4>
            <ul className="space-y-4">
              <li>
                <Link href="/shop" className="text-neutral-400 hover:text-pearl-50 transition-colors font-light">
                  {t('footer.allProducts')}
                </Link>
              </li>
              <li>
                <Link href="/shop?category=dresses" className="text-neutral-400 hover:text-pearl-50 transition-colors font-light">
                  {t('home.dresses')}
                </Link>
              </li>
              <li>
                <Link href="/shop?category=tops" className="text-neutral-400 hover:text-pearl-50 transition-colors font-light">
                  {t('home.tops')}
                </Link>
              </li>
              <li>
                <Link href="/shop?category=accessories" className="text-neutral-400 hover:text-pearl-50 transition-colors font-light">
                  {t('home.accessories')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-xs tracking-[0.3em] uppercase font-medium mb-8 text-neutral-400">{t('footer.support')}</h4>
            <ul className="space-y-4">
              <li>
                <Link href="/contact" className="text-neutral-400 hover:text-pearl-50 transition-colors font-light">
                  {t('footer.contactUs')}
                </Link>
              </li>
              <li>
                <button
                  onClick={() => setShowSizeGuide(true)}
                  className="text-neutral-400 hover:text-pearl-50 transition-colors font-light"
                >
                  {t('footer.sizeGuide')}
                </button>
              </li>
              <li>
                <Link href="/contact#shipping" className="text-neutral-400 hover:text-pearl-50 transition-colors font-light">
                  {t('footer.shippingInfo')}
                </Link>
              </li>
              <li>
                <Link href="/legal/return-policy" className="text-neutral-400 hover:text-pearl-50 transition-colors font-light">
                  {t('footer.returns')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-xs tracking-[0.3em] uppercase font-medium mb-8 text-neutral-400">{t('footer.visitUs')}</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-1" />
                <address className="text-neutral-400 not-italic font-light">
                  {t('footer.address')}
                </address>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                <a href="tel:+15551234567" className="text-neutral-400 hover:text-pearl-50 transition-colors font-light">
                  {t('footer.phone')}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                <a href="mailto:hello@dresscode.com" className="text-neutral-400 hover:text-pearl-50 transition-colors font-light">
                  {t('footer.email')}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-neutral-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-neutral-500 text-sm font-light">
              {t('footer.rights')}
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <Link href="/legal/privacy-policy" className="text-neutral-500 hover:text-pearl-50 text-sm font-light transition-colors">
                Privacy Policy
              </Link>
              <Link href="/legal/terms-of-service" className="text-neutral-500 hover:text-pearl-50 text-sm font-light transition-colors">
                Terms of Service
              </Link>
              <Link href="/legal/return-policy" className="text-neutral-500 hover:text-pearl-50 text-sm font-light transition-colors">
                Return Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>

    {showSizeGuide && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-charcoal-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="sticky top-0 bg-white dark:bg-charcoal-900 border-b border-neutral-200 dark:border-charcoal-800 p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Ruler className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
              <h3 className="font-display text-xl text-charcoal-900 dark:text-pearl-50">Size Guide</h3>
            </div>
            <button
              onClick={() => setShowSizeGuide(false)}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-charcoal-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-8 space-y-8">
            <div>
              <h4 className="font-display text-lg text-charcoal-900 dark:text-pearl-50 mb-4">Women{"'"}s Clothing (US)</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-300 dark:border-charcoal-700">
                      <th className="py-3 px-4 text-left font-medium text-neutral-600 dark:text-neutral-400">Size</th>
                      <th className="py-3 px-4 text-left font-medium text-neutral-600 dark:text-neutral-400">Bust (in)</th>
                      <th className="py-3 px-4 text-left font-medium text-neutral-600 dark:text-neutral-400">Waist (in)</th>
                      <th className="py-3 px-4 text-left font-medium text-neutral-600 dark:text-neutral-400">Hip (in)</th>
                    </tr>
                  </thead>
                  <tbody className="text-neutral-700 dark:text-neutral-300">
                    <tr className="border-b border-neutral-200 dark:border-charcoal-800">
                      <td className="py-3 px-4 font-medium">XS</td>
                      <td className="py-3 px-4">31-32</td>
                      <td className="py-3 px-4">24-25</td>
                      <td className="py-3 px-4">34-35</td>
                    </tr>
                    <tr className="border-b border-neutral-200 dark:border-charcoal-800">
                      <td className="py-3 px-4 font-medium">S</td>
                      <td className="py-3 px-4">33-34</td>
                      <td className="py-3 px-4">26-27</td>
                      <td className="py-3 px-4">36-37</td>
                    </tr>
                    <tr className="border-b border-neutral-200 dark:border-charcoal-800">
                      <td className="py-3 px-4 font-medium">M</td>
                      <td className="py-3 px-4">35-36</td>
                      <td className="py-3 px-4">28-29</td>
                      <td className="py-3 px-4">38-39</td>
                    </tr>
                    <tr className="border-b border-neutral-200 dark:border-charcoal-800">
                      <td className="py-3 px-4 font-medium">L</td>
                      <td className="py-3 px-4">37-39</td>
                      <td className="py-3 px-4">30-32</td>
                      <td className="py-3 px-4">40-42</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">XL</td>
                      <td className="py-3 px-4">40-42</td>
                      <td className="py-3 px-4">33-35</td>
                      <td className="py-3 px-4">43-45</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-neutral-50 dark:bg-charcoal-800 p-6 rounded-xl">
              <h4 className="font-medium text-charcoal-900 dark:text-pearl-50 mb-3">How to Measure</h4>
              <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400 font-light">
                <li>{"\u2022"} <strong>Bust:</strong> Measure around the fullest part of your chest</li>
                <li>{"\u2022"} <strong>Waist:</strong> Measure around the narrowest part of your waist</li>
                <li>{"\u2022"} <strong>Hip:</strong> Measure around the fullest part of your hips</li>
              </ul>
            </div>

            <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center">
              If you{"'"}re between sizes, we recommend sizing up for a more comfortable fit.
            </p>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
