import { Product, Category, Order, Offer, Banner, WebsiteSettings, OrderStatus } from '../types.ts';
import {
  initialProducts,
  initialCategories,
  initialOrders,
  initialOffers,
  initialBanners,
  initialSettings,
} from '../data/initialData.ts';

const API_BASE = '/api';

// Local storage backup keys for static deployments (e.g. Vercel static hosting)
const STORAGE_KEYS = {
  PRODUCTS: 'savvio_db_products',
  CATEGORIES: 'savvio_db_categories',
  ORDERS: 'savvio_db_orders',
  OFFERS: 'savvio_db_offers',
  BANNERS: 'savvio_db_banners',
  SETTINGS: 'savvio_db_settings',
};

// Helper to safely get from localStorage with fallback
function getLocal<T>(key: string, fallback: T): T {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

// Helper to safely set to localStorage
function setLocal<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.error('LocalStorage write error:', err);
  }
}

// Safe JSON parser that never crashes on HTML responses (like "The page cannot be found...")
async function safeFetchJson<T>(
  url: string,
  options?: RequestInit,
  fallback?: T
): Promise<{ success: boolean; data: T }> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';

    // If server returned HTML (e.g. 404/500 "The page cannot be found")
    if (!res.ok || !contentType.includes('application/json')) {
      const text = await res.text().catch(() => '');
      console.warn(`API [${url}] returned non-JSON response (${res.status}):`, text.slice(0, 60));
      return { success: false, data: fallback as T };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    console.warn(`Network/Fetch error for [${url}]:`, err);
    return { success: false, data: fallback as T };
  }
}

export const api = {
  // ==========================================
  // PRODUCTS
  // ==========================================
  async getProducts(): Promise<Product[]> {
    const local = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
    const res = await safeFetchJson<Product[]>(`${API_BASE}/products`, undefined, local);
    if (res.success && Array.isArray(res.data) && res.data.length > 0) {
      setLocal(STORAGE_KEYS.PRODUCTS, res.data);
      return res.data;
    }
    return local;
  },

  async getProduct(id: string): Promise<Product> {
    const localList = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
    const localMatch = localList.find((p) => p.id === id || p.slug === id);

    const res = await safeFetchJson<Product>(`${API_BASE}/products/${id}`, undefined, localMatch!);
    if (res.success && res.data) {
      return res.data;
    }
    if (localMatch) return localMatch;
    throw new Error('Product not found');
  },

  async createProduct(product: Partial<Product>): Promise<Product> {
    const newProduct: Product = {
      id: product.id || `prod-${Date.now()}`,
      name: product.name || 'Untitled Product',
      slug: product.slug || (product.name ? product.name.toLowerCase().replace(/\s+/g, '-') : `prod-${Date.now()}`),
      description: product.description || '',
      regular_price: product.regular_price || 0,
      sale_price: product.sale_price || 0,
      discount_percentage: product.discount_percentage || 0,
      category_id: product.category_id || 'cat-hoodies',
      category_name: product.category_name || 'Hoodies',
      images: product.images && product.images.length > 0 ? product.images : ['/assets/aistudio/image_3d1d334e.png'],
      is_featured: product.is_featured ?? true,
      is_new_arrival: product.is_new_arrival ?? false,
      in_stock: product.in_stock ?? true,
      stock_quantity: product.stock_quantity ?? 10,
      sizes: product.sizes || ['S', 'M', 'L', 'XL'],
      colors: product.colors || ['Black'],
      created_at: new Date().toISOString(),
    };

    const res = await safeFetchJson<Product>(
      `${API_BASE}/products`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      },
      newProduct
    );

    const finalProduct = res.success ? res.data : newProduct;
    // Always persist to local cache as well
    const current = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
    setLocal(STORAGE_KEYS.PRODUCTS, [finalProduct, ...current.filter((p) => p.id !== finalProduct.id)]);
    return finalProduct;
  },

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    const current = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
    const existing = current.find((p) => p.id === id);
    const updated: Product = {
      ...(existing || ({} as Product)),
      ...product,
      id,
    };

    const res = await safeFetchJson<Product>(
      `${API_BASE}/products/${id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      },
      updated
    );

    const finalProd = res.success ? res.data : updated;
    setLocal(
      STORAGE_KEYS.PRODUCTS,
      current.map((p) => (p.id === id ? finalProd : p))
    );
    return finalProd;
  },

  async deleteProduct(id: string): Promise<boolean> {
    const current = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
    setLocal(
      STORAGE_KEYS.PRODUCTS,
      current.filter((p) => p.id !== id)
    );

    await safeFetchJson(`${API_BASE}/products/${id}`, { method: 'DELETE' });
    return true;
  },

  // ==========================================
  // CATEGORIES
  // ==========================================
  async getCategories(): Promise<Category[]> {
    const local = getLocal<Category[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
    const res = await safeFetchJson<Category[]>(`${API_BASE}/categories`, undefined, local);
    if (res.success && Array.isArray(res.data) && res.data.length > 0) {
      setLocal(STORAGE_KEYS.CATEGORIES, res.data);
      return res.data;
    }
    return local;
  },

  async createCategory(category: Partial<Category>): Promise<Category> {
    const newCat: Category = {
      id: category.id || `cat-${Date.now()}`,
      name: category.name || 'New Category',
      slug: category.slug || (category.name ? category.name.toLowerCase().replace(/\s+/g, '-') : `cat-${Date.now()}`),
      description: category.description || '',
      image_url: category.image_url || '/assets/aistudio/image_3d1d334e.png',
      display_order: category.display_order || 1,
      is_active: category.is_active ?? true,
    };

    const res = await safeFetchJson<Category>(
      `${API_BASE}/categories`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCat),
      },
      newCat
    );

    const finalCat = res.success ? res.data : newCat;
    const current = getLocal<Category[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
    setLocal(STORAGE_KEYS.CATEGORIES, [...current, finalCat]);
    return finalCat;
  },

  async updateCategory(id: string, category: Partial<Category>): Promise<Category> {
    const current = getLocal<Category[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
    const existing = current.find((c) => c.id === id);
    const updated: Category = { ...(existing || ({} as Category)), ...category, id };

    const res = await safeFetchJson<Category>(
      `${API_BASE}/categories/${id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      },
      updated
    );

    const finalCat = res.success ? res.data : updated;
    setLocal(
      STORAGE_KEYS.CATEGORIES,
      current.map((c) => (c.id === id ? finalCat : c))
    );
    return finalCat;
  },

  async deleteCategory(id: string): Promise<boolean> {
    const current = getLocal<Category[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
    setLocal(
      STORAGE_KEYS.CATEGORIES,
      current.filter((c) => c.id !== id)
    );
    await safeFetchJson(`${API_BASE}/categories/${id}`, { method: 'DELETE' });
    return true;
  },

  // ==========================================
  // ORDERS
  // ==========================================
  async getOrders(): Promise<Order[]> {
    const local = getLocal<Order[]>(STORAGE_KEYS.ORDERS, initialOrders);
    const res = await safeFetchJson<Order[]>(`${API_BASE}/orders`, undefined, local);
    if (res.success && Array.isArray(res.data) && res.data.length > 0) {
      setLocal(STORAGE_KEYS.ORDERS, res.data);
      return res.data;
    }
    return local;
  },

  async createOrder(order: Partial<Order>): Promise<Order> {
    const currentOrders = getLocal<Order[]>(STORAGE_KEYS.ORDERS, initialOrders);
    const orderNumber = order.order_number || `SAV-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: order.id || `ord-${Date.now()}`,
      order_number: orderNumber,
      customer_name: order.customer_name || 'Customer',
      customer_phone: order.customer_phone || '',
      delivery_address: order.delivery_address || '',
      city: order.city || 'Karachi',
      notes: order.notes || '',
      total_amount: order.total_amount || 0,
      status: order.status || 'pending',
      items: order.items || [],
      channel: order.channel || 'whatsapp',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const res = await safeFetchJson<Order>(
      `${API_BASE}/orders`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      },
      newOrder
    );

    const finalOrder = res.success ? res.data : newOrder;
    setLocal(STORAGE_KEYS.ORDERS, [finalOrder, ...currentOrders]);
    return finalOrder;
  },

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    const currentOrders = getLocal<Order[]>(STORAGE_KEYS.ORDERS, initialOrders);
    const existing = currentOrders.find((o) => o.id === id);
    const updated: Order = {
      ...(existing || ({} as Order)),
      id,
      status,
      updated_at: new Date().toISOString(),
    };

    const res = await safeFetchJson<Order>(
      `${API_BASE}/orders/${id}/status`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      },
      updated
    );

    const finalOrder = res.success ? res.data : updated;
    setLocal(
      STORAGE_KEYS.ORDERS,
      currentOrders.map((o) => (o.id === id ? finalOrder : o))
    );
    return finalOrder;
  },

  // ==========================================
  // OFFERS
  // ==========================================
  async getOffers(): Promise<Offer[]> {
    const local = getLocal<Offer[]>(STORAGE_KEYS.OFFERS, initialOffers);
    const res = await safeFetchJson<Offer[]>(`${API_BASE}/offers`, undefined, local);
    if (res.success && Array.isArray(res.data) && res.data.length > 0) {
      setLocal(STORAGE_KEYS.OFFERS, res.data);
      return res.data;
    }
    return local;
  },

  async createOffer(offer: Partial<Offer>): Promise<Offer> {
    const newOffer: Offer = {
      id: offer.id || `off-${Date.now()}`,
      title: offer.title || 'Special Promotion',
      description: offer.description || '',
      code: offer.code || 'SAVVIO10',
      discount_percentage: offer.discount_percentage || 10,
      start_date: offer.start_date || new Date().toISOString().split('T')[0],
      end_date: offer.end_date || '2025-12-31',
      is_active: offer.is_active ?? true,
      banner_text: offer.banner_text || '',
    };

    const res = await safeFetchJson<Offer>(
      `${API_BASE}/offers`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOffer),
      },
      newOffer
    );

    const finalOffer = res.success ? res.data : newOffer;
    const current = getLocal<Offer[]>(STORAGE_KEYS.OFFERS, initialOffers);
    setLocal(STORAGE_KEYS.OFFERS, [...current, finalOffer]);
    return finalOffer;
  },

  async updateOffer(id: string, offer: Partial<Offer>): Promise<Offer> {
    const current = getLocal<Offer[]>(STORAGE_KEYS.OFFERS, initialOffers);
    const existing = current.find((o) => o.id === id);
    const updated: Offer = { ...(existing || ({} as Offer)), ...offer, id };

    const res = await safeFetchJson<Offer>(
      `${API_BASE}/offers/${id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      },
      updated
    );

    const finalOffer = res.success ? res.data : updated;
    setLocal(
      STORAGE_KEYS.OFFERS,
      current.map((o) => (o.id === id ? finalOffer : o))
    );
    return finalOffer;
  },

  async deleteOffer(id: string): Promise<boolean> {
    const current = getLocal<Offer[]>(STORAGE_KEYS.OFFERS, initialOffers);
    setLocal(
      STORAGE_KEYS.OFFERS,
      current.filter((o) => o.id !== id)
    );
    await safeFetchJson(`${API_BASE}/offers/${id}`, { method: 'DELETE' });
    return true;
  },

  // ==========================================
  // BANNERS
  // ==========================================
  async getBanners(): Promise<Banner[]> {
    const local = getLocal<Banner[]>(STORAGE_KEYS.BANNERS, initialBanners);
    const res = await safeFetchJson<Banner[]>(`${API_BASE}/banners`, undefined, local);
    if (res.success && Array.isArray(res.data) && res.data.length > 0) {
      setLocal(STORAGE_KEYS.BANNERS, res.data);
      return res.data;
    }
    return local;
  },

  async updateBanner(id: string, banner: Partial<Banner>): Promise<Banner> {
    const current = getLocal<Banner[]>(STORAGE_KEYS.BANNERS, initialBanners);
    const existing = current.find((b) => b.id === id);
    const updated: Banner = { ...(existing || ({} as Banner)), ...banner, id };

    const res = await safeFetchJson<Banner>(
      `${API_BASE}/banners/${id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      },
      updated
    );

    const finalBanner = res.success ? res.data : updated;
    setLocal(
      STORAGE_KEYS.BANNERS,
      current.map((b) => (b.id === id ? finalBanner : b))
    );
    return finalBanner;
  },

  // ==========================================
  // SETTINGS
  // ==========================================
  async getSettings(): Promise<WebsiteSettings> {
    const local = getLocal<WebsiteSettings>(STORAGE_KEYS.SETTINGS, initialSettings);
    const res = await safeFetchJson<WebsiteSettings>(`${API_BASE}/settings`, undefined, local);
    if (res.success && res.data && res.data.brand_name) {
      setLocal(STORAGE_KEYS.SETTINGS, res.data);
      return res.data;
    }
    return local;
  },

  async updateSettings(settings: Partial<WebsiteSettings>): Promise<WebsiteSettings> {
    const current = getLocal<WebsiteSettings>(STORAGE_KEYS.SETTINGS, initialSettings);
    const updated: WebsiteSettings = { ...current, ...settings };

    const res = await safeFetchJson<WebsiteSettings>(
      `${API_BASE}/settings`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      },
      updated
    );

    const finalSettings = res.success ? res.data : updated;
    setLocal(STORAGE_KEYS.SETTINGS, finalSettings);
    return finalSettings;
  },

  // ==========================================
  // IMAGE UPLOADS
  // ==========================================
  async uploadImage(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData,
      });

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.url) return data.url;
      }
    } catch (err) {
      console.warn('Server upload unavailable, converting to local data URI:', err);
    }

    // Fallback: convert to base64 Data URL so images work seamlessly on static Vercel too!
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  },

  // ==========================================
  // ADMIN AUTH
  // ==========================================
  async login(
    email: string,
    password: string
  ): Promise<{ success: boolean; token: string; user: { email: string; name: string } }> {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        return data;
      }
    } catch {
      // Continue to fallback check below
    }

    // Client-side authentication fallback for static deployments (e.g. Vercel)
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail === 'admin@savvio.com' && password === 'savvio2025') {
      return {
        success: true,
        token: `savvio_token_${Date.now()}`,
        user: {
          email: 'admin@savvio.com',
          name: 'Store Owner',
        },
      };
    }

    throw new Error('Invalid email or password');
  },
};
