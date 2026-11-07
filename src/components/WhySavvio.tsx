import React from 'react';
import { ShieldCheck, RefreshCw, Banknote, Star } from 'lucide-react';

export const WhySavvio: React.FC = () => {
  return (
    <section className="w-full bg-[#F4F3EE] py-14 border-y border-neutral-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center mb-10">
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-widest uppercase text-neutral-950">
            WHY SAVVIO
          </h2>
          <div className="w-12 h-0.5 bg-neutral-900 mx-auto mt-2" />
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-4xl mx-auto">
          {/* Pillar 1 */}
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-white shadow-xs border border-neutral-200 flex items-center justify-center text-neutral-900 mb-3">
              <ShieldCheck className="w-6 h-6 stroke-[1.75]" />
            </div>
            <h3 className="font-heading font-bold text-sm sm:text-base uppercase tracking-wider text-neutral-950">
              Premium Fabric
            </h3>
            <p className="text-xs text-neutral-600 mt-1 max-w-xs leading-relaxed">
              High quality heavyweight cotton blend engineered for lasting comfort & durability.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-white shadow-xs border border-neutral-200 flex items-center justify-center text-neutral-900 mb-3">
              <RefreshCw className="w-6 h-6 stroke-[1.75]" />
            </div>
            <h3 className="font-heading font-bold text-sm sm:text-base uppercase tracking-wider text-neutral-950">
              Easy Returns
            </h3>
            <p className="text-xs text-neutral-600 mt-1 max-w-xs leading-relaxed">
              Hassle-free 7-day returns & doorstep size exchanges across all major cities.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-white shadow-xs border border-neutral-200 flex items-center justify-center text-neutral-900 mb-3">
              <Banknote className="w-6 h-6 stroke-[1.75]" />
            </div>
            <h3 className="font-heading font-bold text-sm sm:text-base uppercase tracking-wider text-neutral-950">
              Cash on Delivery (COD)
            </h3>
            <p className="text-xs text-neutral-600 mt-1 max-w-xs leading-relaxed">
              Pay securely at your doorstep nationwide upon receiving your parcel.
            </p>
          </div>
        </div>

        {/* Testimonial & Rating Banner */}
        <div className="mt-12 pt-8 border-t border-neutral-200/60 max-w-2xl mx-auto text-center flex flex-col items-center">
          {/* 5 Stars */}
          <div className="flex items-center gap-1 text-amber-400 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-current" />
            ))}
          </div>

          <span className="text-xs font-bold uppercase tracking-widest text-neutral-900 mb-2">
            4.9 Rated by 1,200+ customers
          </span>

          <blockquote className="text-xs sm:text-sm text-neutral-700 italic max-w-lg leading-relaxed">
            &ldquo;The quality is unmatched. Perfect fit and super comfortable. SAVVIO is now my go-to for streetwear.&rdquo;
          </blockquote>

          <cite className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mt-1 not-italic">
            — Ayesha, Karachi
          </cite>
        </div>

      </div>
    </section>
  );
};
