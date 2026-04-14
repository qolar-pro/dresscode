/**
 * DRESS CODE - Payment Gateway Configuration
 *
 * STATUS: Stripe Test Mode Active + Cash on Delivery
 *
 * HOW TO ADD A NEW PAYMENT GATEWAY:
 * 1. Add your API keys in .env.local (NEVER commit real keys to git!)
 * 2. Create a payment processor in lib/payments/
 * 3. Update checkout page to use the new gateway
 */

export interface PaymentGateway {
  id: string;
  name: string;
  enabled: boolean;
  currency: string;
  fees: {
    percentage: number;
    fixed: number;
  };
  testMode: boolean;
  apiKey?: string;
  publishableKey?: string;
}

export interface PaymentGateways {
  cashOnDelivery: PaymentGateway;
  stripe: PaymentGateway;
  paypal: PaymentGateway;
  vivaWallet: PaymentGateway;
}

/**
 * Payment Gateway Configurations
 */
export const PAYMENT_CONFIG: PaymentGateways = {
  cashOnDelivery: {
    id: 'cash_on_delivery',
    name: 'Cash on Delivery',
    enabled: true,
    currency: 'EUR',
    fees: {
      percentage: 0,
      fixed: 0,
    },
    testMode: false,
  },

  stripe: {
    id: 'stripe',
    name: 'Credit/Debit Card (Stripe)',
    enabled: true,
    currency: 'EUR',
    fees: {
      percentage: 1.4,
      fixed: 0.25,
    },
    testMode: true,
    apiKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  },

  paypal: {
    id: 'paypal',
    name: 'PayPal',
    enabled: false,
    currency: 'EUR',
    fees: {
      percentage: 3.4,
      fixed: 0.35,
    },
    testMode: true,
  },

  vivaWallet: {
    id: 'viva_wallet',
    name: 'Viva Wallet (Greece)',
    enabled: false,
    currency: 'EUR',
    fees: {
      percentage: 1.5,
      fixed: 0,
    },
    testMode: true,
  },
};

/**
 * Get enabled payment methods
 */
export function getEnabledPaymentMethods(): PaymentGateway[] {
  return Object.values(PAYMENT_CONFIG).filter(gateway => gateway.enabled);
}

/**
 * Calculate payment fees
 */
export function calculatePaymentFee(amount: number, gatewayId: string): number {
  const gateway = Object.values(PAYMENT_CONFIG).find(g => g.id === gatewayId);
  if (!gateway) return 0;

  return (amount * gateway.fees.percentage / 100) + gateway.fees.fixed;
}

/**
 * Payment Processing Status
 */
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled',
} as const;

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];

/**
 * Payment Method Types
 */
export const PAYMENT_METHODS = {
  CASH_ON_DELIVERY: 'cash_on_delivery',
  CREDIT_CARD: 'credit_card',
  STRIPE: 'stripe',
  PAYPAL: 'paypal',
  BANK_TRANSFER: 'bank_transfer',
  VIVA_WALLET: 'viva_wallet',
} as const;

export type PaymentMethod = typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS];
