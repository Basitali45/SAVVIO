export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  regular_price: number;
  sale_price: number;
  discount_percentage: number;
  category_id: string;
  category_name: string;
  images: string[];
  is_featured: boolean;
  is_new_arrival: boolean;
  in_stock: boolean;
  stock_quantity: number;
  sizes: string[];
  colors: string[];
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
}

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  image_url: string;
  subtotal: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  city: string;
  notes?: string;
  total_amount: number;
  status: OrderStatus;
  items: OrderItem[];
  channel: 'whatsapp' | 'web';
  created_at: string;
  updated_at: string;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  code: string;
  discount_percentage: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  banner_text: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  button_text: string;
  button_url: string;
  image_url: string;
  is_active: boolean;
}

export interface WebsiteSettings {
  brand_name: string;
  tag_line: string;
  logo_url: string;
  whatsapp_number: string;
  instagram_url: string;
  contact_email: string;
  contact_phone: string;
  currency: string;
  free_delivery_threshold: number;
  announcement_bar_enabled: boolean;
  announcement_text: string;
  announcement_bg_color: string;
  announcement_text_color: string;
  floating_whatsapp_enabled: boolean;
  return_policy: string;
  delivery_info: string;
  footer_text: string;
  supabase_url?: string;
  supabase_anon_key?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}
