import React, { useState } from 'react';
import { X, Trash2, ArrowRight, ShoppingBag, Truck, CheckCircle2, ShieldCheck, Tag } from 'lucide-react';
import { CartItem, WebsiteSettings, Order } from '../types.ts';
import { generateCartWhatsAppUrl } from '../utils/whatsapp.ts';
import { api } from '../services/api.ts';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
  settings: WebsiteSettings;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  settings,
}) => {
  if (!isOpen) return null;

  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'checkout' | 'confirmed'>('cart');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: '',
    city: 'Karachi',
    notes: '',
  });
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscountPercent, setAppliedDiscountPercent] = useState(0);
  const [discountMsg, setDiscountMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Calculations
  const rawSubtotal = items.reduce((sum, item) => sum + item.product.sale_price * item.quantity, 0);
  const discountAmount = Math.round((rawSubtotal * appliedDiscountPercent) / 100);
  const subtotalAfterDiscount = rawSubtotal - discountAmount;
  
  const freeThreshold = settings.free_delivery_threshold || 5000;
  const shippingFee = subtotalAfterDiscount >= freeThreshold || items.length === 0 ? 0 : 250;
  const grandTotal = subtotalAfterDiscount + shippingFee;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = discountCode.trim().toUpperCase();
    if (clean === 'SAVVIO15') {
      setAppliedDiscountPercent(15);
      setDiscountMsg('15% discount applied!');
    } else if (clean === 'FREESHIP') {
      setAppliedDiscountPercent(0);
      setDiscountMsg('Free shipping promo activated!');
    } else {
      setDiscountMsg('Invalid discount code');
    }
  };

  const handlePlaceWhatsAppOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
      alert('Please fill in your name, phone number, and delivery address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderNumber = `SAV-${Math.floor(1000 + Math.random() * 9000)}`;

      // Save order in backend database
      const orderPayload: Partial<Order> = {
        order_number: orderNumber,
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone,
        delivery_address: customerInfo.address,
        city: customerInfo.city,
        notes: customerInfo.notes,
        total_amount: grandTotal,
        status: 'pending',
        channel: 'whatsapp',
        items: items.map((it, idx) => ({
          id: `item-${Date.now()}-${idx}`,
          product_id: it.product.id,
          product_name: it.product.name,
          price: it.product.sale_price,
          quantity: it.quantity,
          size: it.selectedSize,
          color: it.selectedColor,
          image_url: it.product.images[0] || '',
          subtotal: it.product.sale_price * it.quantity,
        })),
      };

      const savedOrder = await api.createOrder(orderPayload);
      setCompletedOrder(savedOrder);

      // Generate the official WhatsApp message and URL
      const waUrl = generateCartWhatsAppUrl(
        items,
        grandTotal,
        orderNumber,
        customerInfo,
        settings.whatsapp_number
      );

      // Move to confirmed state
      setCheckoutStep('confirmed');
      onClearCart();

      // Open WhatsApp click-to-chat
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('Failed to create order in database:', err);
      alert('Order could not be saved to backend. Please check connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-200 flex items-center justify-between bg-white z-10">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-neutral-900" />
            <h2 className="font-heading text-lg font-bold uppercase tracking-wider text-neutral-950">
              {checkoutStep === 'confirmed'
                ? 'Order Confirmed!'
                : checkoutStep === 'checkout'
                ? 'Delivery Details'
                : `Your Bag (${items.length})`}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-500 hover:text-neutral-950 rounded-full hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* STEP 1: CART LIST */}
          {checkoutStep === 'cart' && (
            <>
              {items.length === 0 ? (
                <div className="py-16 text-center flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4 text-neutral-400">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h3 className="font-heading text-base font-bold text-neutral-900 uppercase">
                    Your Shopping Bag is Empty
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 max-w-xs">
                    Explore our latest seasonal drop of premium hoodies and tracksuits.
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-6 px-6 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white rounded-full text-xs font-semibold uppercase tracking-wider transition-colors"
                  >
                    Explore Collection
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Delivery progress bar */}
                  <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200/80 text-xs">
                    {rawSubtotal >= freeThreshold ? (
                      <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>You unlocked FREE nationwide delivery!</span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-neutral-700">
                          Add <strong>PKR {(freeThreshold - rawSubtotal).toLocaleString()}</strong> more to get <strong>FREE delivery</strong>
                        </span>
                        <div className="w-full bg-neutral-200 h-1.5 rounded-full mt-2 overflow-hidden">
                          <div
                            className="bg-neutral-950 h-full rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(100, (rawSubtotal / freeThreshold) * 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* List of cart items */}
                  <div className="divide-y divide-neutral-100">
                    {items.map((item, idx) => (
                      <div key={`${item.product.id}-${idx}`} className="py-4 flex gap-4 items-center">
                        <img
                          src={item.product.images[0] || '/assets/aistudio/image_3d1d334e.png'}
                          alt={item.product.name}
                          className="w-20 h-20 object-contain rounded-lg bg-neutral-50 p-1 border border-neutral-200/60 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-neutral-900 truncate">
                            {item.product.name}
                          </h4>
                          <div className="text-xs text-neutral-500 mt-0.5 flex items-center gap-2">
                            <span>Size: <strong>{item.selectedSize}</strong></span>
                            <span>·</span>
                            <span>Color: <strong>{item.selectedColor}</strong></span>
                          </div>
                          <div className="text-sm font-bold text-neutral-950 mt-1 tabular-nums">
                            PKR {(item.product.sale_price * item.quantity).toLocaleString()}
                          </div>

                          {/* Stepper & Remove */}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center border border-neutral-200 rounded-md overflow-hidden bg-neutral-50 text-xs">
                              <button
                                onClick={() => onUpdateQuantity(idx, item.quantity - 1)}
                                className="px-2 py-0.5 text-neutral-600 hover:bg-neutral-200"
                              >
                                -
                              </button>
                              <span className="px-2.5 font-bold tabular-nums">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => onUpdateQuantity(idx, item.quantity + 1)}
                                className="px-2 py-0.5 text-neutral-600 hover:bg-neutral-200"
                              >
                                +
                              </button>
                            </div>

                            <button
                              onClick={() => onRemoveItem(idx)}
                              className="text-neutral-400 hover:text-red-500 p-1 transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Coupon Code Input */}
                  <form onSubmit={handleApplyCoupon} className="pt-2">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="w-3.5 h-3.5 absolute left-3 top-3 text-neutral-400" />
                        <input
                          type="text"
                          value={discountCode}
                          onChange={(e) => setDiscountCode(e.target.value)}
                          placeholder="Promo code (e.g. SAVVIO15)"
                          className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-200 rounded-lg uppercase tracking-wider focus:outline-hidden focus:border-neutral-900"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                    {discountMsg && (
                      <p className={`text-xs mt-1.5 ${appliedDiscountPercent > 0 ? 'text-emerald-600 font-semibold' : 'text-neutral-500'}`}>
                        {discountMsg}
                      </p>
                    )}
                  </form>
                </div>
              )}
            </>
          )}

          {/* STEP 2: CHECKOUT FORM */}
          {checkoutStep === 'checkout' && (
            <form id="checkout-form" onSubmit={handlePlaceWhatsAppOrder} className="space-y-4">
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-600">
                <span className="font-semibold text-neutral-900">Cash on Delivery (COD):</span> Enter your details below to dispatch your order and launch WhatsApp confirmation.
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                  placeholder="e.g. Hamza Tariq"
                  className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-hidden focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                  WhatsApp / Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                  placeholder="e.g. 0310 1234567"
                  className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-hidden focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                  City *
                </label>
                <select
                  value={customerInfo.city}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, city: e.target.value })}
                  className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm bg-white focus:outline-hidden focus:border-neutral-900"
                >
                  <option value="Karachi">Karachi</option>
                  <option value="Lahore">Lahore</option>
                  <option value="Islamabad">Islamabad</option>
                  <option value="Rawalpindi">Rawalpindi</option>
                  <option value="Faisalabad">Faisalabad</option>
                  <option value="Multan">Multan</option>
                  <option value="Peshawar">Peshawar</option>
                  <option value="Quetta">Quetta</option>
                  <option value="Sialkot">Sialkot</option>
                  <option value="Gujranwala">Gujranwala</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Other">Other (Pakistan)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                  Complete Street / House Address *
                </label>
                <textarea
                  required
                  rows={2}
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                  placeholder="House / Apartment #, Street #, Sector / Phase, Area"
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-hidden focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                  Special Delivery Instructions (Optional)
                </label>
                <input
                  type="text"
                  value={customerInfo.notes}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                  placeholder="e.g. Call before arrival, leave with security"
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-hidden focus:border-neutral-900"
                />
              </div>

              <div className="pt-2 text-[11px] text-neutral-500 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Your order information is stored securely in our official order ledger.</span>
              </div>
            </form>
          )}

          {/* STEP 3: ORDER CONFIRMED */}
          {checkoutStep === 'confirmed' && completedOrder && (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="font-heading text-xl font-bold text-neutral-950 uppercase">
                Order Placed Successfully!
              </h3>
              <p className="text-xs text-neutral-600 max-w-sm mx-auto">
                Your order reference is <strong className="text-neutral-950">{completedOrder.order_number}</strong>.
                Our dispatch team is preparing your package for Cash on Delivery.
              </p>

              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-left text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Customer:</span>
                  <span className="font-semibold">{completedOrder.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Contact:</span>
                  <span className="font-semibold">{completedOrder.customer_phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Address:</span>
                  <span className="font-semibold text-right">{completedOrder.delivery_address}, {completedOrder.city}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-neutral-200 font-bold text-sm">
                  <span>Total Amount (COD):</span>
                  <span>PKR {completedOrder.total_amount.toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-4 space-y-2">
                <a
                  href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi SAVVIO! I just placed order ${completedOrder.order_number}. Please confirm my shipment.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-[#128C7E] hover:bg-[#075E54] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-md"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.07-1.745-.391-1.396-.58-2.316-1.996-2.385-2.089-.071-.093-.57-.758-.57-1.446 0-.688.355-1.027.481-1.168.127-.142.277-.177.37-.177.092 0 .185.001.266.005.086.004.201-.033.315.241.119.288.405.99.442 1.062.036.072.06.156.012.25-.048.094-.072.153-.143.236-.072.083-.151.186-.216.25-.072.072-.147.151-.063.295.084.144.373.616.801.997.551.489 1.015.641 1.159.713.144.072.228.06.312-.036.084-.096.361-.42.457-.564.096-.144.192-.12.324-.072.132.048.837.395.981.467.144.072.24.108.276.168.036.06.036.348-.108.753z"/>
                  </svg>
                  <span>Open WhatsApp Chat</span>
                </a>

                <button
                  onClick={() => {
                    setCheckoutStep('cart');
                    onClose();
                  }}
                  className="w-full py-2.5 text-xs font-semibold uppercase tracking-wider text-neutral-600 hover:text-neutral-950 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer Totals & Action Button */}
        {checkoutStep !== 'confirmed' && items.length > 0 && (
          <div className="p-6 border-t border-neutral-200 bg-neutral-50/50 space-y-3">
            <div className="space-y-1.5 text-xs text-neutral-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-neutral-900 tabular-nums">
                  PKR {rawSubtotal.toLocaleString()}
                </span>
              </div>
              {appliedDiscountPercent > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Discount ({appliedDiscountPercent}%)</span>
                  <span className="font-semibold tabular-nums">-PKR {discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Estimated Delivery (COD)</span>
                <span className="font-semibold text-neutral-900 tabular-nums">
                  {shippingFee === 0 ? 'FREE' : `PKR ${shippingFee}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-neutral-950 pt-2 border-t border-neutral-200">
                <span>Total Amount</span>
                <span className="tabular-nums">PKR {grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {checkoutStep === 'cart' ? (
              <button
                onClick={() => setCheckoutStep('checkout')}
                className="w-full py-3.5 bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCheckoutStep('cart')}
                  className="px-4 py-3 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={isSubmitting}
                  className="flex-1 py-3.5 bg-[#128C7E] hover:bg-[#075E54] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Placing Order...</span>
                  ) : (
                    <>
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.07-1.745-.391-1.396-.58-2.316-1.996-2.385-2.089-.071-.093-.57-.758-.57-1.446 0-.688.355-1.027.481-1.168.127-.142.277-.177.37-.177.092 0 .185.001.266.005.086.004.201-.033.315.241.119.288.405.99.442 1.062.036.072.06.156.012.25-.048.094-.072.153-.143.236-.072.083-.151.186-.216.25-.072.072-.147.151-.063.295.084.144.373.616.801.997.551.489 1.015.641 1.159.713.144.072.228.06.312-.036.084-.096.361-.42.457-.564.096-.144.192-.12.324-.072.132.048.837.395.981.467.144.072.24.108.276.168.036.06.036.348-.108.753z"/>
                      </svg>
                      <span>Complete Order on WhatsApp</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
