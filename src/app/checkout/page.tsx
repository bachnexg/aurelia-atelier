'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  CreditCard, 
  Truck, 
  Lock, 
  CheckCircle2, 
  ArrowLeft, 
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/context/AuthContext';
import { ShippingAddress } from '@/types';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, discount, shipping, total, appliedCoupon, clearCart } = useCart();
  const { createOrder, products, siteSettings } = useStore();
  const { user } = useAuth();

  // Form State
  const [formData, setFormData] = useState<ShippingAddress>({
    firstName: user?.name ? user.name.split(' ')[0] : 'Elena',
    lastName: user?.name ? user.name.split(' ').slice(1).join(' ') || 'Garrido' : 'Garrido',
    email: user?.email || 'elena.garrido@example.com',
    phone: user?.phone || '+34 612 345 678',
    address: 'Calle Velázquez 48, 3º Izquierda',
    apartment: '',
    city: 'Madrid',
    state: 'Comunidad de Madrid',
    postalCode: '28001',
    country: 'España',
  });

  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('express');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'applepay' | 'transfer'>('card');
  
  // Card details
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8892');
  const [cardExpiry, setCardExpiry] = useState('11/28');
  const [cardCvc, setCardCvc] = useState('842');
  const [cardName, setCardName] = useState('ELENA GARRIDO');

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="font-serif text-2xl text-neutral-800">No hay productos en la cesta</h2>
        <p className="text-xs text-neutral-500">
          Tu cesta está vacía. Selecciona alguna prenda antes de proceder al checkout.
        </p>
        <Link
          href="/shop"
          className="inline-block px-6 py-3 bg-neutral-900 text-white text-xs uppercase tracking-widest font-semibold rounded-xs"
        >
          Ir a la Tienda
        </Link>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.address || !formData.city || !formData.postalCode) {
      setErrorMessage('Por favor completa todos los campos obligatorios de envío.');
      return;
    }

    // Verify stock availability before processing
    for (const item of items) {
      const liveProd = products.find((p) => p.id === item.product.id);
      if (!liveProd || liveProd.stock < item.quantity) {
        setErrorMessage(
          `Stock insuficiente para "${item.product.name}". Disponible: ${liveProd?.stock ?? 0} uds.`
        );
        return;
      }
    }

    setIsProcessing(true);

    try {
      const response = await fetch('/api/checkout/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            size: item.selectedSize,
            color: item.selectedColor.name,
            image: item.product.images[0],
          })),
          couponCode: appliedCoupon?.code,
          discountPercent: appliedCoupon?.discountPercent,
          shippingAddress: formData,
          paymentMethod,
          freeShippingThreshold: siteSettings.freeShippingThreshold,
          standardShippingCost: siteSettings.standardShippingCost,
        }),
      });

      const gatewayResult = await response.json();

      if (!response.ok) {
        setErrorMessage(gatewayResult.error || 'Error de validación en el servidor.');
        setIsProcessing(false);
        return;
      }

      const verified = gatewayResult.verifiedTotals || { subtotal, discount, shipping, total };

      const newOrder = createOrder({
        customer: formData,
        items,
        subtotal: verified.subtotal,
        discount: verified.discount,
        shipping: verified.shipping,
        total: verified.total,
        paymentMethod: paymentMethod === 'card' 
          ? `Tarjeta de Crédito (**** ${cardNumber.slice(-4) || '8892'})` 
          : paymentMethod === 'paypal' 
          ? 'PayPal' 
          : paymentMethod === 'applepay'
          ? 'Apple Pay'
          : 'Transferencia Bancaria',
        couponCode: appliedCoupon?.code,
      });

      // Clear the cart
      clearCart();

      // If Stripe live hosted checkout URL is returned, redirect to Stripe
      if (gatewayResult.url) {
        window.location.href = gatewayResult.url;
        return;
      }

      // Redirect to Order Confirmation Success page
      router.push(`/checkout/success?order=${newOrder.orderNumber}`);
    } catch {
      setErrorMessage('Ocurrió un error al procesar el pago con la pasarela. Por favor intenta de nuevo.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-[#faf8f5] min-h-screen py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link & Security Badge */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-neutral-200">
          <Link
            href="/carrito"
            className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-neutral-600 hover:text-black font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a la Cesta</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
            <Lock className="w-3.5 h-3.5 text-emerald-700" />
            <span>Pasarela Segura SSL 256-Bit</span>
          </div>
        </div>

        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left 7 Columns: Checkout Form */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* Step 1: Contact & Shipping Details */}
              <div className="bg-white p-6 sm:p-8 rounded-sm border border-neutral-200 shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-neutral-900 text-white text-xs flex items-center justify-center font-bold">
                      1
                    </span>
                    <h2 className="font-serif text-lg uppercase tracking-wider text-neutral-900 font-semibold">
                      Información de Contacto y Envío
                    </h2>
                  </div>
                  <span className="text-[11px] text-neutral-400 uppercase tracking-wider">
                    Paso obligatorio
                  </span>
                </div>

                {errorMessage && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neutral-600 font-semibold mb-1.5">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full text-xs px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xs focus:bg-white focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neutral-600 font-semibold mb-1.5">
                      Apellidos *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full text-xs px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xs focus:bg-white focus:outline-none focus:border-black"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs uppercase tracking-wider text-neutral-600 font-semibold mb-1.5">
                      Correo Electrónico (para confirmación de pedido y tracking) *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full text-xs px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xs focus:bg-white focus:outline-none focus:border-black"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs uppercase tracking-wider text-neutral-600 font-semibold mb-1.5">
                      Teléfono de Contacto (para el transportista) *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full text-xs px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xs focus:bg-white focus:outline-none focus:border-black"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs uppercase tracking-wider text-neutral-600 font-semibold mb-1.5">
                      Dirección y Número *
                    </label>
                    <input
                      type="text"
                      name="address"
                      required
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full text-xs px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xs focus:bg-white focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neutral-600 font-semibold mb-1.5">
                      Ciudad *
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full text-xs px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xs focus:bg-white focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neutral-600 font-semibold mb-1.5">
                      Código Postal *
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      required
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className="w-full text-xs px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xs focus:bg-white focus:outline-none focus:border-black"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs uppercase tracking-wider text-neutral-600 font-semibold mb-1.5">
                      País *
                    </label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full text-xs px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xs focus:bg-white focus:outline-none focus:border-black cursor-pointer"
                    >
                      <option value="España">España</option>
                      <option value="Francia">Francia</option>
                      <option value="Italia">Italia</option>
                      <option value="Alemania">Alemania</option>
                      <option value="Portugal">Portugal</option>
                      <option value="Estados Unidos">Estados Unidos</option>
                      <option value="México">México</option>
                      <option value="Colombia">Colombia</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 2: Shipping Method */}
              <div className="bg-white p-6 sm:p-8 rounded-sm border border-neutral-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 pb-4 border-b border-neutral-100">
                  <span className="w-6 h-6 rounded-full bg-neutral-900 text-white text-xs flex items-center justify-center font-bold">
                    2
                  </span>
                  <h2 className="font-serif text-lg uppercase tracking-wider text-neutral-900 font-semibold">
                    Método de Entrega
                  </h2>
                </div>

                <div className="space-y-3">
                  <label
                    onClick={() => setShippingMethod('express')}
                    className={`flex items-center justify-between p-4 border rounded-xs cursor-pointer transition-all ${
                      shippingMethod === 'express'
                        ? 'border-neutral-900 bg-[#faf8f5]'
                        : 'border-neutral-200 hover:border-neutral-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Truck className="w-5 h-5 text-[#c5a880]" />
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wider text-neutral-900">
                          Entrega Express Courier (DHL / GLS)
                        </div>
                        <div className="text-[11px] text-neutral-500">
                          Entrega garantizada en 24 a 48 horas con seguimiento en vivo
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-neutral-900">
                      {shipping === 0 ? 'Gratis' : `$${shipping}`}
                    </span>
                  </label>
                </div>
              </div>

              {/* Step 3: Payment Method */}
              <div className="bg-white p-6 sm:p-8 rounded-sm border border-neutral-200 shadow-xs space-y-6">
                <div className="flex items-center gap-2.5 pb-4 border-b border-neutral-100">
                  <span className="w-6 h-6 rounded-full bg-neutral-900 text-white text-xs flex items-center justify-center font-bold">
                    3
                  </span>
                  <h2 className="font-serif text-lg uppercase tracking-wider text-neutral-900 font-semibold">
                    Método de Pago
                  </h2>
                </div>

                {/* Payment Option Selector */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 border rounded-xs text-xs font-semibold uppercase tracking-wider transition-all flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'card'
                        ? 'border-neutral-900 bg-neutral-900 text-white'
                        : 'border-neutral-200 text-neutral-700 hover:border-black'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Tarjeta</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('paypal')}
                    className={`p-3 border rounded-xs text-xs font-semibold uppercase tracking-wider transition-all flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'paypal'
                        ? 'border-neutral-900 bg-neutral-900 text-white'
                        : 'border-neutral-200 text-neutral-700 hover:border-black'
                    }`}
                  >
                    <span>PayPal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('applepay')}
                    className={`p-3 border rounded-xs text-xs font-semibold uppercase tracking-wider transition-all flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'applepay'
                        ? 'border-neutral-900 bg-neutral-900 text-white'
                        : 'border-neutral-200 text-neutral-700 hover:border-black'
                    }`}
                  >
                    <span>Apple Pay</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('transfer')}
                    className={`p-3 border rounded-xs text-xs font-semibold uppercase tracking-wider transition-all flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'transfer'
                        ? 'border-neutral-900 bg-neutral-900 text-white'
                        : 'border-neutral-200 text-neutral-700 hover:border-black'
                    }`}
                  >
                    <span>Transferencia</span>
                  </button>
                </div>

                {/* Card Fields */}
                {paymentMethod === 'card' && (
                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-neutral-600 font-semibold mb-1.5">
                        Número de Tarjeta
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="1234 5678 9012 3456"
                        className="w-full text-xs px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xs focus:bg-white focus:outline-none focus:border-black font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs uppercase tracking-wider text-neutral-600 font-semibold mb-1.5">
                          Fecha Expiración (MM/AA)
                        </label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/AA"
                          className="w-full text-xs px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xs focus:bg-white focus:outline-none focus:border-black font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs uppercase tracking-wider text-neutral-600 font-semibold mb-1.5">
                          Código CVC / CVV
                        </label>
                        <input
                          type="text"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          placeholder="CVC"
                          maxLength={4}
                          className="w-full text-xs px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xs focus:bg-white focus:outline-none focus:border-black font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-neutral-600 font-semibold mb-1.5">
                        Titular de la Tarjeta
                      </label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="Nombre completo tal como aparece en la tarjeta"
                        className="w-full text-xs px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xs focus:bg-white focus:outline-none focus:border-black uppercase"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'paypal' && (
                  <div className="p-4 bg-sky-50 border border-sky-100 rounded-xs text-xs text-sky-900 leading-relaxed">
                    Serás redirigido a la pasarela segura de PayPal para autorizar el cobro de tu compra de forma protegida.
                  </div>
                )}

                {paymentMethod === 'applepay' && (
                  <div className="p-4 bg-neutral-100 border border-neutral-200 rounded-xs text-xs text-neutral-800 leading-relaxed">
                    Autoriza tu compra instantáneamente con Touch ID / Face ID a través de Apple Pay en tu dispositivo.
                  </div>
                )}

                {paymentMethod === 'transfer' && (
                  <div className="p-4 bg-[#faf8f5] border border-neutral-200 rounded-xs text-xs text-neutral-700 space-y-1">
                    <p className="font-semibold text-neutral-900">Instrucciones de Transferencia Bancaria:</p>
                    <p>Banco: Santander / BBVA Private Banking</p>
                    <p>IBAN: ES76 0049 1500 0512 3456 7890</p>
                    <p>Beneficiario: VALISBE S.L.</p>
                    <p className="text-[11px] text-neutral-500 pt-1">
                      Tu pedido se procesará y reservará inmediatamente al completar el checkout.
                    </p>
                  </div>
                )}
              </div>

            </div>

            {/* Right 5 Columns: Sticky Order Summary */}
            <div className="lg:col-span-5">
              <div className="bg-white p-6 sm:p-8 rounded-sm border border-neutral-200 shadow-xs sticky top-24 space-y-6">
                <h3 className="font-serif text-lg uppercase tracking-wider text-neutral-900 font-semibold pb-4 border-b border-neutral-100">
                  Resumen de tu Pedido
                </h3>

                {/* Items preview list */}
                <div className="max-h-72 overflow-y-auto divide-y divide-neutral-100 pr-1 space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="pt-3 first:pt-0 flex items-center gap-3">
                      <div className="relative w-14 h-18 bg-neutral-100 rounded-xs overflow-hidden shrink-0">
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-neutral-900 truncate">
                          {item.product.name}
                        </h4>
                        <p className="text-[11px] text-neutral-500">
                          Talla: {item.selectedSize} • {item.selectedColor.name}
                        </p>
                        <p className="text-[11px] text-neutral-400">
                          Cant: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right text-xs font-semibold text-neutral-900 shrink-0">
                        ${item.product.price * item.quantity}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Financial Math */}
                <div className="space-y-2.5 pt-4 border-t border-neutral-100 text-xs text-neutral-600">
                  <div className="flex justify-between">
                    <span>Subtotal de prendas</span>
                    <span className="font-medium text-neutral-900">${subtotal}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Descuento aplicado ({appliedCoupon?.code})</span>
                      <span>-${discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Envío Courier</span>
                    <span>{shipping === 0 ? <strong className="text-emerald-700">Gratuito</strong> : `$${shipping}`}</span>
                  </div>
                  <div className="flex justify-between text-base font-semibold text-neutral-900 pt-3 border-t border-neutral-100">
                    <span>Total a Pagar</span>
                    <span>${total}</span>
                  </div>
                </div>

                {/* Submit Order Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 bg-neutral-900 hover:bg-black text-white text-xs uppercase tracking-widest font-semibold transition-all rounded-xs shadow-lg flex items-center justify-center gap-2 disabled:bg-neutral-400 cursor-pointer"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Autorizando pago seguro...</span>
                    </div>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Confirmar y Pagar ${total}</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-neutral-400 text-center leading-relaxed">
                  Al hacer clic en &ldquo;Confirmar y Pagar&rdquo;, aceptas los Términos de Servicio y la Política de Devoluciones de 30 días de VALISBE.
                </p>
              </div>
            </div>

          </div>
        </form>

      </div>
    </div>
  );
}
