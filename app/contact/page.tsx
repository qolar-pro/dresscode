'use client';

import { useLanguage } from '@/context/LanguageContext';
import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, Instagram, Facebook, Twitter, ArrowRight } from 'lucide-react';

export default function ContactPage() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Page Header with Background Image */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1920&q=80"
            alt="Contact Us"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/60 dark:from-neutral-950/95 dark:via-neutral-950/80 dark:to-neutral-950/60" />
        </div>
        
        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-8 h-[1px] bg-neutral-900 dark:bg-white" />
            <span className="text-xs font-medium tracking-[0.3em] uppercase text-neutral-600 dark:text-neutral-400">{t('contact.getLabel')}</span>
          </div>
          <h1 className="font-display text-6xl md:text-7xl font-light tracking-tight text-neutral-900 dark:text-white mb-4">{t('contact.title')}</h1>
          <p className="text-neutral-600 dark:text-neutral-400 font-light text-lg">{t('contact.subtitle')}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Contact Information */}
          <div className="space-y-12">
            {/* Store Location */}
            <div>
              <div className="flex items-start gap-4 mb-3">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-1 text-neutral-900 dark:text-white" />
                <div>
                  <h3 className="font-medium text-neutral-900 dark:text-white mb-2">{t('contact.visitStore')}</h3>
                  <address className="text-neutral-600 dark:text-neutral-400 not-italic font-light leading-relaxed">
                    123 Fashion Street<br />
                    Style District, NY 10001<br />
                    United States
                  </address>
                </div>
              </div>
            </div>

            {/* Phone */}
            <div>
              <div className="flex items-start gap-4 mb-3">
                <Phone className="w-5 h-5 flex-shrink-0 mt-1 text-neutral-900 dark:text-white" />
                <div>
                  <h3 className="font-medium text-neutral-900 dark:text-white mb-2">{t('contact.callUs')}</h3>
                  <a href="tel:+15551234567" className="text-neutral-900 dark:text-white hover:text-neutral-600 dark:hover:text-neutral-400 font-light transition-colors">
                    (555) 123-4567
                  </a>
                  <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-1 font-light">Mon-Sat, 9am-8pm EST</p>
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <div className="flex items-start gap-4 mb-3">
                <Mail className="w-5 h-5 flex-shrink-0 mt-1 text-neutral-900 dark:text-white" />
                <div>
                  <h3 className="font-medium text-neutral-900 dark:text-white mb-2">{t('contact.emailUs')}</h3>
                  <a href="mailto:hello@dresscode.com" className="text-neutral-900 dark:text-white hover:text-neutral-600 dark:hover:text-neutral-400 font-light transition-colors">
                    hello@dresscode.com
                  </a>
                  <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-1 font-light">We'll respond within 24 hours</p>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div>
              <div className="flex items-start gap-4 mb-3">
                <Clock className="w-5 h-5 flex-shrink-0 mt-1 text-neutral-900 dark:text-white" />
                <div>
                  <h3 className="font-medium text-neutral-900 dark:text-white mb-4">{t('contact.storeHours')}</h3>
                  <ul className="space-y-2 text-sm font-light">
                    <li className="flex justify-between py-2 border-b border-neutral-200 dark:border-neutral-800">
                      <span className="text-neutral-600 dark:text-neutral-400">{t('contact.hoursMonFri')}</span>
                      <span className="text-neutral-900 dark:text-white">9:00 AM - 8:00 PM</span>
                    </li>
                    <li className="flex justify-between py-2 border-b border-neutral-200 dark:border-neutral-800">
                      <span className="text-neutral-600 dark:text-neutral-400">{t('contact.hoursSat')}</span>
                      <span className="text-neutral-900 dark:text-white">10:00 AM - 7:00 PM</span>
                    </li>
                    <li className="flex justify-between py-2">
                      <span className="text-neutral-600 dark:text-neutral-400">{t('contact.hoursSun')}</span>
                      <span className="text-neutral-900 dark:text-white">11:00 AM - 5:00 PM</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="font-medium text-neutral-900 dark:text-white mb-4">{t('contact.followUs')}</h3>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 border border-neutral-300 dark:border-neutral-700 hover:border-neutral-900 dark:hover:border-white flex items-center justify-center transition-all duration-300">
                  <Instagram className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                </a>
                <a href="#" className="w-10 h-10 border border-neutral-300 dark:border-neutral-700 hover:border-neutral-900 dark:hover:border-white flex items-center justify-center transition-all duration-300">
                  <Facebook className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                </a>
                <a href="#" className="w-10 h-10 border border-neutral-300 dark:border-neutral-700 hover:border-neutral-900 dark:hover:border-white flex items-center justify-center transition-all duration-300">
                  <Twitter className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="max-w-2xl">
              <h2 className="font-display text-3xl font-light tracking-tight text-neutral-900 dark:text-white mb-2">{t('contact.sendMessage')}</h2>
              <p className="text-neutral-600 dark:text-neutral-400 font-light mb-12">{t('contact.sendMessageDesc')}</p>
              
              {submitted ? (
                <div className="border border-neutral-300 dark:border-neutral-700 p-12 text-center">
                  <div className="w-16 h-16 border-2 border-neutral-900 dark:border-white rounded-full flex items-center justify-center mx-auto mb-6">
                    <Send className="w-8 h-8 text-neutral-900 dark:text-white" />
                  </div>
                  <h3 className="font-display text-2xl font-light tracking-tight text-neutral-900 dark:text-white mb-2">{t('contact.sent')}</h3>
                  <p className="text-neutral-600 dark:text-neutral-400 font-light">
                    {t('contact.sentDesc')}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-xs tracking-[0.2em] uppercase font-medium mb-3 text-neutral-500 dark:text-neutral-400">{t('contact.yourName')} *</label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Jane Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-xs tracking-[0.2em] uppercase font-medium mb-3 text-neutral-500 dark:text-neutral-400">{t('contact.emailAddress')} *</label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="jane@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs tracking-[0.2em] uppercase font-medium mb-3 text-neutral-500 dark:text-neutral-400">{t('contact.subject')} *</label>
                    <select
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="input-field"
                    >
                      <option value="">{t('contact.selectSubject')}</option>
                      <option value="general">{t('contact.generalInquiry')}</option>
                      <option value="order">{t('contact.orderQuestion')}</option>
                      <option value="product">{t('contact.productInfo')}</option>
                      <option value="returns">{t('contact.returns')}</option>
                      <option value="feedback">{t('contact.feedback')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs tracking-[0.2em] uppercase font-medium mb-3 text-neutral-500 dark:text-neutral-400">{t('contact.message')} *</label>
                    <textarea
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleChange}
                      className="input-field resize-none"
                      rows={6}
                      placeholder={t('contact.messagePlaceholder')}
                    />
                  </div>

                  <button type="submit" className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-10 py-4 text-xs tracking-[0.2em] uppercase font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors inline-flex items-center gap-3">
                    {t('contact.send')}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>

            {/* Map Placeholder with Background */}
            <div className="mt-16 relative overflow-hidden">
              <div className="h-80 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center relative">
                <img
                  src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&q=80"
                  alt="Store Location"
                  className="absolute inset-0 w-full h-full object-cover opacity-20 dark:opacity-10"
                />
                <div className="text-center relative z-10">
                  <MapPin className="w-10 h-10 text-neutral-900 dark:text-white mx-auto mb-4" />
                  <p className="font-medium text-neutral-900 dark:text-white mb-2">123 Fashion Street</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 font-light mb-4">Style District, NY 10001</p>
                  <a
                    href="https://maps.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs tracking-[0.15em] uppercase font-medium text-neutral-900 dark:text-white hover:text-neutral-600 dark:hover:text-neutral-400 transition-colors"
                  >
                    {t('contact.openMaps')}
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
