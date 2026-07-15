'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin, X, Ruler, ArrowUpRight } from 'lucide-react';

const SIZE_ROWS = [
  ['38', '6', '5.5'],
  ['39', '6.5', '6'],
  ['40', '7', '6.5'],
  ['41', '8', '7'],
  ['42', '8.5', '7.5'],
  ['43', '9.5', '8.5'],
  ['44', '10', '9'],
  ['45', '11', '10'],
  ['46', '12', '11'],
];

export default function Footer() {
  const { t } = useLanguage();
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setSubscribed(true);
      setEmail('');
    } catch {
      setSubscribed(true);
    }
  };

  return (
    <>
      <footer className="relative overflow-hidden border-t border-fog/8 bg-carbon text-fog">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="aura-blob aura-blob-a left-[-5%] bottom-[-10%] h-[40vh] w-[40vh] opacity-30" />
          <div className="absolute inset-0 grid-overlay opacity-40" />
        </div>

        {/* giant wordmark */}
        <div className="relative mx-auto max-w-[1500px] px-6 pt-20 md:px-12">
          <div className="pointer-events-none select-none font-display text-[22vw] font-bold uppercase leading-[0.8] tracking-tight text-hollow opacity-[0.07] md:text-[16vw]">
            Sneaker Air
          </div>
        </div>

        <div className="relative mx-auto max-w-[1500px] px-6 pb-14 md:px-12">
          {/* newsletter */}
          <div className="mb-16 grid grid-cols-1 gap-8 border-b border-fog/8 pb-16 md:grid-cols-2 md:items-end">
            <div>
              <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.35em] text-mist">The Drop List</div>
              <h3 className="font-display text-4xl font-semibold uppercase leading-[0.9] tracking-tight md:text-5xl">
                Move <span className="text-neon">different</span>
              </h3>
            </div>
            <form onSubmit={subscribe} className="flex items-center gap-3">
              {subscribed ? (
                <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-volt">
                  ✓ You&apos;re on the list.
                </p>
              ) : (
                <>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full rounded-full border border-fog/12 bg-void/40 px-5 py-3.5 font-mono text-[12px] tracking-wide text-fog outline-none transition-colors placeholder:text-ghost focus:border-fog/40"
                  />
                  <button
                    type="submit"
                    data-cursor="link"
                    className="flex shrink-0 items-center gap-2 rounded-full bg-neon px-6 py-3.5 font-mono text-[10px] uppercase tracking-[0.2em] text-white transition-[filter] hover:brightness-110"
                  >
                    Join <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
            </form>
          </div>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
            {/* brand */}
            <div>
              <div className="mb-5 flex items-baseline gap-[3px]">
                <span className="font-display text-2xl font-semibold uppercase tracking-tight text-fog">Sneaker</span>
                <span className="font-display text-2xl font-semibold uppercase tracking-tight text-neon">Air</span>
              </div>
              <p className="max-w-xs leading-relaxed text-mist">
                Premium sneakers, drops &amp; street style — engineered for those who move different.
              </p>
              <div className="mt-6 flex gap-3">
                {[Instagram, Facebook, Twitter].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    data-cursor="link"
                    className="grid h-10 w-10 place-items-center rounded-full border border-fog/12 text-mist transition-all duration-300 hover:border-plasma hover:text-plasma"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* shop */}
            <FooterCol title={t('footer.shop')}>
              <FooterLink href="/shop">{t('footer.allProducts')}</FooterLink>
              <FooterLink href="/shop?category=running">{t('home.running') !== 'home.running' ? t('home.running') : 'Running'}</FooterLink>
              <FooterLink href="/shop?category=basketball">{t('home.basketball') !== 'home.basketball' ? t('home.basketball') : 'Basketball'}</FooterLink>
              <FooterLink href="/shop?category=limited">{t('home.limited') !== 'home.limited' ? t('home.limited') : 'Limited'}</FooterLink>
            </FooterCol>

            {/* support */}
            <FooterCol title={t('footer.support')}>
              <FooterLink href="/contact">{t('footer.contactUs')}</FooterLink>
              <li>
                <button
                  onClick={() => setShowSizeGuide(true)}
                  data-cursor="link"
                  className="font-mono text-[12px] uppercase tracking-[0.12em] text-mist transition-colors hover:text-fog"
                >
                  {t('footer.sizeGuide')}
                </button>
              </li>
              <FooterLink href="/contact#shipping">{t('footer.shippingInfo')}</FooterLink>
              <FooterLink href="/legal/return-policy">{t('footer.returns')}</FooterLink>
            </FooterCol>

            {/* contact */}
            <FooterCol title={t('footer.visitUs')}>
              <li className="flex items-start gap-3 text-mist">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ghost" />
                <address className="not-italic leading-relaxed">{t('footer.address')}</address>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-ghost" />
                <a href="tel:+302105550199" className="text-mist transition-colors hover:text-fog">
                  {t('footer.phone')}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-ghost" />
                <a href="mailto:hello@sneakerair.com" className="text-mist transition-colors hover:text-fog">
                  {t('footer.email')}
                </a>
              </li>
            </FooterCol>
          </div>

          {/* bottom bar */}
          <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-fog/8 pt-8 md:flex-row">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ghost">{t('footer.rights')}</p>
            <div className="flex flex-wrap justify-center gap-6">
              <FooterMini href="/legal/privacy-policy">Privacy</FooterMini>
              <FooterMini href="/legal/terms-of-service">Terms</FooterMini>
              <FooterMini href="/legal/return-policy">Returns</FooterMini>
            </div>
          </div>
        </div>
      </footer>

      {/* SIZE GUIDE */}
      {showSizeGuide && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-void/80 p-4 backdrop-blur-sm"
          onClick={() => setShowSizeGuide(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl panel-glass"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-fog/8 bg-carbon/80 p-6 backdrop-blur">
              <div className="flex items-center gap-3">
                <Ruler className="h-5 w-5 text-plasma" />
                <h3 className="font-display text-xl uppercase tracking-tight text-fog">Size Guide</h3>
              </div>
              <button
                onClick={() => setShowSizeGuide(false)}
                className="rounded-full p-2 text-mist transition-colors hover:bg-fog/5 hover:text-fog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-8 p-8">
              <div>
                <h4 className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-mist">EU · US · UK Conversion</h4>
                <div className="overflow-x-auto rounded-xl border border-fog/8">
                  <table className="w-full font-mono text-sm">
                    <thead>
                      <tr className="border-b border-fog/8 text-ghost">
                        <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.2em]">EU</th>
                        <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.2em]">US</th>
                        <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.2em]">UK</th>
                      </tr>
                    </thead>
                    <tbody className="text-fog">
                      {SIZE_ROWS.map((r) => (
                        <tr key={r[0]} className="border-b border-fog/5 last:border-0">
                          <td className="px-4 py-3 font-semibold text-plasma">{r[0]}</td>
                          <td className="px-4 py-3 text-mist">{r[1]}</td>
                          <td className="px-4 py-3 text-mist">{r[2]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-xl border border-fog/8 bg-void/40 p-6">
                <h4 className="mb-3 font-display text-lg text-fog">How to measure</h4>
                <ul className="space-y-2 text-sm leading-relaxed text-mist">
                  <li>• <strong className="text-fog">Foot length:</strong> stand on paper, mark heel and longest toe, measure in cm.</li>
                  <li>• <strong className="text-fog">Best time:</strong> measure in the evening, when feet are largest.</li>
                  <li>• <strong className="text-fog">Both feet:</strong> use the larger measurement to pick your size.</li>
                </ul>
              </div>

              <p className="text-center font-mono text-[11px] uppercase tracking-[0.15em] text-ghost">
                Between sizes? Size up for a roomier fit.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-6 font-mono text-[11px] uppercase tracking-[0.3em] text-ghost">{title}</h4>
      <ul className="space-y-4">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        data-cursor="link"
        className="font-mono text-[12px] uppercase tracking-[0.12em] text-mist transition-colors hover:text-fog"
      >
        {children}
      </Link>
    </li>
  );
}

function FooterMini({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      data-cursor="link"
      className="font-mono text-[11px] uppercase tracking-[0.2em] text-ghost transition-colors hover:text-fog"
    >
      {children}
    </Link>
  );
}
