import React, { useState } from 'react';
import { X, Upload, Plus, Trash2, Image as ImageIcon, Check } from 'lucide-react';
import { Product, Category } from '../../types.ts';
import { api } from '../../services/api.ts';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  categories: Category[];
  onSaved: () => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  product,
  categories,
  onSaved,
}) => {
  if (!isOpen) return null;

  const isEditing = !!product;

  const [formData, setFormData] = useState<Partial<Product>>({
    name: product?.name || '',
    slug: product?.slug || '',
    description: product?.description || '',
    regular_price: product?.regular_price || 0,
    sale_price: product?.sale_price || 0,
    category_id: product?.category_id || (categories[0]?.id || 'cat-hoodies'),
    category_name: product?.category_name || (categories[0]?.name || 'Hoodies'),
    images: product?.images || [],
    is_featured: product?.is_featured ?? true,
    is_new_arrival: product?.is_new_arrival ?? false,
    in_stock: product?.in_stock ?? true,
    stock_quantity: product?.stock_quantity ?? 25,
    sizes: product?.sizes || ['S', 'M', 'L', 'XL'],
    colors: product?.colors || ['Black'],
  });

  const [newImageUrl, setNewImageUrl] = useState('');
  const [newSize, setNewSize] = useState('');
  const [newColor, setNewColor] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto calculate discount percentage
  const discountPercent =
    formData.regular_price && formData.sale_price && formData.regular_price > formData.sale_price
      ? Math.round(((formData.regular_price - formData.sale_price) / formData.regular_price) * 100)
      : 0;

  // Handle local file upload via multer backend
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setErrorMsg('');
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uploadedUrl = await api.uploadImage(file);
        setFormData((prev) => ({
          ...prev,
          images: [...(prev.images || []), uploadedUrl],
        }));
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setFormData((prev) => ({
      ...prev,
      images: [...(prev.images || []), newImageUrl.trim()],
    }));
    setNewImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index),
    }));
  };

  const handleSetPrimaryImage = (index: number) => {
    if (!formData.images || index === 0) return;
    const newImgs = [...formData.images];
    const [selected] = newImgs.splice(index, 1);
    newImgs.unshift(selected);
    setFormData((prev) => ({ ...prev, images: newImgs }));
  };

  const handleAddSize = () => {
    if (!newSize.trim() || formData.sizes?.includes(newSize.trim().toUpperCase())) return;
    setFormData((prev) => ({
      ...prev,
      sizes: [...(prev.sizes || []), newSize.trim().toUpperCase()],
    }));
    setNewSize('');
  };

  const handleRemoveSize = (sizeToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes?.filter((s) => s !== sizeToRemove),
    }));
  };

  const handleAddColor = () => {
    if (!newColor.trim() || formData.colors?.includes(newColor.trim())) return;
    setFormData((prev) => ({
      ...prev,
      colors: [...(prev.colors || []), newColor.trim()],
    }));
    setNewColor('');
  };

  const handleRemoveColor = (colToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors?.filter((c) => c !== colToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sale_price) {
      setErrorMsg('Product name and sale price are required');
      return;
    }

    setSaving(true);
    setErrorMsg('');

    try {
      const selectedCat = categories.find((c) => c.id === formData.category_id);
      const payload: Partial<Product> = {
        ...formData,
        category_name: selectedCat ? selectedCat.name : formData.category_name,
        slug: formData.slug || formData.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        discount_percentage: discountPercent,
        images: formData.images && formData.images.length > 0 ? formData.images : ['/assets/aistudio/image_3d1d334e.png'],
      };

      if (isEditing && product?.id) {
        await api.updateProduct(product.id, payload);
      } else {
        await api.createProduct(payload);
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden my-6 border border-neutral-200 flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div>
            <h3 className="font-heading font-bold text-lg text-neutral-900 uppercase tracking-wider">
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </h3>
            <p className="text-xs text-neutral-500">
              Set details, multiple image uploads, stock, pricing, and variants.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-500 hover:text-neutral-950 rounded-full hover:bg-neutral-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
              {errorMsg}
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                Product Title *
              </label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. SAVVIO Signature Tracksuit - Onyx Black"
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-hidden focus:border-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                Category *
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => {
                  const cat = categories.find((c) => c.id === e.target.value);
                  setFormData({
                    ...formData,
                    category_id: e.target.value,
                    category_name: cat?.name || '',
                  });
                }}
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg bg-white focus:outline-hidden focus:border-neutral-900"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                Stock Quantity *
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.stock_quantity ?? 10}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stock_quantity: parseInt(e.target.value, 10) || 0,
                    in_stock: (parseInt(e.target.value, 10) || 0) > 0,
                  })
                }
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-hidden focus:border-neutral-900"
              />
            </div>
          </div>

          {/* Pricing Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                Regular Price (PKR)
              </label>
              <input
                type="number"
                min="0"
                value={formData.regular_price || ''}
                onChange={(e) =>
                  setFormData({ ...formData, regular_price: parseFloat(e.target.value) || 0 })
                }
                placeholder="8499"
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg bg-white focus:outline-hidden focus:border-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                Sale Price (PKR) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.sale_price || ''}
                onChange={(e) =>
                  setFormData({ ...formData, sale_price: parseFloat(e.target.value) || 0 })
                }
                placeholder="6999"
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg bg-white focus:outline-hidden focus:border-neutral-900 font-bold"
              />
            </div>

            <div className="flex flex-col justify-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Auto Discount
              </span>
              <div className="text-lg font-bold text-red-600 mt-1">
                {discountPercent > 0 ? `${discountPercent}% OFF` : 'None'}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
              Product Description
            </label>
            <textarea
              rows={3}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Fabric specifications (GSM), tailoring, fit description, and care instructions..."
              className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-hidden focus:border-neutral-900"
            />
          </div>

          {/* Product Gallery & Multiple Image Uploads */}
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900">
                Product Images & Gallery (2–3 or more images)
              </label>
              <span className="text-[11px] text-neutral-500">First image is primary</span>
            </div>

            {/* Current Images List */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {formData.images?.map((img, idx) => (
                <div
                  key={idx}
                  className="relative group aspect-square rounded-lg bg-white border border-neutral-200 overflow-hidden p-2 flex items-center justify-center shadow-xs"
                >
                  <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-contain" />
                  
                  {idx === 0 && (
                    <span className="absolute top-1 left-1 bg-neutral-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm">
                      PRIMARY
                    </span>
                  )}

                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-1">
                    {idx !== 0 && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimaryImage(idx)}
                        className="px-2 py-0.5 bg-white text-neutral-900 rounded-xs text-[10px] font-semibold"
                      >
                        Set Primary
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                      title="Delete Image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Upload Drop Zone / Button */}
              <label className="aspect-square rounded-lg border-2 border-dashed border-neutral-300 hover:border-neutral-900 bg-white flex flex-col items-center justify-center cursor-pointer transition-colors p-2 text-center group">
                <Upload className="w-6 h-6 text-neutral-400 group-hover:text-neutral-900 transition-colors mb-1" />
                <span className="text-[11px] font-semibold text-neutral-700">
                  {uploading ? 'Uploading...' : 'Upload File'}
                </span>
                <span className="text-[9px] text-neutral-400">JPG, PNG, WebP</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Paste Image URL Fallback */}
            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Or paste external image URL (e.g. /assets/aistudio/...)"
                className="flex-1 px-3 py-1.5 text-xs border border-neutral-300 rounded-lg bg-white"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-3 py-1.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-900 text-xs font-semibold rounded-lg"
              >
                Add URL
              </button>
            </div>
          </div>

          {/* Variants: Sizes & Colors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Sizes */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                Available Sizes
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {formData.sizes?.map((size) => (
                  <span
                    key={size}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-100 text-neutral-800 text-xs font-semibold rounded-md"
                  >
                    {size}
                    <button
                      type="button"
                      onClick={() => handleRemoveSize(size)}
                      className="text-neutral-400 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  placeholder="e.g. XXL"
                  className="w-24 px-2 py-1 text-xs border border-neutral-300 rounded-md uppercase"
                />
                <button
                  type="button"
                  onClick={handleAddSize}
                  className="px-3 py-1 bg-neutral-200 text-neutral-900 text-xs font-semibold rounded-md"
                >
                  Add Size
                </button>
              </div>
            </div>

            {/* Colors */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                Available Colors
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {formData.colors?.map((color) => (
                  <span
                    key={color}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-100 text-neutral-800 text-xs font-semibold rounded-md"
                  >
                    {color}
                    <button
                      type="button"
                      onClick={() => handleRemoveColor(color)}
                      className="text-neutral-400 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  placeholder="e.g. Olive Green"
                  className="w-32 px-2 py-1 text-xs border border-neutral-300 rounded-md"
                />
                <button
                  type="button"
                  onClick={handleAddColor}
                  className="px-3 py-1 bg-neutral-200 text-neutral-900 text-xs font-semibold rounded-md"
                >
                  Add Color
                </button>
              </div>
            </div>
          </div>

          {/* Status Switches */}
          <div className="flex flex-wrap gap-6 pt-2 border-t border-neutral-200">
            <label className="flex items-center gap-2 text-xs font-semibold text-neutral-800 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.in_stock}
                onChange={(e) => setFormData({ ...formData, in_stock: e.target.checked })}
                className="w-4 h-4 rounded-sm border-neutral-300 text-neutral-900 focus:ring-neutral-900"
              />
              <span>In Stock Availability</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-neutral-800 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="w-4 h-4 rounded-sm border-neutral-300 text-neutral-900 focus:ring-neutral-900"
              />
              <span>Featured on Homepage</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-neutral-800 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_new_arrival}
                onChange={(e) => setFormData({ ...formData, is_new_arrival: e.target.checked })}
                className="w-4 h-4 rounded-sm border-neutral-300 text-neutral-900 focus:ring-neutral-900"
              />
              <span>Mark as New Arrival</span>
            </label>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-neutral-300 text-neutral-700 text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-neutral-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-2 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-md transition-colors"
          >
            {saving ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
          </button>
        </div>

      </div>
    </div>
  );
};
