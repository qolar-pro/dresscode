'use client';

import { useLanguage } from '@/context/LanguageContext';
import { useState, useRef } from 'react';
import { MapPin, Phone, Mail, Clock, Send, Instagram, Facebook, Twitter, ArrowUpRight } from 'lucide-react';
import { useReveal } from '@/lib/reveal';
import Magnetic from '@/components/Magnetic';
import TextRoll from '@/components/TextRoll';

const inputClass =
  'w-full rounded-xl border border-fog/12 bg-void/40 px-4 py-3.5 font-mono text-[13px] text-fog outline-none transition-colors placeholder:text-ghost focus:border-plasma';

export default function ContactPage() {
  const { t } = useLanguage();
  const scope = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useReveal(scope, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || 'Failed to send message');
        return;
      }
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ name: '', email: '', subject: '', message: '' });
      }, 5000);
    } catch (error) {
      console.error('Contact form submission error:', error);
      setSubmitError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div ref={scope} className="relative min-h-screen overflow-hidden bg-void text-fog">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="aura-blob aura-blob-a right-[-6%] top-[8%] h-[48vh] w-[48vh] opacity-30" />
        <div className="aura-blob aura-blob-c left-[-8%] top-[45%] h-[42vh] w-[42vh] opacity-20" />
        <div className="absolute inset-0 grid-overlay opacity-40" />
      </div>

      {/* HERO */}
      <section className="relative pt-40 pb-12 md:pt-48">
        <div className="mx-auto max-w-[1500px] px-6 md:px-12">
          <div className="mb-5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.35em] text-mist" data-reveal>
            <span className="h-1.5 w-1.5 rounded-full bg-plasma shadow-[0_0_10px_#8a5cff]" />
            {t('contact.getLabel')}
          </div>
          <h1 className="font-display text-6xl font-semibold uppercase leading-[0.85] tracking-tight md:text-8xl">
            <span className="line-mask"><span className="block">{t('contact.title')}</span></span>
          </h1>
          <p className="mt-6 max-w-md text-mist" data-reveal data-reveal-delay="0.1">{t('contact.subtitle')}</p>
        </div>
      </section>

      <div className="relative mx-auto max-w-[1500px] px-6 pb-24 md:px-12">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-3">
          {/* INFO */}
          <div className="space-y-8" data-reveal-group>
            <InfoBlock icon={MapPin} title={t('contact.visitStore')}>
              <address className="not-italic leading-relaxed text-mist">
                88 Sneaker Boulevard<br />Athens 10552<br />Greece
              </address>
            </InfoBlock>

            <InfoBlock icon={Phone} title={t('contact.callUs')}>
              <a href="tel:+302105550199" className="text-fog transition-colors hover:text-plasma">+30 210 555 0199</a>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-ghost">Mon–Sat · 9am–8pm</p>
            </InfoBlock>

            <InfoBlock icon={Mail} title={t('contact.emailUs')}>
              <a href="mailto:hello@sneakerair.com" className="text-fog transition-colors hover:text-plasma">hello@sneakerair.com</a>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-ghost">Reply within 24h</p>
            </InfoBlock>

            <InfoBlock icon={Clock} title={t('contact.storeHours')}>
              <ul className="space-y-2 font-mono text-[12px]">
                <li className="flex justify-between border-b border-fog/8 py-1.5">
                  <span className="text-mist">{t('contact.hoursMonFri')}</span><span className="text-fog">09–20</span>
                </li>
                <li className="flex justify-between border-b border-fog/8 py-1.5">
                  <span className="text-mist">{t('contact.hoursSat')}</span><span className="text-fog">10–19</span>
                </li>
                <li className="flex justify-between py-1.5">
                  <span className="text-mist">{t('contact.hoursSun')}</span><span className="text-fog">11–17</span>
                </li>
              </ul>
            </InfoBlock>

            <div>
              <h3 className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-ghost">{t('contact.followUs')}</h3>
              <div className="flex gap-3">
                {[Instagram, Facebook, Twitter].map((Icon, i) => (
                  <a key={i} href="#" data-cursor="link" className="grid h-10 w-10 place-items-center rounded-full border border-fog/12 text-mist transition-all duration-300 hover:border-plasma hover:text-plasma">
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* FORM */}
          <div className="lg:col-span-2">
            <div className="rounded-3xl panel-glass p-8 md:p-10" data-reveal>
              <h2 className="font-display text-3xl font-semibold uppercase tracking-tight text-fog">{t('contact.sendMessage')}</h2>
              <p className="mb-9 mt-2 text-mist">{t('contact.sendMessageDesc')}</p>

              {submitted ? (
                <div className="rounded-2xl border border-volt/30 bg-volt/5 p-12 text-center">
                  <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full bg-neon text-white">
                    <Send className="h-7 w-7" />
                  </div>
                  <h3 className="font-display text-2xl uppercase tracking-tight text-fog">{t('contact.sent')}</h3>
                  <p className="mt-2 text-mist">{t('contact.sentDesc')}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {submitError && (
                    <div className="rounded-xl border border-flare/30 bg-flare/5 p-4 font-mono text-[12px] text-flare">{submitError}</div>
                  )}
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Field label={`${t('contact.yourName')} *`}>
                      <input type="text" name="name" required value={formData.name} onChange={handleChange} className={inputClass} placeholder="Jane Doe" />
                    </Field>
                    <Field label={`${t('contact.emailAddress')} *`}>
                      <input type="email" name="email" required value={formData.email} onChange={handleChange} className={inputClass} placeholder="jane@example.com" />
                    </Field>
                  </div>

                  <Field label={`${t('contact.subject')} *`}>
                    <select name="subject" required value={formData.subject} onChange={handleChange} className={`${inputClass} cursor-pointer`}>
                      <option value="" className="bg-carbon">{t('contact.selectSubject')}</option>
                      <option value="general" className="bg-carbon">{t('contact.generalInquiry')}</option>
                      <option value="order" className="bg-carbon">{t('contact.orderQuestion')}</option>
                      <option value="product" className="bg-carbon">{t('contact.productInfo')}</option>
                      <option value="returns" className="bg-carbon">{t('contact.returns')}</option>
                      <option value="feedback" className="bg-carbon">{t('contact.feedback')}</option>
                    </select>
                  </Field>

                  <Field label={`${t('contact.message')} *`}>
                    <textarea name="message" required value={formData.message} onChange={handleChange} rows={6} className={`${inputClass} resize-none`} placeholder={t('contact.messagePlaceholder')} />
                  </Field>

                  <Magnetic strength={0.15}>
                    <button
                      type="submit"
                      disabled={submitting}
                      data-cursor="link"
                      className="inline-flex items-center gap-3 rounded-full bg-neon px-9 py-4 font-mono text-[12px] uppercase tracking-[0.2em] text-white transition-[filter] hover:brightness-110 disabled:opacity-50"
                    >
                      {submitting ? 'Sending…' : <TextRoll text={t('contact.send')} />}
                      <ArrowUpRight className="h-4 w-4" />
                    </button>
                  </Magnetic>
                </form>
              )}
            </div>

            {/* location card */}
            <div className="mt-8 flex flex-col items-center justify-center gap-3 rounded-3xl panel-glass p-12 text-center" data-reveal>
              <MapPin className="h-8 w-8 text-plasma" />
              <p className="font-display text-lg text-fog">88 Sneaker Boulevard</p>
              <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-mist">Athens 10552 · Greece</p>
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="link"
                className="mt-2 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.15em] text-fog transition-colors hover:text-plasma"
              >
                {t('contact.openMaps')} <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoBlock({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-fog/10 text-plasma">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <h3 className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-fog">{title}</h3>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-3 block font-mono text-[10px] uppercase tracking-[0.2em] text-ghost">{label}</label>
      {children}
    </div>
  );
}
