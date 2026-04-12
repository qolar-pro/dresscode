import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-pearl-50 dark:bg-charcoal-950 py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <Link href="/" className="inline-flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-charcoal-900 dark:hover:text-pearl-50 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Store
        </Link>

        <div className="bg-white dark:bg-charcoal-900 p-8 md:p-12 rounded-2xl shadow-sm border border-neutral-200 dark:border-charcoal-800">
          <h1 className="font-display text-4xl font-bold text-charcoal-900 dark:text-pearl-50 mb-8">Terms of Service</h1>
          
          <div className="prose dark:prose-invert max-w-none text-neutral-700 dark:text-neutral-300 space-y-6">
            <p className="text-sm text-neutral-500">Last Updated: April 2026</p>
            
            <section>
              <h2 className="text-2xl font-semibold text-charcoal-900 dark:text-pearl-50 mb-4">1. Overview</h2>
              <p>This website is operated by DRESS CODE. Throughout the site, the terms "we", "us" and "our" refer to DRESS CODE. DRESS CODE offers this website, including all information, tools and services available from this site to you, the user, conditioned upon your acceptance of all terms, conditions, policies and notices stated here.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-charcoal-900 dark:text-pearl-50 mb-4">2. Online Store Terms</h2>
              <p>By agreeing to these Terms of Service, you represent that you are at least the age of majority in your state or province of residence. You may not use our products for any illegal or unauthorized purpose nor may you, in the use of the Service, violate any laws in your jurisdiction.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-charcoal-900 dark:text-pearl-50 mb-4">3. General Conditions</h2>
              <p>We reserve the right to refuse service to anyone for any reason at any time. You understand that your content (not including credit card information), may be transferred unencrypted and involve (a) transmissions over various networks; and (b) changes to conform and adapt to technical requirements of connecting networks or devices.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-charcoal-900 dark:text-pearl-50 mb-4">4. Accuracy of Information</h2>
              <p>We are not responsible if information made available on this site is not accurate, complete or current. The material on this site is provided for general information only and should not be relied upon or used as the sole basis for making decisions without consulting primary, more accurate, more complete or more timely sources of information.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-charcoal-900 dark:text-pearl-50 mb-4">5. Modifications to the Service and Prices</h2>
              <p>Prices for our products are subject to change without notice. We reserve the right at any time to modify or discontinue the Service (or any part or content thereof) without notice at any time. We shall not be liable to you or to any third-party for any modification, price change, suspension or discontinuance of the Service.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-charcoal-900 dark:text-pearl-50 mb-4">6. Contact Information</h2>
              <p>Questions about the Terms of Service should be sent to us at:</p>
              <p className="font-medium text-charcoal-900 dark:text-pearl-50">
                Email: legal@blancographics.xyz<br />
                Phone: (555) 123-4567
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
