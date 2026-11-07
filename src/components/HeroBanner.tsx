import React from 'react';
import { ArrowRight, Instagram, Phone } from 'lucide-react';
import { Banner, WebsiteSettings } from '../types.ts';

interface HeroBannerProps {
  banner: Banner;
  settings: WebsiteSettings;
  onShopNow: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ banner, settings, onShopNow }) => {
  if (!banner.is_active) return null;

  return (
    <section className="relative w-full overflow-hidden bg-neutral-900">
      {/* Container with exact aspect ratio and framing */}
      <div className="relative w-full min-h-[380px] sm:min-h-[460px] md:min-h-[540px] lg:min-h-[600px] flex items-center justify-center">
        {/* Background Image */}
        <img
          src={banner.image_url || '/assets/aistudio/image_8d69a9cd.png'}
          alt="SAVVIO New Season Campaign"
          className="absolute inset-0 w-full h-full object-cover object-center"
          referrerPolicy="no-referrer"
        />

        {/* Subtle cinematic gradient overlay for high text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/30 pointer-events-none" />

        {/* Top SAVVIO brand wordmark overlay inside hero */}
        <div className="absolute top-6 left-6 md:top-8 md:left-12 z-10 pointer-events-none">
          <span className="font-brand text-2xl md:text-3xl font-black text-white/90 tracking-widest drop-shadow-md">
            SAVVIO
          </span>
        </div>

        {/* Center Content Typography & CTA */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center justify-center">
          {banner.tag && (
            <span className="inline-block text-xs md:text-sm font-bold tracking-[0.25em] text-white/90 uppercase mb-2 drop-shadow-sm">
              {banner.tag}
            </span>
          )}

          <h1 className="font-heading font-black text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-white tracking-tight leading-none uppercase drop-shadow-lg">
            {banner.title || 'NEW SEASON'}
          </h1>
          
          <h2 className="font-heading font-black text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-yellow-400 tracking-tight leading-none uppercase mt-1 drop-shadow-lg">
            {banner.subtitle || 'NEW FIT!'}
          </h2>

          <div className="mt-6 sm:mt-8">
            <button
              onClick={onShopNow}
              className="group inline-flex items-center gap-3 px-8 py-3.5 sm:px-10 sm:py-4 bg-neutral-950/90 hover:bg-neutral-950 text-white font-semibold text-sm sm:text-base rounded-full shadow-2xl hover:shadow-black/60 transition-all duration-300 hover:scale-105 border border-white/20 cursor-pointer backdrop-blur-xs"
            >
              <span>{banner.button_text || 'Shop Now'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Bottom Social Bar in Hero - Exact replication of reference banner */}
        <div className="absolute bottom-4 left-0 right-0 z-10 px-6 sm:px-12 flex items-center justify-between text-xs text-white/90 pointer-events-auto">
          <a
            href={settings.instagram_url || 'https://instagram.com/savvioclothingco'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-black/50 hover:bg-black/75 px-3 py-1.5 rounded-full backdrop-blur-xs transition-colors"
          >
            <Instagram className="w-3.5 h-3.5" />
            <span className="font-medium">savvioclothingco.</span>
          </a>

          <a
            href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-black/50 hover:bg-black/75 px-3 py-1.5 rounded-full backdrop-blur-xs transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-medium">{settings.whatsapp_number}</span>
          </a>
        </div>
      </div>
    </section>
  );
};
