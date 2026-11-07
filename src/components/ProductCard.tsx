import React, { useState } from 'react';
import { ShoppingBag, Eye, Check } from 'lucide-react';
import { Product } from '../types.ts';
import { generateSingleProductWhatsAppUrl } from '../utils/whatsapp.ts';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, size: string, color: string) => void;
  whatsappNumber: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onQuickView,
  onAddToCart,
  whatsappNumber,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [addedEffect, setAddedEffect] = useState(false);

  const mainImage = product.images && product.images.length > 0 ? product.images[0] : '/assets/aistudio/image_3d1d334e.png';
  const secondaryImage = product.images && product.images.length > 1 ? product.images[1] : mainImage;

  const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'Standard';
  const defaultColor = product.colors && product.colors.length > 0 ? product.colors[0] : 'Standard';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product, defaultSize, defaultColor);
    setAddedEffect(true);
    setTimeout(() => setAddedEffect(false), 1500);
  };

  const handleWhatsAppOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = generateSingleProductWhatsAppUrl(product, defaultSize, defaultColor, 1, whatsappNumber);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      onClick={() => onQuickView(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col bg-white rounded-xl overflow-hidden border border-neutral-200/80 hover:border-neutral-400/80 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer"
    >
      {/* Product Image Frame */}
      <div className="relative w-full aspect-4/5 sm:aspect-square bg-[#F5F4F0] overflow-hidden flex items-center justify-center p-3">
        <img
          src={isHovered ? secondaryImage : mainImage}
          alt={product.name}
          className="w-full h-full object-contain object-center transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {product.discount_percentage > 0 && (
            <span className="bg-red-600 text-white text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-sm shadow-xs">
              {product.discount_percentage}% OFF
            </span>
          )}
          {product.is_new_arrival && (
            <span className="bg-neutral-900 text-white text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-sm shadow-xs">
              NEW
            </span>
          )}
        </div>

        {/* Quick View Button overlay on hover */}
        <div className="absolute inset-x-0 bottom-3 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="w-full py-2 bg-white/95 hover:bg-white text-neutral-900 text-xs font-semibold uppercase tracking-wider rounded-md shadow-md backdrop-blur-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4 flex flex-col flex-1 justify-between bg-white">
        <div>
          <span className="text-[11px] font-medium uppercase tracking-widest text-neutral-400">
            {product.category_name}
          </span>
          <h3 className="font-heading font-semibold text-neutral-950 text-sm sm:text-base line-clamp-1 mt-0.5 group-hover:text-neutral-700 transition-colors">
            {product.name}
          </h3>
        </div>

        {/* Pricing */}
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-base sm:text-lg font-bold text-neutral-950 tabular-nums">
            PKR {product.sale_price.toLocaleString()}
          </span>
          {product.regular_price > product.sale_price && (
            <span className="text-xs sm:text-sm text-neutral-400 line-through tabular-nums">
              PKR {product.regular_price.toLocaleString()}
            </span>
          )}
        </div>

        {/* Action Buttons: Add to Cart & WhatsApp Order */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Black Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={!product.in_stock}
            className={`w-full py-2.5 px-3 text-xs font-semibold uppercase tracking-wider rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              addedEffect
                ? 'bg-emerald-600 text-white'
                : product.in_stock
                ? 'bg-neutral-950 hover:bg-neutral-800 text-white'
                : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
            }`}
          >
            {addedEffect ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-3" />
                <span>Added</span>
              </>
            ) : product.in_stock ? (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add to Cart</span>
              </>
            ) : (
              <span>Sold Out</span>
            )}
          </button>

          {/* Green Order on WhatsApp Button - Exact match to Mobile Screenshot */}
          <button
            onClick={handleWhatsAppOrder}
            className="w-full py-2.5 px-3 bg-[#128C7E] hover:bg-[#075E54] text-white text-xs font-semibold uppercase tracking-wider rounded-md flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            title="Order directly on WhatsApp"
          >
            {/* WhatsApp SVG Icon */}
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.07-1.745-.391-1.396-.58-2.316-1.996-2.385-2.089-.071-.093-.57-.758-.57-1.446 0-.688.355-1.027.481-1.168.127-.142.277-.177.37-.177.092 0 .185.001.266.005.086.004.201-.033.315.241.119.288.405.99.442 1.062.036.072.06.156.012.25-.048.094-.072.153-.143.236-.072.083-.151.186-.216.25-.072.072-.147.151-.063.295.084.144.373.616.801.997.551.489 1.015.641 1.159.713.144.072.228.06.312-.036.084-.096.361-.42.457-.564.096-.144.192-.12.324-.072.132.048.837.395.981.467.144.072.24.108.276.168.036.06.036.348-.108.753z"/>
            </svg>
            <span className="truncate">WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
