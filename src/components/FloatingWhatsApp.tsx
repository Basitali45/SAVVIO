import React from 'react';
import { formatWhatsAppNumber } from '../utils/whatsapp.ts';

interface FloatingWhatsAppProps {
  whatsappNumber: string;
  enabled?: boolean;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({
  whatsappNumber,
  enabled = true,
}) => {
  if (!enabled) return null;

  const phone = formatWhatsAppNumber(whatsappNumber || '03105946699');
  const chatUrl = `https://wa.me/${phone}?text=${encodeURIComponent('Hi SAVVIO! I have a question about your clothing collection.')}`;

  return (
    <div className="fixed bottom-6 right-6 z-40 print:hidden">
      {/* Subtle pulse ring animation */}
      <span className="absolute -inset-1 rounded-full bg-emerald-500 opacity-40 animate-ping pointer-events-none" />

      <a
        href={chatUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with SAVVIO on WhatsApp"
        className="relative flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#1ebd5a] text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 focus:outline-hidden"
      >
        {/* WhatsApp Brand SVG */}
        <svg className="w-8 h-8 fill-current drop-shadow-xs" viewBox="0 0 24 24">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.07-1.745-.391-1.396-.58-2.316-1.996-2.385-2.089-.071-.093-.57-.758-.57-1.446 0-.688.355-1.027.481-1.168.127-.142.277-.177.37-.177.092 0 .185.001.266.005.086.004.201-.033.315.241.119.288.405.99.442 1.062.036.072.06.156.012.25-.048.094-.072.153-.143.236-.072.083-.151.186-.216.25-.072.072-.147.151-.063.295.084.144.373.616.801.997.551.489 1.015.641 1.159.713.144.072.228.06.312-.036.084-.096.361-.42.457-.564.096-.144.192-.12.324-.072.132.048.837.395.981.467.144.072.24.108.276.168.036.06.036.348-.108.753z"/>
        </svg>

        {/* Desktop hover badge */}
        <span className="hidden group-hover:flex absolute right-16 top-2 bg-neutral-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
          Chat on WhatsApp
        </span>
      </a>
    </div>
  );
};
