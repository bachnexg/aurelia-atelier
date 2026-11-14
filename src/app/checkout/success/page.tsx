'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  CheckCircle2, 
  Package, 
  Calendar, 
  MapPin, 
  Printer, 
  ArrowRight,
  Truck,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore } from '@/context/StoreContext';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order') || 'ORD-99014';
  const { orders } = useStore();

  const order = orders.find((o) => o.orderNumber === orderNumber) || orders[0];

  useEffect(() => {
    // Fire celebratory confetti on mount
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#c5a880', '#111111', '#eae6df', '#b89758'],
      });
    } catch {
      // ignore
    }
  }, []);

  const estimatedDelivery = new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="bg-[#faf8f5] min-h-screen py-12 sm:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Success Card */}
        <div className="bg-white rounded-sm border border-neutral-200 shadow-xl overflow-hidden p-8 sm:p-12 text-center space-y-6">
          
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100 shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] uppercase tracking-[0.3em] text-[#c5a880] font-semibold block">
              Pago Autorizado • Aurelia Atelier
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-neutral-900 font-normal">
              ¡Gracias por tu compra!
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto">
              Hemos recibido tu pedido correctamente. Hemos enviado el comprobante y el resumen a tu correo electrónico.
            </p>
          </div>

          {/* Order reference banner */}
          <div className="bg-neutral-50 border border-neutral-200 py-3.5 px-6 rounded-xs inline-block text-xs uppercase tracking-widest font-semibold text-neutral-900">
            Nº de Pedido: <span className="font-mono text-base text-black font-bold ml-1">{orderNumber}</span>
          </div>

          {/* Delivery Estimation Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left pt-4 border-t border-neutral-100 text-xs">
            
            <div className="p-4 bg-[#faf8f5] rounded-xs border border-neutral-200 space-y-1.5">
              <div className="flex items-center gap-2 text-neutral-900 font-semibold uppercase tracking-wider">
                <Calendar className="w-4 h-4 text-[#c5a880]" />
                <span>Fecha Estimada de Entrega</span>
              </div>
              <p className="text-sm font-medium text-neutral-800 capitalize">
                {estimatedDelivery}
              </p>
              <p className="text-[11px] text-neutral-400">
                Transportista: Courier DHL Express Air
              </p>
            </div>

            <div className="p-4 bg-[#faf8f5] rounded-xs border border-neutral-200 space-y-1.5">
              <div className="flex items-center gap-2 text-neutral-900 font-semibold uppercase tracking-wider">
                <MapPin className="w-4 h-4 text-[#c5a880]" />
                <span>Dirección de Destino</span>
              </div>
              <p className="text-xs text-neutral-800">
                {order?.customer.firstName} {order?.customer.lastName}
              </p>
              <p className="text-[11px] text-neutral-500">
                {order?.customer.address}, {order?.customer.city} ({order?.customer.postalCode})
              </p>
            </div>

          </div>

          {/* Purchased Items Breakdown */}
          {order && (
            <div className="text-left pt-6 border-t border-neutral-100 space-y-3">
              <h3 className="text-xs uppercase tracking-wider font-semibold text-neutral-900">
                Prendas en este Envío ({order.items.length})
              </h3>
              <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-xs overflow-hidden">
                {order.items.map((item, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between text-xs bg-white">
                    <div>
                      <h4 className="font-semibold text-neutral-900">{item.product.name}</h4>
                      <p className="text-[11px] text-neutral-500">
                        Talla: {item.selectedSize} • {item.selectedColor.name} • Cantidad: {item.quantity}
                      </p>
                    </div>
                    <span className="font-semibold text-neutral-900">
                      ${item.product.price * item.quantity}
                    </span>
                  </div>
                ))}
                <div className="p-3.5 bg-neutral-50 flex justify-between text-xs font-semibold text-neutral-900">
                  <span>Total Abonado ({order.paymentMethod}):</span>
                  <span>${order.total}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-6 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="w-full sm:w-auto px-6 py-3 border border-neutral-300 hover:border-black text-neutral-800 text-xs uppercase tracking-widest font-semibold transition-colors rounded-xs flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Recibo</span>
            </button>

            <Link
              href="/perfil"
              className="w-full sm:w-auto px-6 py-3 bg-[#faf8f5] hover:bg-neutral-200 text-neutral-900 border border-neutral-300 text-xs uppercase tracking-widest font-semibold transition-colors rounded-xs flex items-center justify-center gap-2"
            >
              <Package className="w-4 h-4" />
              <span>Ver Historial de Pedidos</span>
            </Link>

            <Link
              href="/shop"
              className="w-full sm:w-auto px-6 py-3 bg-neutral-900 hover:bg-black text-white text-xs uppercase tracking-widest font-semibold transition-colors rounded-xs flex items-center justify-center gap-2"
            >
              <span>Seguir Comprando</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen py-24 text-center text-xs uppercase tracking-widest text-neutral-400">Cargando comprobante de compra...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
