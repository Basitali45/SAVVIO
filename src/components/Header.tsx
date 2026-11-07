import React, { useState } from 'react';
import { ShoppingBag, Search, Menu, X, ArrowRight, ShieldCheck, Instagram, Phone } from 'lucide-react';
import { WebsiteSettings } from '../types.ts';

interface HeaderProps {
  settings: WebsiteSettings;
  cartCount: number;
  onOpenCart: () => void;
  onOpenSearch: () => void;
  onSelectCategory: (categorySlug: string) => void;
  activeCategory: string;
  onOpenAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  cartCount,
  onOpenCart,
  onOpenSearch,
  onSelectCategory,
  activeCategory,
  onOpenAdmin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', slug: 'all' },
    { name: 'Hoodies', slug: 'hoodies' },
    { name: 'Tracksuits', slug: 'tracksuits' },
    { name: 'Quarter-Zips', slug: 'quarter-zips' },
    { name: 'New Arrivals', slug: 'new-arrivals' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-xs">
      {/* Top Announcement Bar */}
      {settings.announcement_bar_enabled && settings.announcement_text && (
        <div
          style={{
            backgroundColor: settings.announcement_bg_color || '#000000',
            color: settings.announcement_text_color || '#FFFFFF',
          }}
          className="py-2 px-4 text-center text-xs tracking-wider uppercase font-medium flex items-center justify-center gap-2 transition-colors duration-300"
        >
          <span>{settings.announcement_text}</span>
        </div>
      )}

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Left: Brand Identity */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectCategory('all')}
              className="group flex items-center gap-3 text-left focus:outline-hidden"
              aria-label="SAVVIO Home"
            >
              <img
                src={settings.logo_url || '/assets/aistudio/image_ea0f898d.png'}
                alt="SAVVIO Emblem"
                className="w-10 h-10 object-contain rounded-full shadow-xs group-hover:scale-105 transition-transform"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="flex flex-col">
                <span className="font-brand text-2xl sm:text-3xl font-extrabold tracking-widest text-neutral-950 uppercase leading-none">
                  {settings.brand_name || 'SAVVIO'}
                </span>
                <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-medium mt-0.5">
                  Clothing Co.
                </span>
              </div>
            </button>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
            {navLinks.map((link) => {
              const isActive = activeCategory === link.slug;
              return (
                <button
                  key={link.slug}
                  onClick={() => onSelectCategory(link.slug)}
                  className={`relative py-2 text-sm uppercase tracking-wider transition-colors duration-200 cursor-pointer ${
                    isActive
                      ? 'text-neutral-950 font-semibold'
                      : 'text-neutral-600 hover:text-neutral-950'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-neutral-950 rounded-full" />
                  )}
                </button>
              );
            })}
            <a
              href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-600 hover:text-neutral-950 uppercase tracking-wider text-sm transition-colors"
            >
              Contact
            </a>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-4 sm:space-x-5">
            {/* Search Icon */}
            <button
              onClick={onOpenSearch}
              className="p-2 text-neutral-700 hover:text-neutral-950 transition-colors rounded-full hover:bg-neutral-100 cursor-pointer"
              aria-label="Search Catalog"
            >
              <Search className="w-5 h-5 stroke-[1.75]" />
            </button>

            {/* Shopping Cart Icon with Badge */}
            <button
              onClick={onOpenCart}
              className="relative p-2 text-neutral-950 hover:text-neutral-700 transition-colors rounded-full hover:bg-neutral-100 cursor-pointer"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.75]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-neutral-950 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-in zoom-in-50 duration-200">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Admin Portal discrete button */}
            <button
              onClick={onOpenAdmin}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold tracking-wider uppercase border border-neutral-300 rounded-md text-neutral-700 hover:border-neutral-900 hover:text-neutral-900 transition-colors"
              title="Admin Portal"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-neutral-800 hover:text-black rounded-lg focus:outline-hidden"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <button
                key={link.slug}
                onClick={() => {
                  onSelectCategory(link.slug);
                  setMobileMenuOpen(false);
                }}
                className={`text-left px-3 py-2.5 rounded-lg text-sm font-semibold tracking-wider uppercase transition-colors ${
                  activeCategory === link.slug
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-800 hover:bg-neutral-100'
                }`}
              >
                {link.name}
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-neutral-100 flex flex-col gap-2.5 text-sm text-neutral-600">
            <a
              href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-50 font-medium"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>WhatsApp: {settings.whatsapp_number}</span>
            </a>
            {settings.instagram_url && (
              <a
                href={settings.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-50 font-medium"
              >
                <Instagram className="w-4 h-4 text-pink-600" />
                <span>Instagram: @savvioclothingco</span>
              </a>
            )}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="flex items-center justify-between w-full px-3 py-2.5 mt-2 bg-neutral-100 text-neutral-900 rounded-lg font-semibold text-xs uppercase tracking-wider"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Store Admin Panel
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
