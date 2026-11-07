import { CartItem, Product } from '../types.ts';

export function formatWhatsAppNumber(phone: string): string {
  // Normalize Pakistani numbers e.g. "03105946699" -> "923105946699"
  const cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    return '92' + cleaned.substring(1);
  }
  if (!cleaned.startsWith('92') && cleaned.length === 10) {
    return '92' + cleaned;
  }
  return cleaned || '923105946699';
}

export function generateCartWhatsAppUrl(
  items: CartItem[],
  total: number,
  orderNumber: string,
  customerInfo?: { name: string; phone: string; address: string; city: string; notes?: string },
  whatsappNumber: string = '03105946699'
): string {
  const targetPhone = formatWhatsAppNumber(whatsappNumber);
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  let message = `*NEW ORDER — SAVVIO*\n`;
  message += `*Order ID:* ${orderNumber}\n`;

  if (customerInfo && customerInfo.name) {
    message += `\n*CUSTOMER DETAILS:*\n`;
    message += `Name: ${customerInfo.name}\n`;
    message += `Phone: ${customerInfo.phone}\n`;
    message += `Address: ${customerInfo.address}, ${customerInfo.city}\n`;
    if (customerInfo.notes) {
      message += `Instructions: ${customerInfo.notes}\n`;
    }
  }

  message += `\n*ORDER ITEMS:*\n`;

  items.forEach((item, index) => {
    const subtotal = item.product.sale_price * item.quantity;
    const variantStr = [
      item.selectedSize ? `Size: ${item.selectedSize}` : '',
      item.selectedColor ? `Color: ${item.selectedColor}` : ''
    ].filter(Boolean).join(' | ');

    // Ensure full image URL for WhatsApp link preview
    let imgLink = item.product.images[0] || '';
    if (imgLink.startsWith('/')) {
      imgLink = `${baseUrl}${imgLink}`;
    }

    message += `\nProduct ${index + 1}: ${item.product.name}\n`;
    if (variantStr) message += `Variant: ${variantStr}\n`;
    message += `Quantity: ${item.quantity}\n`;
    message += `Price: Rs. ${item.product.sale_price.toLocaleString()}\n`;
    message += `Subtotal: Rs. ${subtotal.toLocaleString()}\n`;
    if (imgLink) message += `Product Image: ${imgLink}\n`;
  });

  message += `\n*GRAND TOTAL: Rs. ${total.toLocaleString()}*\n`;
  message += `Payment Method: Cash on Delivery (COD)\n\n`;
  message += `Please confirm this order. Thank you!`;

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
}

export function generateSingleProductWhatsAppUrl(
  product: Product,
  selectedSize: string,
  selectedColor: string,
  quantity: number = 1,
  whatsappNumber: string = '03105946699'
): string {
  const targetPhone = formatWhatsAppNumber(whatsappNumber);
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const subtotal = product.sale_price * quantity;

  let imgLink = product.images[0] || '';
  if (imgLink.startsWith('/')) {
    imgLink = `${baseUrl}${imgLink}`;
  }

  let message = `*INSTANT ORDER INQUIRY — SAVVIO*\n\n`;
  message += `Product: ${product.name}\n`;
  message += `Selected Size: ${selectedSize || 'Standard'}\n`;
  message += `Selected Color: ${selectedColor || 'Standard'}\n`;
  message += `Quantity: ${quantity}\n`;
  message += `Price: Rs. ${product.sale_price.toLocaleString()}\n`;
  message += `Total: Rs. ${subtotal.toLocaleString()}\n`;
  if (imgLink) message += `Product Image: ${imgLink}\n\n`;
  message += `Hi SAVVIO Team! I want to order this item via Cash on Delivery. Please confirm availability.`;

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
}
