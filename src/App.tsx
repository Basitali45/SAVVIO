import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { HeroBanner } from './components/HeroBanner.tsx';
import { CategoryPills } from './components/CategoryPills.tsx';
import { ProductCard } from './components/ProductCard.tsx';
import { ProductDetailModal } from './components/ProductDetailModal.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { WhySavvio } from './components/WhySavvio.tsx';
import { Footer } from './components/Footer.tsx';
import { FloatingWhatsApp } from './components/FloatingWhatsApp.tsx';
import { SearchModal } from './components/SearchModal.tsx';
import { AdminLogin } from './components/admin/AdminLogin.tsx';
import { AdminDashboard } from './components/admin/AdminDashboard.tsx';
import { Product, Category, Banner, WebsiteSettings, CartItem } from './types.ts';
import { api } from './services/api.ts';
import { initialSettings, initialBanners, initialCategories, initialProducts } from './data/initialData.ts';

export default function App() {
  // App routing / view mode
  const [isAdminView, setIsAdminView] = useState(() => {
    return window.location.hash === '#admin' || window.location.pathname === '/admin';
  });
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return localStorage.getItem('savvio_admin_token');
  });

  // Storefront Data
  const [settings, setSettings] = useState<WebsiteSettings>(initialSettings);
  const [banner, setBanner] = useState<Banner>(initialBanners[0]);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(true);

  // Active Filter
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Interactive Overlays
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Shopping Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('savvio_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('savvio_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error(e);
    }
  }, [cartItems]);

  // Handle URL hash changes for #admin
  useEffect(() => {
    const handleHashChange = () => {
      setIsAdminView(window.location.hash === '#admin');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Fetch live store data from backend API
  useEffect(() => {
    fetchStoreData();
  }, []);

  const fetchStoreData = async () => {
    try {
      const [sett, bans, cats, prods] = await Promise.all([
        api.getSettings(),
        api.getBanners(),
        api.getCategories(),
        api.getProducts(),
      ]);
      if (sett) setSettings(sett);
      if (bans && bans.length > 0) setBanner(bans[0]);
      if (cats && cats.length > 0) setCategories(cats);
      if (prods && prods.length > 0) setProducts(prods);
    } catch (err) {
      console.warn('Using initial seed data due to server handshake:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cart operations
  const handleAddToCart = (
    product: Product,
    selectedSize: string,
    selectedColor: string,
    quantity: number = 1
  ) => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (it) =>
          it.product.id === product.id &&
          it.selectedSize === selectedSize &&
          it.selectedColor === selectedColor
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += quantity;
        return updated;
      } else {
        return [...prev, { product, selectedSize, selectedColor, quantity }];
      }
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveFromCart(index);
      return;
    }
    setCartItems((prev) => {
      const updated = [...prev];
      updated[index].quantity = newQty;
      return updated;
    });
  };

  const handleRemoveFromCart = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Navigation filter
  const handleCategorySelect = (slug: string) => {
    setActiveCategory(slug);
    // Smooth scroll down to catalog section if clicking category from header
    const catalogEl = document.getElementById('bestsellers');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Filtered Products
  const displayedProducts = products.filter((p) => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'new-arrivals') return p.is_new_arrival;
    if (activeCategory === 'hoodies') return p.category_id === 'cat-hoodies' || p.category_name.toLowerCase().includes('hoodie');
    if (activeCategory === 'tracksuits') return p.category_id === 'cat-tracksuits' || p.category_name.toLowerCase().includes('tracksuit');
    if (activeCategory === 'quarter-zips') return p.category_id === 'cat-quarter-zips' || p.category_name.toLowerCase().includes('quarter');
    return p.category_id === activeCategory || p.category_name.toLowerCase() === activeCategory.toLowerCase();
  });

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // If viewing Admin Route
  if (isAdminView) {
    if (!adminToken) {
      return (
        <AdminLogin
          onSuccess={(token) => {
            setAdminToken(token);
            localStorage.setItem('savvio_admin_token', token);
          }}
          onBackToStore={() => {
            window.location.hash = '';
            setIsAdminView(false);
          }}
        />
      );
    }

    return (
      <AdminDashboard
        onLogout={() => {
          setAdminToken(null);
          localStorage.removeItem('savvio_admin_token');
          window.location.hash = '';
          setIsAdminView(false);
        }}
        onViewStore={() => {
          window.location.hash = '';
          setIsAdminView(false);
          fetchStoreData();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-neutral-900 selection:bg-neutral-900 selection:text-white">
      
      {/* 1. Header with Top Announcement Bar */}
      <Header
        settings={settings}
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onSelectCategory={handleCategorySelect}
        activeCategory={activeCategory}
        onOpenAdmin={() => {
          window.location.hash = 'admin';
          setIsAdminView(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        
        {/* 2. Hero Promotional Campaign Banner */}
        <HeroBanner
          banner={banner}
          settings={settings}
          onShopNow={() => {
            const el = document.getElementById('bestsellers');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* 3. Category Filter Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <CategoryPills
            categories={categories}
            activeCategory={activeCategory}
            onSelectCategory={handleCategorySelect}
          />
        </div>

        {/* 4. Product Catalog / Bestsellers Grid */}
        <section id="bestsellers" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          
          {/* Section Title matching desktop reference */}
          <div className="text-center mb-10">
            <h2 className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl tracking-widest uppercase text-neutral-950">
              {activeCategory === 'all'
                ? 'BESTSELLERS'
                : activeCategory.toUpperCase().replace('-', ' ')}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1 uppercase tracking-wider font-medium">
              Shop our most loved hoodies & tracksuits
            </p>
            <div className="w-12 h-0.5 bg-neutral-950 mx-auto mt-3" />
          </div>

          {/* Product Grid: 4-col desktop, 2-col tablet/mobile matching reference */}
          {displayedProducts.length === 0 ? (
            <div className="py-20 text-center text-xs text-neutral-500 bg-white rounded-2xl border border-neutral-200">
              No products found in this category. Check back soon for new drops.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={(p) => setSelectedProduct(p)}
                  onAddToCart={(p, sz, clr) => handleAddToCart(p, sz, clr, 1)}
                  whatsappNumber={settings.whatsapp_number}
                />
              ))}
            </div>
          )}
        </section>

        {/* 5. Brand Identity & Why SAVVIO Strip */}
        <WhySavvio />

      </main>

      {/* 6. Footer */}
      <Footer
        settings={settings}
        onOpenAdmin={() => {
          window.location.hash = 'admin';
          setIsAdminView(true);
        }}
        onSelectCategory={handleCategorySelect}
      />

      {/* 7. Floating WhatsApp Button */}
      <FloatingWhatsApp
        whatsappNumber={settings.whatsapp_number}
        enabled={settings.floating_whatsapp_enabled}
      />

      {/* 8. Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        settings={settings}
      />

      {/* 9. Product Details Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          settings={settings}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={(p, sz, clr, qty) => {
            handleAddToCart(p, sz, clr, qty);
            setSelectedProduct(null);
          }}
        />
      )}

      {/* 10. Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={products}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />

    </div>
  );
}
