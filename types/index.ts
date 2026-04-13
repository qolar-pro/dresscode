export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
  images: string[];
  sizes: Size[];
  colors: Color[];
  isNew?: boolean;
  isFeatured?: boolean;
  stock?: number;
}

export interface Size {
  name: string;
  available: boolean;
  stock?: number; // Per-size stock tracking
}

export interface Color {
  name: string;
  hex: string;
  available: boolean;
}

export interface CartItem {
  product: Product;
  size: string;
  color: string;
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  customer: CustomerInfo;
  total: number;
  date: string;
  paymentMethod: string;
  paymentStatus?: string;
  subtotal?: number;
  shipping?: number;
  paymentFee?: number;
}

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  notes?: string;
}
