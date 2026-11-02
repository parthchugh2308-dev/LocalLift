export type UserRole = 'customer' | 'vendor' | 'admin';

export interface User {
  user_id: number;
  name: string;
  email: string;
  phone?: string;
  user_type: UserRole;
  location?: string;
  created_at?: string;
}

export interface Vendor {
  vendor_id: number;
  owner_user_id?: number;
  business_name: string;
  owner_name?: string;
  category: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  phone: string;
  email?: string;
  opening_hours: string;
  closing_time: string;
  rating: number;
  description: string;
  image: string;
  is_open: boolean;
  status: 'pending' | 'approved' | 'rejected';
  created_at?: string;
  distance_km?: number;
  distance_m?: number;
  distance_formatted?: string;
  time_estimate?: string;
  source?: string;
}

export interface Product {
  product_id: number;
  vendor_id: number;
  product_name: string;
  category: string;
  price: number;
  image: string;
  availability: number; // 1 = in stock, 0 = out of stock
  description: string;
  created_at?: string;
}

export interface Offer {
  offer_id: number;
  vendor_id: number;
  business_name?: string;
  title: string;
  discount: string;
  description: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'inactive';
}

export interface OrderItem {
  order_item_id?: number;
  order_id?: number;
  product_id: number;
  product_name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  order_id: number;
  user_id: number;
  vendor_id: number;
  customer_name?: string;
  customer_phone?: string;
  business_name?: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'delivered' | 'cancelled';
  notes?: string;
  created_at: string;
  delivery_address?: string;
  items: OrderItem[];
}

export interface Review {
  review_id: number;
  user_id: number;
  vendor_id: number;
  user_name: string;
  rating: number;
  comment: string;
  created_at?: string;
}

export interface CartItem {
  product: Product;
  vendor: Vendor;
  quantity: number;
}

export interface CategoryInfo {
  name: string;
  icon: string;
  color: string;
  image: string;
  items: {
    name: string;
    price: number;
    desc: string;
    img: string;
  }[];
}
