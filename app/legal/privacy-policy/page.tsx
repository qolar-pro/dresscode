import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-pearl-50 dark:bg-charcoal-950 py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <Link href="/" className="inline-flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-charcoal-900 dark:hover:text-pearl-50 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Store
        </Link>

        <div className="bg-white dark:bg-charcoal-900 p-8 md:p-12 rounded-2xl shadow-sm border border-neutral-200 dark:border-charcoal-800">
          <h1 className="font-display text-4xl font-bold text-charcoal-900 dark:text-pearl-50 mb-8">Privacy Policy</h1>
          
          <div className="prose dark:prose-invert max-w-none text-neutral-700 dark:text-neutral-300 space-y-6">
            <p className="text-sm text-neutral-500">Last Updated: April 2026</p>
            
            <section>
              <h2 className="text-2xl font-semibold text-charcoal-900 dark:text-pearl-50 mb-4">1. Introduction</h2>
              <p>DRESS CODE ("we," "our," or "us") respects your privacy and is committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-charcoal-900 dark:text-pearl-50 mb-4">2. Data We Collect</h2>
              <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Identity Data:</strong> First name, last name, username.</li>
                <li><strong>Contact Data:</strong> Billing address, delivery address, email address, phone number.</li>
                <li><strong>Transaction Data:</strong> Details about payments to and from you, and other details of products you have purchased from us.</li>
                <li><strong>Technical Data:</strong> Internet protocol (IP) address, browser type and version, time zone setting, location, browser plug-in types and versions, operating system and platform.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-charcoal-900 dark:text-pearl-50 mb-4">3. How We Use Your Data</h2>
              <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>To process and deliver your order.</li>
                <li>To manage our relationship with you (e.g., notifying you about changes to our terms or privacy policy).</li>
                <li>To improve our website, products/services, marketing, and customer relationships.</li>
                <li>To administer and protect our business and this website.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-charcoal-900 dark:text-pearl-50 mb-4">4. Data Security</h2>
              <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way, altered, or disclosed.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-charcoal-900 dark:text-pearl-50 mb-4">5. Your Legal Rights</h2>
              <p>Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to request access, correction, erasure, or transfer of your personal data.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-charcoal-900 dark:text-pearl-50 mb-4">6. Contact Us</h2>
              <p>If you have any questions about this privacy policy or our privacy practices, please contact us at:</p>
              <p className="font-medium text-charcoal-900 dark:text-pearl-50">
                Email: privacy@blancographics.xyz<br />
                Phone: (555) 123-4567
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
