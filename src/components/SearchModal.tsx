import React, { useState, useMemo } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { Product } from '../types.ts';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct,
}) => {
  if (!isOpen) return null;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredProducts = useMemo(() => {
    let list = products;
    if (selectedCategory !== 'all') {
      list = list.filter((p) => p.category_id === selectedCategory || p.category_name.toLowerCase() === selectedCategory.toLowerCase());
    }
    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase();
    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category_name.toLowerCase().includes(q)
    );
  }, [products, searchQuery, selectedCategory]);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-16 px-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-neutral-200">
        
        {/* Search Input Bar */}
        <div className="p-4 border-b border-neutral-200 flex items-center gap-3">
          <Search className="w-5 h-5 text-neutral-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hoodies, tracksuits, quarter-zips..."
            className="w-full text-sm sm:text-base bg-transparent focus:outline-hidden text-neutral-900 placeholder:text-neutral-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 text-neutral-400 hover:text-neutral-900"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 hover:text-neutral-950 px-2 py-1 rounded-md hover:bg-neutral-100"
          >
            ESC
          </button>
        </div>

        {/* Quick Filter Tags */}
        <div className="px-4 py-2.5 bg-neutral-50 border-b border-neutral-200 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-neutral-400 uppercase tracking-wider text-[10px] font-bold">Category:</span>
          {['all', 'hoodies', 'tracksuits', 'quarter-zips'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider transition-colors ${
                selectedCategory === cat
                  ? 'bg-neutral-900 text-white'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-4 divide-y divide-neutral-100">
          {filteredProducts.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-500">
              No products found matching &ldquo;{searchQuery}&rdquo;. Try another term.
            </div>
          ) : (
            filteredProducts.map((prod) => (
              <div
                key={prod.id}
                onClick={() => {
                  onSelectProduct(prod);
                  onClose();
                }}
                className="py-3 flex items-center justify-between gap-4 hover:bg-neutral-50 px-2 rounded-lg cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={prod.images[0] || '/assets/aistudio/image_3d1d334e.png'}
                    alt={prod.name}
                    className="w-14 h-14 object-contain rounded-md bg-neutral-100 p-1 shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-medium uppercase tracking-widest text-neutral-400">
                      {prod.category_name}
                    </span>
                    <h4 className="text-sm font-semibold text-neutral-900 truncate group-hover:text-neutral-950">
                      {prod.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-bold text-neutral-950 tabular-nums">
                        PKR {prod.sale_price.toLocaleString()}
                      </span>
                      {prod.regular_price > prod.sale_price && (
                        <span className="text-[11px] text-neutral-400 line-through tabular-nums">
                          PKR {prod.regular_price.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-950 group-hover:translate-x-1 transition-all shrink-0" />
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
