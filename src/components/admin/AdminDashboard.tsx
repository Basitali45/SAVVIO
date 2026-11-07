import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Megaphone,
  Settings as SettingsIcon,
  LogOut,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Search,
  Eye,
  Database,
  CheckCircle,
  Copy,
  Check,
  AlertCircle,
  TrendingUp,
  Clock,
  Sparkles,
  Upload
} from 'lucide-react';
import { Product, Category, Order, Offer, Banner, WebsiteSettings, OrderStatus } from '../../types.ts';
import { api } from '../../services/api.ts';
import { ProductFormModal } from './ProductFormModal.tsx';
import { OrderDetailsModal } from './OrderDetailsModal.tsx';

interface AdminDashboardProps {
  onLogout: () => void;
  onViewStore: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, onViewStore }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'categories' | 'orders' | 'campaigns' | 'settings'>('overview');

  // Core Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);

  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState('');

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Filters & Search
  const [productSearch, setProductSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  // Category Form Inline State
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Offer Form Inline State
  const [newOfferCode, setNewOfferCode] = useState('');
  const [newOfferDiscount, setNewOfferDiscount] = useState(15);
  const [newOfferTitle, setNewOfferTitle] = useState('');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [prods, cats, ords, offs, bans, sett] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
        api.getOrders(),
        api.getOffers(),
        api.getBanners(),
        api.getSettings(),
      ]);
      setProducts(prods);
      setCategories(cats);
      setOrders(ords);
      setOffers(offs);
      setBanners(bans);
      setSettings(sett);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Product Actions
  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.deleteProduct(id);
      setProducts(products.filter((p) => p.id !== id));
      showToast('Product deleted successfully');
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  // Category Actions
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      const newCat = await api.createCategory({
        name: newCatName.trim(),
        description: newCatDesc.trim(),
        image_url: '/assets/aistudio/image_3d1d334e.png',
      });
      setCategories([...categories, newCat]);
      setNewCatName('');
      setNewCatDesc('');
      showToast('Category created successfully');
    } catch (err) {
      alert('Failed to create category');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try {
      await api.deleteCategory(id);
      setCategories(categories.filter((c) => c.id !== id));
      showToast('Category deleted');
    } catch (err) {
      alert('Failed to delete category');
    }
  };

  // Offer Actions
  const handleAddOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOfferCode.trim() || !newOfferTitle.trim()) return;
    try {
      const created = await api.createOffer({
        code: newOfferCode.trim().toUpperCase(),
        title: newOfferTitle.trim(),
        discount_percentage: Number(newOfferDiscount),
        start_date: new Date().toISOString().split('T')[0],
        end_date: '2025-12-31',
        is_active: true,
        banner_text: `${newOfferTitle}: Use code ${newOfferCode.trim().toUpperCase()} for ${newOfferDiscount}% OFF!`,
      });
      setOffers([...offers, created]);
      setNewOfferCode('');
      setNewOfferTitle('');
      showToast('Offer created successfully');
    } catch (err) {
      alert('Failed to create offer');
    }
  };

  const handleDeleteOffer = async (id: string) => {
    try {
      await api.deleteOffer(id);
      setOffers(offers.filter((o) => o.id !== id));
      showToast('Offer deleted');
    } catch (err) {
      alert('Failed to delete offer');
    }
  };

  // Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      const updated = await api.updateSettings(settings);
      setSettings(updated);
      showToast('Website settings saved and live!');
    } catch (err) {
      alert('Failed to save settings');
    }
  };

  // Banner Save
  const handleSaveBanner = async (banner: Banner) => {
    try {
      const updated = await api.updateBanner(banner.id, banner);
      setBanners(banners.map((b) => (b.id === banner.id ? updated : b)));
      showToast('Banner updated and live on storefront!');
    } catch (err) {
      alert('Failed to update banner');
    }
  };

  const showToast = (msg: string) => {
    setSaveSuccess(msg);
    setTimeout(() => setSaveSuccess(''), 3000);
  };

  // Metrics
  const totalSales = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total_amount : 0), 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const confirmedOrders = orders.filter((o) => o.status === 'confirmed').length;
  const lowStockCount = products.filter((p) => p.stock_quantity <= 5).length;

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category_name?.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter === 'all') return true;
    return o.status === orderStatusFilter;
  });

  // Order Status Update directly from menu / select
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const updated = await api.updateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      showToast(`Order status updated to ${newStatus.toUpperCase()}`);
    } catch (err) {
      alert('Failed to update order status');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col md:flex-row text-neutral-900 font-sans">
      
      {/* Toast Notification */}
      {saveSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-neutral-950 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-neutral-950 text-white shrink-0 flex flex-col justify-between border-r border-neutral-800">
        <div>
          {/* Logo & Brand Header */}
          <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={settings?.logo_url || '/assets/aistudio/image_ea0f898d.png'}
                alt="SAVVIO"
                className="w-8 h-8 rounded-full bg-white p-0.5 object-contain"
              />
              <div>
                <span className="font-brand font-black text-lg tracking-widest text-white uppercase block leading-none">
                  SAVVIO
                </span>
                <span className="text-[10px] text-neutral-400 uppercase tracking-widest mt-1 block">
                  Admin Console
                </span>
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="p-4 space-y-1.5 text-xs font-semibold uppercase tracking-wider">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-neutral-800 text-white font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-neutral-800 text-white font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4" />
                <span>Products</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-neutral-800 text-neutral-300">
                {products.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'categories'
                  ? 'bg-neutral-800 text-white font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <FolderTree className="w-4 h-4" />
              <span>Categories</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-neutral-800 text-white font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-4 h-4" />
                <span>Orders</span>
              </div>
              {pendingOrders > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-neutral-950 font-bold">
                  {pendingOrders} new
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('campaigns')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'campaigns'
                  ? 'bg-neutral-800 text-white font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <Megaphone className="w-4 h-4" />
              <span>Banners & Offers</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-neutral-800 text-white font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <SettingsIcon className="w-4 h-4" />
              <span>Website Settings</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-neutral-800 space-y-2">
          <button
            onClick={onViewStore}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-semibold rounded-lg transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Public Store</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-neutral-400 hover:text-red-400 text-xs font-semibold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content View */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8">
        
        {/* =====================================================================
            TAB 1: OVERVIEW METRICS
        ===================================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-heading font-black text-2xl uppercase tracking-wider text-neutral-950">
                  Store Overview
                </h1>
                <p className="text-xs text-neutral-500">
                  Real-time sales, order fulfillment status, and catalog health.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setSelectedProduct(null);
                    setIsProductModalOpen(true);
                  }}
                  className="px-4 py-2 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product</span>
                </button>
              </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 bg-white rounded-xl border border-neutral-200 shadow-xs">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Sales</span>
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-neutral-950 tabular-nums">
                  PKR {totalSales.toLocaleString()}
                </div>
                <span className="text-[11px] text-neutral-500 mt-1 block">
                  Across {orders.length} lifetime orders
                </span>
              </div>

              <div className="p-5 bg-white rounded-xl border border-neutral-200 shadow-xs">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Pending Orders</span>
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-black text-neutral-950 tabular-nums">
                  {pendingOrders}
                </div>
                <span className="text-[11px] text-amber-600 font-medium mt-1 block">
                  Require WhatsApp confirmation
                </span>
              </div>

              <div className="p-5 bg-white rounded-xl border border-neutral-200 shadow-xs">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Active Products</span>
                  <Package className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-black text-neutral-950 tabular-nums">
                  {products.length}
                </div>
                <span className="text-[11px] text-neutral-500 mt-1 block">
                  Across {categories.length} categories
                </span>
              </div>

              <div className="p-5 bg-white rounded-xl border border-neutral-200 shadow-xs">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Stock Alerts</span>
                  <AlertCircle className="w-4 h-4 text-red-500" />
                </div>
                <div className="text-2xl font-black text-neutral-950 tabular-nums">
                  {lowStockCount}
                </div>
                <span className="text-[11px] text-red-600 font-medium mt-1 block">
                  Items with low inventory
                </span>
              </div>
            </div>

            {/* Recent Orders Overview */}
            <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
                <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-neutral-900">
                  Recent Orders
                </h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-semibold text-neutral-600 hover:text-neutral-950 uppercase"
                >
                  View All Orders →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 text-neutral-500 font-semibold uppercase tracking-wider border-b border-neutral-200">
                    <tr>
                      <th className="p-3.5">Order Ref</th>
                      <th className="p-3.5">Customer</th>
                      <th className="p-3.5">City</th>
                      <th className="p-3.5">Items</th>
                      <th className="p-3.5">Total Amount</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 font-medium">
                    {orders.slice(0, 5).map((ord) => (
                      <tr key={ord.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="p-3.5 font-bold text-neutral-900">{ord.order_number}</td>
                        <td className="p-3.5">{ord.customer_name}</td>
                        <td className="p-3.5 text-neutral-500">{ord.city}</td>
                        <td className="p-3.5">{ord.items?.length || 1} item(s)</td>
                        <td className="p-3.5 font-bold tabular-nums">PKR {ord.total_amount.toLocaleString()}</td>
                        <td className="p-3.5">
                          <select
                            value={ord.status}
                            onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value as OrderStatus)}
                            className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border transition-colors cursor-pointer focus:outline-hidden ${
                              ord.status === 'delivered'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : ord.status === 'shipped'
                                ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
                                : ord.status === 'processing'
                                ? 'bg-purple-50 text-purple-800 border-purple-300'
                                : ord.status === 'confirmed'
                                ? 'bg-blue-50 text-blue-800 border-blue-300'
                                : ord.status === 'pending'
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : 'bg-red-50 text-red-800 border-red-300'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => setSelectedOrder(ord)}
                            className="p-1 hover:bg-neutral-200 rounded text-neutral-600"
                            title="View Order"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 2: PRODUCT MANAGEMENT
        ===================================================================== */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-heading font-black text-2xl uppercase tracking-wider text-neutral-950">
                  Product Management
                </h1>
                <p className="text-xs text-neutral-500">
                  Add, edit, upload multi-angle images, set prices, and manage stock inventory.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setSelectedProduct(null);
                    setIsProductModalOpen(true);
                  }}
                  className="px-4 py-2 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product</span>
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search products by title or category..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-lg bg-white focus:outline-hidden focus:border-neutral-900"
              />
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 text-neutral-500 font-semibold uppercase tracking-wider border-b border-neutral-200">
                    <tr>
                      <th className="p-3.5">Image</th>
                      <th className="p-3.5">Title & Variants</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Sale Price</th>
                      <th className="p-3.5">Regular Price</th>
                      <th className="p-3.5">Discount</th>
                      <th className="p-3.5">Stock</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 font-medium">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="p-3.5">
                          <img
                            src={p.images[0] || '/assets/aistudio/image_3d1d334e.png'}
                            alt={p.name}
                            className="w-12 h-12 object-contain rounded-md bg-neutral-100 p-1 border border-neutral-200"
                          />
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-neutral-900 line-clamp-1">{p.name}</div>
                          <div className="text-[10px] text-neutral-400 mt-0.5">
                            Sizes: {p.sizes?.join(', ')} · {p.images?.length || 1} image(s)
                          </div>
                        </td>
                        <td className="p-3.5 text-neutral-600">{p.category_name}</td>
                        <td className="p-3.5 font-bold text-neutral-950 tabular-nums">
                          PKR {p.sale_price.toLocaleString()}
                        </td>
                        <td className="p-3.5 text-neutral-400 line-through tabular-nums">
                          PKR {p.regular_price?.toLocaleString() || '-'}
                        </td>
                        <td className="p-3.5 text-red-600 font-bold">
                          {p.discount_percentage ? `${p.discount_percentage}% OFF` : '-'}
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            p.stock_quantity > 5 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                          }`}>
                            {p.stock_quantity} in stock
                          </span>
                        </td>
                        <td className="p-3.5">
                          {p.is_featured && (
                            <span className="mr-1 px-1.5 py-0.5 rounded-xs bg-amber-100 text-amber-800 text-[9px] font-bold uppercase">
                              Featured
                            </span>
                          )}
                          {p.is_new_arrival && (
                            <span className="px-1.5 py-0.5 rounded-xs bg-neutral-900 text-white text-[9px] font-bold uppercase">
                              New
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-right space-x-1">
                          <button
                            onClick={() => {
                              setSelectedProduct(p);
                              setIsProductModalOpen(true);
                            }}
                            className="p-1.5 hover:bg-neutral-200 rounded-md text-neutral-700 transition-colors"
                            title="Edit Product"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 hover:bg-red-100 rounded-md text-red-600 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 3: CATEGORIES
        ===================================================================== */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div>
              <h1 className="font-heading font-black text-2xl uppercase tracking-wider text-neutral-950">
                Category Management
              </h1>
              <p className="text-xs text-neutral-500">
                Create and organize collections for hoodies, tracksuits, and seasonal lines.
              </p>
            </div>

            {/* Add Category Form */}
            <form onSubmit={handleAddCategory} className="p-5 bg-white rounded-xl border border-neutral-200 shadow-xs space-y-3">
              <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-neutral-900">
                Create New Category
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Category Name (e.g. Winter Fleeces)"
                  className="px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-hidden focus:border-neutral-900"
                />
                <input
                  type="text"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Short Description..."
                  className="px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-hidden focus:border-neutral-900"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
              >
                Add Category
              </button>
            </form>

            {/* Categories List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <div key={cat.id} className="p-4 bg-white rounded-xl border border-neutral-200 shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={cat.image_url || '/assets/aistudio/image_3d1d334e.png'}
                      alt={cat.name}
                      className="w-12 h-12 object-contain rounded-lg bg-neutral-100 p-1 border border-neutral-200"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-neutral-900">{cat.name}</h4>
                      <p className="text-[11px] text-neutral-400 line-clamp-1">{cat.description || cat.slug}</p>
                      <span className="text-[10px] text-neutral-500 font-semibold">
                        {products.filter((p) => p.category_id === cat.id).length} products
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="p-1.5 text-neutral-400 hover:text-red-600 rounded"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 4: ORDERS MANAGEMENT
        ===================================================================== */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-heading font-black text-2xl uppercase tracking-wider text-neutral-950">
                  Orders & WhatsApp Fulfillment
                </h1>
                <p className="text-xs text-neutral-500">
                  Track customer orders, verify Cash on Delivery dispatches, and update fulfillment status.
                </p>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex flex-wrap gap-1 bg-white p-1 rounded-lg border border-neutral-200 text-xs">
                {['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderStatusFilter(st)}
                    className={`px-3 py-1 rounded-md uppercase tracking-wider font-semibold transition-colors ${
                      orderStatusFilter === st
                        ? 'bg-neutral-950 text-white'
                        : 'text-neutral-600 hover:text-neutral-950'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 text-neutral-500 font-semibold uppercase tracking-wider border-b border-neutral-200">
                    <tr>
                      <th className="p-3.5">Order ID</th>
                      <th className="p-3.5">Date</th>
                      <th className="p-3.5">Customer Name</th>
                      <th className="p-3.5">Phone (WhatsApp)</th>
                      <th className="p-3.5">City & Address</th>
                      <th className="p-3.5">Total (COD)</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">View / Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 font-medium">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-neutral-400">
                          No orders found under &ldquo;{orderStatusFilter}&rdquo;.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-neutral-50/80 transition-colors">
                          <td className="p-3.5 font-bold text-neutral-900">{ord.order_number}</td>
                          <td className="p-3.5 text-neutral-400">
                            {new Date(ord.created_at).toLocaleDateString()}
                          </td>
                          <td className="p-3.5 font-semibold text-neutral-800">{ord.customer_name}</td>
                          <td className="p-3.5 text-emerald-700 font-medium">{ord.customer_phone}</td>
                          <td className="p-3.5 text-neutral-500 max-w-xs truncate">
                            {ord.city} · {ord.delivery_address}
                          </td>
                          <td className="p-3.5 font-bold tabular-nums text-neutral-950">
                            PKR {ord.total_amount.toLocaleString()}
                          </td>
                          <td className="p-3.5">
                            <select
                              value={ord.status}
                              onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value as OrderStatus)}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition-colors cursor-pointer focus:outline-hidden ${
                                ord.status === 'delivered'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : ord.status === 'shipped'
                                  ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
                                  : ord.status === 'processing'
                                  ? 'bg-purple-50 text-purple-800 border-purple-300'
                                  : ord.status === 'confirmed'
                                  ? 'bg-blue-50 text-blue-800 border-blue-300'
                                  : ord.status === 'pending'
                                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                                  : 'bg-red-50 text-red-800 border-red-300'
                              }`}
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => setSelectedOrder(ord)}
                              className="px-3 py-1 bg-neutral-900 hover:bg-neutral-800 text-white rounded-md text-[11px] font-semibold uppercase tracking-wider transition-colors"
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 5: CAMPAIGNS, BANNERS & OFFERS
        ===================================================================== */}
        {activeTab === 'campaigns' && (
          <div className="space-y-8">
            <div>
              <h1 className="font-heading font-black text-2xl uppercase tracking-wider text-neutral-950">
                Banners & Promo Campaigns
              </h1>
              <p className="text-xs text-neutral-500">
                Update homepage hero campaign, top announcement bar text & colors, and seasonal discount vouchers.
              </p>
            </div>

            {/* 1. Hero Banner Management */}
            {banners.length > 0 && (
              <div className="p-6 bg-white rounded-xl border border-neutral-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-neutral-900">
                    Homepage Hero Banner
                  </h3>
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={banners[0].is_active}
                      onChange={(e) => {
                        const updated = { ...banners[0], is_active: e.target.checked };
                        handleSaveBanner(updated);
                      }}
                      className="w-4 h-4 rounded-sm text-neutral-950"
                    />
                    <span>Banner Active</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                      Main Heading (Line 1)
                    </label>
                    <input
                      type="text"
                      value={banners[0].title}
                      onChange={(e) => {
                        setBanners([{ ...banners[0], title: e.target.value }]);
                      }}
                      placeholder="NEW SEASON"
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                      Subtitle / Highlight (Line 2)
                    </label>
                    <input
                      type="text"
                      value={banners[0].subtitle}
                      onChange={(e) => {
                        setBanners([{ ...banners[0], subtitle: e.target.value }]);
                      }}
                      placeholder="NEW FIT!"
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg font-bold text-amber-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                      CTA Button Text
                    </label>
                    <input
                      type="text"
                      value={banners[0].button_text}
                      onChange={(e) => {
                        setBanners([{ ...banners[0], button_text: e.target.value }]);
                      }}
                      placeholder="Shop Now"
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                      Banner Image URL
                    </label>
                    <input
                      type="text"
                      value={banners[0].image_url}
                      onChange={(e) => {
                        setBanners([{ ...banners[0], image_url: e.target.value }]);
                      }}
                      placeholder="/assets/aistudio/image_8d69a9cd.png"
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg font-mono text-[11px]"
                    />
                  </div>
                </div>

                {/* Banner Preview Thumbnail */}
                <div className="relative aspect-16/6 rounded-lg overflow-hidden border border-neutral-200 bg-neutral-900">
                  <img
                    src={banners[0].image_url || '/assets/aistudio/image_8d69a9cd.png'}
                    alt="Hero Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-center p-4">
                    <div>
                      <div className="text-xl sm:text-2xl font-black text-white uppercase">{banners[0].title}</div>
                      <div className="text-lg sm:text-xl font-black text-yellow-400 uppercase">{banners[0].subtitle}</div>
                      <div className="mt-2 inline-block px-4 py-1 bg-black/80 text-white rounded-full text-xs font-semibold">
                        {banners[0].button_text}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSaveBanner(banners[0])}
                  className="px-5 py-2 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                >
                  Save Hero Banner Changes
                </button>
              </div>
            )}

            {/* 2. Top Announcement Bar */}
            {settings && (
              <div className="p-6 bg-white rounded-xl border border-neutral-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-neutral-900">
                    Top Announcement Bar
                  </h3>
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.announcement_bar_enabled}
                      onChange={(e) =>
                        setSettings({ ...settings, announcement_bar_enabled: e.target.checked })
                      }
                      className="w-4 h-4 rounded-sm text-neutral-950"
                    />
                    <span>Announcement Bar Active</span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                    Announcement Text
                  </label>
                  <input
                    type="text"
                    value={settings.announcement_text}
                    onChange={(e) => setSettings({ ...settings, announcement_text: e.target.value })}
                    placeholder="FREE DELIVERY OVER PKR 5000 | CASH ON DELIVERY AVAILABLE"
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                      Background Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={settings.announcement_bg_color || '#000000'}
                        onChange={(e) => setSettings({ ...settings, announcement_bg_color: e.target.value })}
                        className="w-10 h-8 rounded-sm cursor-pointer border border-neutral-300"
                      />
                      <span className="font-mono text-xs">{settings.announcement_bg_color || '#000000'}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                      Text Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={settings.announcement_text_color || '#FFFFFF'}
                        onChange={(e) => setSettings({ ...settings, announcement_text_color: e.target.value })}
                        className="w-10 h-8 rounded-sm cursor-pointer border border-neutral-300"
                      />
                      <span className="font-mono text-xs">{settings.announcement_text_color || '#FFFFFF'}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveSettings}
                  className="px-5 py-2 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                >
                  Save Announcement Bar
                </button>
              </div>
            )}

            {/* 3. Discount Offers */}
            <div className="p-6 bg-white rounded-xl border border-neutral-200 shadow-xs space-y-4">
              <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-neutral-900">
                Discount Coupons & Promo Codes
              </h3>

              <form onSubmit={handleAddOffer} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <input
                  type="text"
                  required
                  value={newOfferCode}
                  onChange={(e) => setNewOfferCode(e.target.value)}
                  placeholder="Coupon Code (e.g. SAVVIO20)"
                  className="px-3 py-2 text-xs border border-neutral-300 rounded-lg uppercase"
                />
                <input
                  type="text"
                  required
                  value={newOfferTitle}
                  onChange={(e) => setNewOfferTitle(e.target.value)}
                  placeholder="Campaign Title"
                  className="px-3 py-2 text-xs border border-neutral-300 rounded-lg sm:col-span-2"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={newOfferDiscount}
                    onChange={(e) => setNewOfferDiscount(parseInt(e.target.value, 10) || 0)}
                    placeholder="Discount %"
                    className="w-20 px-3 py-2 text-xs border border-neutral-300 rounded-lg font-bold"
                  />
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-neutral-950 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-neutral-800"
                  >
                    Create
                  </button>
                </div>
              </form>

              <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-lg overflow-hidden">
                {offers.map((off) => (
                  <div key={off.id} className="p-3.5 flex items-center justify-between text-xs bg-white">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold bg-neutral-100 px-2 py-0.5 rounded text-neutral-900">
                          {off.code}
                        </span>
                        <span className="font-semibold text-neutral-800">{off.title}</span>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-0.5">{off.description || off.banner_text}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-bold text-red-600">{off.discount_percentage}% OFF</span>
                      <button
                        onClick={() => handleDeleteOffer(off.id)}
                        className="text-neutral-400 hover:text-red-600"
                        title="Delete coupon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 6: WEBSITE SETTINGS & CLOUD DATABASE
        ===================================================================== */}
        {activeTab === 'settings' && settings && (
          <div className="space-y-8 max-w-4xl">
            <div>
              <h1 className="font-heading font-black text-2xl uppercase tracking-wider text-neutral-950">
                Storefront Settings & Database
              </h1>
              <p className="text-xs text-neutral-500">
                Brand info, official WhatsApp number, Instagram profile URL, and Supabase cloud setup.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="p-6 bg-white rounded-xl border border-neutral-200 shadow-xs space-y-6">
              
              {/* General Store Identity */}
              <div className="space-y-4">
                <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-neutral-900 pb-2 border-b border-neutral-100">
                  Brand Identity & Contact
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                      Brand Name
                    </label>
                    <input
                      type="text"
                      value={settings.brand_name}
                      onChange={(e) => setSettings({ ...settings, brand_name: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                      Official WhatsApp Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={settings.whatsapp_number}
                      onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                      placeholder="03105946699"
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg font-semibold text-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                      Instagram Profile URL
                    </label>
                    <input
                      type="url"
                      value={settings.instagram_url}
                      onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
                      placeholder="https://instagram.com/savvioclothingco"
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                      Support Email
                    </label>
                    <input
                      type="email"
                      value={settings.contact_email}
                      onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                      placeholder="support@savvio.com"
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                      Free Shipping Threshold (PKR)
                    </label>
                    <input
                      type="number"
                      value={settings.free_delivery_threshold}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          free_delivery_threshold: parseInt(e.target.value, 10) || 5000,
                        })
                      }
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                      Standard Delivery Charges (PKR)
                    </label>
                    <input
                      type="number"
                      value={settings.delivery_charges !== undefined ? settings.delivery_charges : 300}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          delivery_charges: parseInt(e.target.value, 10) || 0,
                        })
                      }
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                      Floating WhatsApp Button
                    </label>
                    <div className="pt-2">
                      <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.floating_whatsapp_enabled}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              floating_whatsapp_enabled: e.target.checked,
                            })
                          }
                          className="w-4 h-4 rounded-sm text-neutral-900"
                        />
                        <span>Enable floating pulse WhatsApp button</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                    SAVVIO Official Logo Image Path / URL
                  </label>
                  <input
                    type="text"
                    value={settings.logo_url}
                    onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                    Return & Exchange Policy Text
                  </label>
                  <textarea
                    rows={2}
                    value={settings.return_policy}
                    onChange={(e) => setSettings({ ...settings, return_policy: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                    Delivery Information Text
                  </label>
                  <textarea
                    rows={2}
                    value={settings.delivery_info}
                    onChange={(e) => setSettings({ ...settings, delivery_info: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
                  />
                </div>
              </div>



              <div className="pt-4 border-t border-neutral-200">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-md transition-colors cursor-pointer"
                >
                  Save Storefront Settings
                </button>
              </div>

            </form>
          </div>
        )}

      </main>

      {/* Product Add / Edit Modal */}
      {isProductModalOpen && (
        <ProductFormModal
          isOpen={isProductModalOpen}
          onClose={() => {
            setIsProductModalOpen(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
          categories={categories}
          onSaved={loadAllData}
        />
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdated={loadAllData}
        />
      )}

    </div>
  );
};
