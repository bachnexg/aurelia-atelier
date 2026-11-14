'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Tag, 
  ShieldCheck, 
  Truck 
} from 'lucide-react';
import { useCart } from '@/context/CartContext';

export function CartDrawer() {
  const {
    items,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
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

  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen]);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    if (res.success) {
      setCouponFeedback({ type: 'success', message: res.message });
      setCouponInput('');
    } else {
      setCouponFeedback({ type: 'error', message: res.message });
    }
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-neutral-100">
          
          {/* Header */}
          <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-neutral-900" />
              <h2 className="text-base font-serif uppercase tracking-widest text-neutral-900 font-semibold">
                Cesta de Compra
              </h2>
              <span className="text-xs bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-full font-medium">
                {totalItemsCount}
              </span>
            </div>
            <button
              type="button"
              onClick={closeCart}
              className="p-1.5 text-neutral-400 hover:text-black transition-colors rounded-sm"
              aria-label="Cerrar carrito"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Meter */}
          <div className="bg-[#faf8f5] px-6 py-3 border-b border-neutral-100 text-xs">
            <div className="flex items-center gap-2 mb-1.5 font-medium text-neutral-700">
              <Truck className="w-3.5 h-3.5 text-[#c5a880]" />
              {subtotal >= freeShippingThreshold ? (
                <span className="text-emerald-700 font-semibold">
                  ¡Felicidades! Tienes envío express gratuito garantizado.
                </span>
              ) : (
                <span>
                  Añade <strong className="text-black font-semibold">${freeShippingThreshold - subtotal}</strong> más para obtener <strong>envío gratuito</strong>.
                </span>
              )}
            </div>
            <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#111111] h-full transition-all duration-500 rounded-full"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {items.length === 0 ? (
              <div className="text-center py-20 space-y-4">
                <div className="w-16 h-16 mx-auto bg-neutral-100 rounded-full flex items-center justify-center text-neutral-400">
                  <ShoppingBag className="w-7 h-7 stroke-[1.2]" />
                </div>
                <h3 className="font-serif text-lg tracking-wide text-neutral-800">
                  Tu cesta está vacía
                </h3>
                <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                  Descubre nuestras prendas de sastrería artesanal y básicos esenciales de temporada.
                </p>
                <Link
                  href="/shop"
                  onClick={closeCart}
                  className="inline-block mt-4 px-6 py-3 bg-neutral-900 text-white text-xs uppercase tracking-widest hover:bg-black transition-all rounded-sm font-medium"
                >
                  Explorar Catálogo
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex gap-4 group">
                  <Link
                    href={`/producto/${item.product.slug}`}
                    onClick={closeCart}
                    className="relative w-20 h-28 bg-neutral-100 shrink-0 overflow-hidden rounded-xs"
                  >
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      sizes="80px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <Link
                          href={`/producto/${item.product.slug}`}
                          onClick={closeCart}
                          className="text-sm font-medium text-neutral-900 hover:text-neutral-600 transition-colors line-clamp-1"
                        >
                          {item.product.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="text-neutral-400 hover:text-rose-600 transition-colors p-1 -mr-1"
                          aria-label="Eliminar producto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Selected Attributes */}
                      <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
                        <span className="font-medium text-neutral-700">Talla: {item.selectedSize}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-neutral-300 inline-block"
                            style={{ backgroundColor: item.selectedColor.hex }}
                          />
                          <span className="text-[11px]">{item.selectedColor.name}</span>
                        </div>
                      </div>
                    </div>

                    {/* Quantity controls and price */}
                    <div className="flex items-center justify-between mt-3 pt-2">
                      <div className="flex items-center border border-neutral-200 rounded-sm">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 text-neutral-600 hover:text-black transition-colors"
                          aria-label="Disminuir cantidad"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-medium text-neutral-900 select-none">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 text-neutral-600 hover:text-black transition-colors"
                          aria-label="Aumentar cantidad"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-semibold text-neutral-900">
                          ${item.product.price * item.quantity}
                        </span>
                        {item.product.originalPrice && (
                          <span className="block text-[11px] text-neutral-400 line-through">
                            ${item.product.originalPrice * item.quantity}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Area */}
          {items.length > 0 && (
            <div className="p-6 border-t border-neutral-100 bg-white space-y-4">
              
              {/* Promo Code Input */}
              <div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-emerald-50 text-emerald-800 text-xs px-3 py-2 rounded border border-emerald-200">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5" />
                      <span>
                        Cupón <strong>{appliedCoupon.code}</strong> (-{appliedCoupon.discountPercent}%)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-xs text-rose-600 hover:underline uppercase tracking-wider"
                    >
                      Quitar
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Código de cupón (ej: AURELIA15)"
                      className="flex-1 text-xs px-3 py-2 border border-neutral-200 rounded-sm uppercase tracking-wider focus:outline-none focus:border-black"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 bg-neutral-900 text-white text-xs uppercase tracking-wider hover:bg-black transition-colors rounded-sm font-medium"
                    >
                      Aplicar
                    </button>
                  </form>
                )}
                {couponFeedback && (
                  <p className={`text-[11px] mt-1.5 ${couponFeedback.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {couponFeedback.message}
                  </p>
                )}
              </div>

              {/* Breakdown */}
              <div className="space-y-1.5 text-xs text-neutral-600 pt-2 border-t border-neutral-100">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-neutral-900">${subtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Descuento aplicado</span>
                    <span>-${discount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Envío Express</span>
                  <span>{shipping === 0 ? <strong className="text-emerald-700">Gratis</strong> : `$${shipping}`}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-neutral-900 pt-2 border-t border-neutral-100">
                  <span>Total Estimado</span>
                  <span>${total}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-neutral-900 hover:bg-black text-white text-xs uppercase tracking-widest font-semibold transition-all rounded-sm shadow-md"
                >
                  <span>Proceder al Pago</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/carrito"
                  onClick={closeCart}
                  className="w-full block text-center py-2.5 text-xs uppercase tracking-widest text-neutral-700 hover:text-black hover:bg-neutral-50 transition-colors border border-neutral-200 rounded-sm"
                >
                  Ver Cesta Completa
                </Link>
              </div>

              {/* Trust Badge */}
              <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-400 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-neutral-500" />
                <span>Pago seguro garantizado con cifrado SSL de 256 bits</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
