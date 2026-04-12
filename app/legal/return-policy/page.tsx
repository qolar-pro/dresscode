import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ReturnPolicy() {
  return (
    <div className="min-h-screen bg-pearl-50 dark:bg-charcoal-950 py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <Link href="/" className="inline-flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-charcoal-900 dark:hover:text-pearl-50 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Store
        </Link>

        <div className="bg-white dark:bg-charcoal-900 p-8 md:p-12 rounded-2xl shadow-sm border border-neutral-200 dark:border-charcoal-800">
          <h1 className="font-display text-4xl font-bold text-charcoal-900 dark:text-pearl-50 mb-8">Return Policy</h1>
          
          <div className="prose dark:prose-invert max-w-none text-neutral-700 dark:text-neutral-300 space-y-6">
            <p className="text-sm text-neutral-500">Last Updated: April 2026</p>
            
            <section>
              <h2 className="text-2xl font-semibold text-charcoal-900 dark:text-pearl-50 mb-4">30-Day Return Policy</h2>
              <p>At DRESS CODE, we want you to be completely satisfied with your purchase. If you are not entirely satisfied with your purchase, we're here to help.</p>
              <p>You have <strong>30 calendar days</strong> to return an item from the date you received it.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-charcoal-900 dark:text-pearl-50 mb-4">Eligibility for Returns</h2>
              <p>To be eligible for a return, your item must be unused and in the same condition that you received it. Your item must be in the original packaging.</p>
              <p>Your item needs to have the receipt or proof of purchase.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-charcoal-900 dark:text-pearl-50 mb-4">Refunds</h2>
              <p>Once we receive your item, we will inspect it and notify you that we have received your returned item. We will immediately notify you on the status of your refund after inspecting the item.</p>
              <p>If your return is approved, we will initiate a refund to your credit card (or original method of payment). You will receive the credit within a certain amount of days, depending on your card issuer's policies.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-charcoal-900 dark:text-pearl-50 mb-4">Shipping Costs for Returns</h2>
              <p>You will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non-refundable.</p>
              <p>If you receive a refund, the cost of return shipping will be deducted from your refund.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-charcoal-900 dark:text-pearl-50 mb-4">How to Return an Item</h2>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Contact our customer support team at returns@blancographics.xyz to request a return authorization.</li>
                <li>Pack the item securely in its original packaging.</li>
                <li>Include the original receipt or proof of purchase.</li>
                <li>Ship the item to the address provided by our support team.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-charcoal-900 dark:text-pearl-50 mb-4">Contact Us</h2>
              <p>If you have any questions on how to return your item to us, contact us:</p>
              <p className="font-medium text-charcoal-900 dark:text-pearl-50">
                Email: returns@blancographics.xyz<br />
                Phone: (555) 123-4567
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
