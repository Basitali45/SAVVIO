import React, { useState } from 'react';
import { X, CheckCircle, Clock, Truck, Check, XCircle, Printer, MessageCircle, MapPin, Phone, User } from 'lucide-react';
import { Order, OrderStatus } from '../../types.ts';
import { api } from '../../services/api.ts';
import { formatWhatsAppNumber } from '../../utils/whatsapp.ts';

interface OrderDetailsModalProps {
  order: Order | null;
  onClose: () => void;
  onStatusUpdated: () => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  onClose,
  onStatusUpdated,
}) => {
  if (!order) return null;

  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(order.status);
  const [updating, setUpdating] = useState(false);

  const statuses: { label: string; value: OrderStatus; color: string }[] = [
    { label: 'Pending', value: 'pending', color: 'bg-amber-100 text-amber-800' },
    { label: 'Confirmed', value: 'confirmed', color: 'bg-blue-100 text-blue-800' },
    { label: 'Processing', value: 'processing', color: 'bg-purple-100 text-purple-800' },
    { label: 'Shipped', value: 'shipped', color: 'bg-indigo-100 text-indigo-800' },
    { label: 'Delivered', value: 'delivered', color: 'bg-emerald-100 text-emerald-800' },
    { label: 'Cancelled', value: 'cancelled', color: 'bg-red-100 text-red-800' },
  ];

  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    setUpdating(true);
    try {
      await api.updateOrderStatus(order.id, newStatus);
      setCurrentStatus(newStatus);
      onStatusUpdated();
    } catch (err) {
      console.error(err);
      alert('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const customerWaNumber = formatWhatsAppNumber(order.customer_phone);
  const waChatUrl = `https://wa.me/${customerWaNumber}?text=${encodeURIComponent(
    `Hi ${order.customer_name}! This is SAVVIO Clothing Co. regarding your Order #${order.order_number}. We are reaching out to confirm your order details.`
  )}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden my-6 border border-neutral-200 flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center gap-3">
            <span className="font-heading font-black text-xl text-neutral-900 tracking-wider">
              {order.order_number}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
              statuses.find((s) => s.value === currentStatus)?.color || 'bg-neutral-100 text-neutral-800'
            }`}>
              {currentStatus}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-500 hover:text-neutral-950 rounded-full hover:bg-neutral-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          
          {/* Status Quick Updater */}
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-700">
              Update Order Status:
            </span>
            <div className="flex flex-wrap gap-2">
              {statuses.map((st) => (
                <button
                  key={st.value}
                  onClick={() => handleUpdateStatus(st.value)}
                  disabled={updating || currentStatus === st.value}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                    currentStatus === st.value
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Customer & Delivery Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-neutral-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500">
                <User className="w-3.5 h-3.5" />
                <span>Customer Information</span>
              </div>
              <div className="text-sm font-semibold text-neutral-900">{order.customer_name}</div>
              <div className="flex items-center gap-1.5 text-xs text-neutral-600">
                <Phone className="w-3.5 h-3.5 text-neutral-400" />
                <span>{order.customer_phone}</span>
              </div>
              <a
                href={waChatUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 bg-[#128C7E] hover:bg-[#075E54] text-white text-xs font-semibold rounded-md transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Message on WhatsApp</span>
              </a>
            </div>

            <div className="p-4 rounded-xl border border-neutral-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500">
                <MapPin className="w-3.5 h-3.5" />
                <span>Shipping Address</span>
              </div>
              <div className="text-xs text-neutral-800 leading-relaxed font-medium">
                {order.delivery_address}
              </div>
              <div className="text-xs font-semibold text-neutral-950">
                City: {order.city}
              </div>
              {order.notes && (
                <div className="text-[11px] text-amber-700 bg-amber-50 p-1.5 rounded-md mt-1">
                  <strong>Notes:</strong> {order.notes}
                </div>
              )}
            </div>
          </div>

          {/* Ordered Products Items List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
              Purchased Items ({order.items?.length || 0})
            </h4>

            <div className="divide-y divide-neutral-200 border border-neutral-200 rounded-xl overflow-hidden bg-white">
              {order.items?.map((item) => (
                <div key={item.id} className="p-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.image_url || '/assets/aistudio/image_3d1d334e.png'}
                      alt={item.product_name}
                      className="w-12 h-12 object-contain rounded-md bg-neutral-100 p-1 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-semibold text-neutral-900 truncate">
                        {item.product_name}
                      </div>
                      <div className="text-xs text-neutral-500 flex gap-2">
                        {item.size && <span>Size: <strong>{item.size}</strong></span>}
                        {item.color && <span>Color: <strong>{item.color}</strong></span>}
                        <span>Qty: <strong>{item.quantity}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-neutral-950 tabular-nums">
                      PKR {item.subtotal.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-neutral-400 tabular-nums">
                      PKR {item.price.toLocaleString()} each
                    </div>
                  </div>
                </div>
              ))}

              <div className="p-3 bg-neutral-50 flex items-center justify-between font-bold text-sm">
                <span>Grand Total (Cash on Delivery):</span>
                <span className="text-base text-neutral-950 tabular-nums">
                  PKR {order.total_amount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between">
          <span className="text-xs text-neutral-500">
            Ordered on: {new Date(order.created_at).toLocaleString()}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 border border-neutral-300 text-neutral-700 text-xs font-semibold rounded-lg hover:bg-neutral-100 flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Slip</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-neutral-900 text-white text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-neutral-800"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
