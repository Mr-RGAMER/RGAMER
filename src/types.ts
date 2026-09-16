export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  price_usd?: number | null;
  emoji?: string;
  color?: string;
  image_url?: string;
  available: boolean;
  created_at?: string;
}

export interface Order {
  id: string;
  name: string;
  whatsapp: string;
  product: string;
  address: string;
  notes?: string;
  discount_code?: string;
  discount_percent: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | string;
  placed_at: string;
  username?: string;
}

export interface DiscountCode {
  id: string;
  code: string;
  discount_percent: number;
  uses_left: number;
  active: boolean;
  created_at?: string;
}

export interface CustomerUser {
  username: string;
  whatsapp: string;
  profile_pic_url?: string;
  created_at?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}
