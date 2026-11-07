import React, { useState } from 'react';
import { X, ShoppingBag, Truck, RotateCcw, ShieldCheck, Heart, Share2, Check } from 'lucide-react';
import { Product, WebsiteSettings } from '../types.ts';
import { generateSingleProductWhatsAppUrl } from '../utils/whatsapp.ts';

interface ProductDetailModalProps {
  product: Product | null;
  settings: WebsiteSettings;
  onClose: () => void;
  onAddToCart: (product: Product, size: string, color: string, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  settings,
  onClose,
  onAddToCart,
}) => {
  if (!product) return null;

  const [selectedImage, setSelectedImage] = useState(
    product.images && product.images.length > 0 ? product.images[0] : ''
  );
  const [selectedSize, setSelectedSize] = useState(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'Standard'
  );
  const [selectedColor, setSelectedColor] = useState(
    product.colors && product.colors.length > 0 ? product.colors[0] : 'Standard'
  );
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const images = product.images && product.images.length > 0 ? product.images : [selectedImage];

  const handleAddToCart = () => {
    onAddToCart(product, selectedSize, selectedColor, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleWhatsAppOrder = () => {
    const url = generateSingleProductWhatsAppUrl(
      product,
      selectedSize,
      selectedColor,
      quantity,
      settings.whatsapp_number
    );
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden my-6 border border-neutral-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-neutral-500 hover:text-neutral-900 bg-white/80 hover:bg-white rounded-full shadow-xs transition-colors"
          aria-label="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Left Column: Image Showcase & Thumbnails */}
          <div className="p-4 sm:p-6 bg-[#FAF9F6] flex flex-col justify-between border-b md:border-b-0 md:border-r border-neutral-200">
            {/* Primary Main Image */}
            <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-white flex items-center justify-center p-4 border border-neutral-200/80 shadow-xs">
              <img
                src={selectedImage || images[0]}
                alt={product.name}
                className="w-full h-full object-contain object-center transition-all duration-300"
                referrerPolicy="no-referrer"
              />
              {product.discount_percentage > 0 && (
                <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm shadow-xs">
                  {product.discount_percentage}% OFF
                </span>
              )}
            </div>

            {/* Gallery Thumbnails */}
            {images.length > 1 && (
              <div className="mt-4 flex items-center gap-3 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 bg-white p-1 shrink-0 transition-all ${
                      selectedImage === img
                        ? 'border-neutral-950 shadow-sm scale-105'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Specifications & Actions */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div>
              {/* Category & Stock */}
              <div className="flex items-center justify-between text-xs font-medium uppercase tracking-widest text-neutral-400">
                <span>{product.category_name}</span>
                <span className={product.in_stock ? 'text-emerald-600 font-semibold' : 'text-red-500 font-semibold'}>
                  {product.in_stock ? `In Stock (${product.stock_quantity} left)` : 'Out of Stock'}
                </span>
              </div>

              {/* Title */}
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-neutral-950 mt-1 leading-tight">
                {product.name}
              </h2>

              {/* Pricing */}
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-2xl font-black text-neutral-950 tabular-nums">
                  PKR {product.sale_price.toLocaleString()}
                </span>
                {product.regular_price > product.sale_price && (
                  <span className="text-base text-neutral-400 line-through tabular-nums">
                    PKR {product.regular_price.toLocaleString()}
                  </span>
                )}
                {product.discount_percentage > 0 && (
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-sm">
                    Save PKR {(product.regular_price - product.sale_price).toLocaleString()}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="mt-4 text-xs sm:text-sm text-neutral-600 leading-relaxed">
                {product.description}
              </p>

              {/* Variant Picker: Size */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mt-5">
                  <div className="flex items-center justify-between text-xs font-medium text-neutral-700 uppercase tracking-wider mb-2">
                    <span>Select Size</span>
                    <span className="text-[11px] text-neutral-400 lowercase">True to size streetwear fit</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-10 h-10 px-3 rounded-lg border text-xs font-semibold tracking-wider transition-all ${
                          selectedSize === size
                            ? 'bg-neutral-950 text-white border-neutral-950 shadow-xs'
                            : 'bg-white text-neutral-800 border-neutral-200 hover:border-neutral-400'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Variant Picker: Color */}
              {product.colors && product.colors.length > 0 && (
                <div className="mt-4">
                  <div className="text-xs font-medium text-neutral-700 uppercase tracking-wider mb-2">
                    <span>Color: <strong className="text-neutral-950">{selectedColor}</strong></span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                          selectedColor === color
                            ? 'bg-neutral-950 text-white border-neutral-950 shadow-xs'
                            : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Stepper */}
              <div className="mt-5 flex items-center gap-4">
                <span className="text-xs font-medium text-neutral-700 uppercase tracking-wider">
                  Quantity
                </span>
                <div className="flex items-center border border-neutral-200 rounded-lg overflow-hidden bg-neutral-50">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-9 h-9 flex items-center justify-center text-neutral-600 hover:bg-neutral-200 text-base font-bold transition-colors"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-sm font-semibold text-neutral-950 tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-9 h-9 flex items-center justify-center text-neutral-600 hover:bg-neutral-200 text-base font-bold transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-3 pt-4 border-t border-neutral-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  disabled={!product.in_stock}
                  className={`py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
                    justAdded
                      ? 'bg-emerald-600 text-white'
                      : product.in_stock
                      ? 'bg-neutral-950 hover:bg-neutral-800 text-white'
                      : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                  }`}
                >
                  {justAdded ? (
                    <>
                      <Check className="w-4 h-4 stroke-3" />
                      <span>Added to Bag!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>

                {/* Direct Order on WhatsApp */}
                <button
                  onClick={handleWhatsAppOrder}
                  className="py-3.5 px-4 bg-[#128C7E] hover:bg-[#075E54] text-white rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.07-1.745-.391-1.396-.58-2.316-1.996-2.385-2.089-.071-.093-.57-.758-.57-1.446 0-.688.355-1.027.481-1.168.127-.142.277-.177.37-.177.092 0 .185.001.266.005.086.004.201-.033.315.241.119.288.405.99.442 1.062.036.072.06.156.012.25-.048.094-.072.153-.143.236-.072.083-.151.186-.216.25-.072.072-.147.151-.063.295.084.144.373.616.801.997.551.489 1.015.641 1.159.713.144.072.228.06.312-.036.084-.096.361-.42.457-.564.096-.144.192-.12.324-.072.132.048.837.395.981.467.144.072.24.108.276.168.036.06.036.348-.108.753z"/>
                  </svg>
                  <span>Order on WhatsApp</span>
                </button>
              </div>

              {/* Trust Features Strip */}
              <div className="pt-2 grid grid-cols-2 gap-3 text-[11px] text-neutral-600">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-neutral-900 shrink-0" />
                  <span>Cash on Delivery (2-4 Days)</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-neutral-900 shrink-0" />
                  <span>7-Day Easy Size Exchanges</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
