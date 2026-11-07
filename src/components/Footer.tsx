import React from 'react';
import { Instagram, Phone, ShieldCheck, Mail, MapPin } from 'lucide-react';
import { WebsiteSettings } from '../types.ts';

interface FooterProps {
  settings: WebsiteSettings;
  onOpenAdmin: () => void;
  onSelectCategory: (slug: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onOpenAdmin,
  onSelectCategory,
}) => {
  return (
    <footer className="w-full bg-neutral-950 text-white pt-16 pb-12 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-neutral-800/80">
          
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <img
                src={settings.logo_url || '/assets/aistudio/image_ea0f898d.png'}
                alt="SAVVIO Logo"
                className="w-10 h-10 object-contain rounded-full bg-white p-0.5"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="font-brand text-2xl font-black tracking-widest text-white uppercase">
                {settings.brand_name || 'SAVVIO'}
              </span>
            </div>
            <p className="text-xs text-neutral-400 max-w-sm leading-relaxed">
              {settings.footer_text || 'SAVVIO CLOTHING CO. — Luxury minimal streetwear, designed for the modern wardrobe.'}
            </p>
            <div className="pt-2 flex items-center gap-3 text-xs text-neutral-400">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
              <span>Nationwide Cash on Delivery (COD) Active</span>
            </div>
          </div>

          {/* Quick Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">
              Collections
            </h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>
                <button
                  onClick={() => onSelectCategory('hoodies')}
                  className="hover:text-white transition-colors"
                >
                  Heavyweight Hoodies
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('tracksuits')}
                  className="hover:text-white transition-colors"
                >
                  Athletic Tracksuits
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('quarter-zips')}
                  className="hover:text-white transition-colors"
                >
                  Fleece Quarter-Zips
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('new-arrivals')}
                  className="hover:text-white transition-colors"
                >
                  New Arrivals
                </button>
              </li>
            </ul>
          </div>

          {/* Social & Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">
              Direct Contact
            </h4>
            <div className="space-y-2.5 text-xs text-neutral-400">
              <a
                href={settings.instagram_url || 'https://instagram.com/savvioclothingco'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Instagram className="w-4 h-4 text-pink-400" />
                <span>savvioclothingco.</span>
              </a>

              <a
                href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>{settings.whatsapp_number}</span>
              </a>

              {settings.contact_email && (
                <div className="flex items-center gap-2 text-neutral-400">
                  <Mail className="w-4 h-4 text-neutral-500" />
                  <span>{settings.contact_email}</span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-500 gap-4">
          <p>
            © {new Date().getFullYear()} SAVVIO CLOTHING CO. · All rights reserved
          </p>

          <div className="flex items-center gap-6">
            <span className="hover:text-neutral-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-neutral-400 cursor-pointer">Terms & Conditions</span>
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 text-neutral-400 hover:text-white font-medium transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
