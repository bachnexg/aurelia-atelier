'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Tag, 
  Truck, 
  ShieldCheck, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    subtotal,
    discount,
    shipping,
    total,
    freeShippingThreshold,
    freeShippingProgress,
    totalItemsCount,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const res = applyCoupon(couponCode);
    if (res.success) {
      setCouponFeedback({ type: 'success', message: res.message });
      setCouponCode('');
    } else {
      setCouponFeedback({ type: 'error', message: res.message });
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center min-h-[60vh] flex flex-col items-center justify-center space-y-5">
        <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-400">
          <ShoppingBag className="w-10 h-10 stroke-[1.2]" />
        </div>
        <h1 className="font-serif text-3xl text-neutral-900 font-normal">
          Tu Cesta de Compra está Vacía
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 max-w-md">
          Aún no has agregado prendas a tu cesta. Explora nuestras piezas más destacadas de sastrería, seda y punto.
        </p>
        <Link
          href="/shop"
          className="mt-4 px-8 py-4 bg-neutral-900 hover:bg-black text-white text-xs uppercase tracking-widest font-semibold transition-all rounded-xs shadow-md"
        >
          Explorar Catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="pb-8 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] uppercase tracking-[0.25em] text-[#c5a880] font-semibold block mb-1">
              Revisión de Pedido
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-neutral-900 font-normal">
              Cesta de Compra ({totalItemsCount} prendas)
            </h1>
          </div>
          <button
            type="button"
            onClick={clearCart}
            className="text-xs uppercase tracking-wider text-neutral-400 hover:text-rose-600 transition-colors"
          >
            Vaciar cesta
          </button>
        </div>

        {/* Free Shipping Meter */}
        <div className="my-6 bg-[#faf8f5] p-4 rounded-xs border border-neutral-100">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="flex items-center gap-2 font-medium text-neutral-700">
              <Truck className="w-4 h-4 text-[#c5a880]" />
              {subtotal >= freeShippingThreshold ? (
                <strong className="text-emerald-700">
                  ¡Enhorabuena! Has desbloqueado el envío express gratuito.
                </strong>
              ) : (
                <span>
                  Te faltan <strong className="text-black">${freeShippingThreshold - subtotal}</strong> para envío express gratuito.
                </span>
              )}
            </span>
            <span className="font-semibold text-neutral-800">{freeShippingProgress}%</span>
          </div>
          <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-neutral-900 h-full rounded-full transition-all duration-500"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        {/* Cart Content: Table + Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-8">
          
          {/* Items Table */}
          <div className="lg:col-span-8 space-y-6">
            <div className="divide-y divide-neutral-100 border-t border-b border-neutral-100">
              {items.map((item) => (
                <div key={item.id} className="py-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between group">
                  
                  {/* Image & Info */}
                  <div className="flex items-center gap-4">
                    <Link
                      href={`/producto/${item.product.slug}`}
                      className="relative w-20 h-28 sm:w-24 sm:h-32 bg-neutral-100 rounded-xs overflow-hidden shrink-0"
                    >
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        sizes="96px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>

                    <div className="space-y-1">
                      <Link
                        href={`/producto/${item.product.slug}`}
                        className="text-sm sm:text-base font-medium text-neutral-900 hover:text-neutral-600 transition-colors line-clamp-1"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-xs text-neutral-400">
                        SKU: {item.product.sku}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-neutral-600 pt-1">
                        <span>Talla: <strong>{item.selectedSize}</strong></span>
                        <span>•</span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-3 h-3 rounded-full border border-neutral-300 inline-block"
                            style={{ backgroundColor: item.selectedColor.hex }}
                          />
                          <span>{item.selectedColor.name}</span>
                        </div>
                      </div>
                      <div className="sm:hidden pt-2 text-sm font-semibold text-neutral-900">
                        ${item.product.price}
                      </div>
                    </div>
                  </div>

                  {/* Quantity Stepper & Subtotal */}
                  <div className="flex items-center justify-between w-full sm:w-auto sm:gap-8 pt-3 sm:pt-0 border-t sm:border-0 border-neutral-50">
                    <div className="flex items-center border border-neutral-200 rounded-xs">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 text-neutral-500 hover:text-black transition-colors"
                        aria-label="Restar una unidad"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3.5 text-xs font-semibold text-neutral-900 select-none">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 text-neutral-500 hover:text-black transition-colors"
                        aria-label="Sumar una unidad"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-semibold text-neutral-900 block">
                        ${item.product.price * item.quantity}
                      </span>
                      {item.quantity > 1 && (
                        <span className="text-[11px] text-neutral-400">
                          ${item.product.price} c/u
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-neutral-400 hover:text-rose-600 transition-colors"
                      title="Eliminar prenda"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2">
              <Link
                href="/shop"
                className="text-xs uppercase tracking-wider text-neutral-600 hover:text-black font-semibold underline"
              >
                ← Continuar Comprando
              </Link>
            </div>
          </div>

          {/* Right Rail: Order Summary */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#faf8f5] p-6 sm:p-8 rounded-sm border border-neutral-200 space-y-6">
              <h2 className="font-serif text-xl uppercase tracking-wider text-neutral-900 font-semibold pb-4 border-b border-neutral-200">
                Resumen de Compra
              </h2>

              {/* Coupon Form */}
              <div>
                <span className="text-xs uppercase tracking-wider text-neutral-500 font-medium block mb-2">
                  ¿Tienes un cupón de descuento?
                </span>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-3 rounded-xs text-xs text-emerald-800">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-emerald-600" />
                      <span>
                        <strong>{appliedCoupon.code}</strong> (-{appliedCoupon.discountPercent}%)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-rose-600 hover:underline uppercase tracking-wider font-semibold"
                    >
                      Quitar
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Código (ej: AURELIA15)"
                      className="flex-1 text-xs px-3 py-2.5 bg-white border border-neutral-300 rounded-xs uppercase tracking-wider focus:outline-none focus:border-black"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-neutral-900 hover:bg-black text-white text-xs uppercase tracking-wider font-semibold rounded-xs transition-colors"
                    >
                      Aplicar
                    </button>
                  </form>
                )}
                {couponFeedback && (
                  <p className={`text-[11px] mt-1.5 ${couponFeedback.type === 'success' ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {couponFeedback.message}
                  </p>
                )}
              </div>

              {/* Breakdown */}
              <div className="space-y-3 text-xs text-neutral-600 pt-4 border-t border-neutral-200">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-neutral-900">${subtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Descuento ({appliedCoupon?.code})</span>
                    <span>-${discount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Envío Express</span>
                  <span>
                    {shipping === 0 ? (
                      <strong className="text-emerald-700">Gratuito</strong>
                    ) : (
                      `$${shipping}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-base font-semibold text-neutral-900 pt-4 border-t border-neutral-200">
                  <span>Total Final</span>
                  <span>${total}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <Link
                href="/checkout"
                className="w-full flex items-center justify-center gap-2 py-4 bg-neutral-900 hover:bg-black text-white text-xs uppercase tracking-widest font-semibold transition-all rounded-xs shadow-lg"
              >
                <span>Proceder al Checkout Seguro</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {/* Reassurances */}
              <div className="space-y-2 pt-2 text-[11px] text-neutral-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-neutral-700" />
                  <span>Transacción protegida con cifrado SSL</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-neutral-700" />
                  <span>30 días para cambios y devoluciones sin coste</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-neutral-700" />
                  <span>Atención al cliente personalizada</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
