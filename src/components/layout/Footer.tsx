'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export function Footer() {
  const { categories, siteSettings } = useStore();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;
    setSubscribed(true);
    setEmail('');
  };

  const getCategoryHref = (cat: { slug: string; filterType?: 'category' | 'gender' }) => {
    if (cat.filterType === 'gender' || ['mujer', 'hombre', 'unisex'].includes(cat.slug)) {
      return `/shop?gender=${cat.slug}`;
    }
    return `/shop?category=${cat.slug}`;
  };

  return (
    <footer className="bg-[#0f0f10] text-[#eeeae3] pt-16 pb-12 border-t border-neutral-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Newsletter Section */}
        <div className="border-b border-neutral-800 pb-16 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-3">
              <span className="text-[11px] uppercase tracking-[0.3em] text-[#c5a880] font-semibold block">
                {siteSettings.newsletterBadge}
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl tracking-wide text-white font-normal">
                {siteSettings.newsletterTitle}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-lg leading-relaxed">
                {siteSettings.newsletterDescription}
              </p>
            </div>

            <div className="lg:col-span-6">
              {subscribed ? (
                <div className="bg-neutral-900 border border-neutral-700 p-4 rounded-sm flex items-center gap-3 text-emerald-400 text-xs sm:text-sm">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>
                    ¡Gracias por unirte! Usa el código <strong>BIENVENIDA10</strong> en el checkout para disfrutar de tu descuento de bienvenida.
                  </span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Introduce tu correo electrónico..."
                      className="w-full bg-neutral-900/80 border border-neutral-700 text-white text-xs pl-10 pr-4 py-3.5 rounded-sm focus:outline-none focus:border-[#c5a880] transition-colors placeholder:text-neutral-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 bg-[#f4f1ea] hover:bg-white text-black px-6 py-3.5 text-xs uppercase tracking-widest font-semibold transition-all rounded-sm shrink-0 shadow-sm"
                  >
                    <span>Suscribirme</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Links Navigation Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-16 border-b border-neutral-800 text-xs">
          {/* Column 1: Colecciones dinámicas */}
          <div className="space-y-4">
            <h4 className="text-[11px] uppercase tracking-[0.25em] text-white font-semibold">
              Colecciones
            </h4>
            <ul className="space-y-2.5 text-neutral-400">
              {categories.slice(0, 7).map((cat) => (
                <li key={cat.id}>
                  <Link href={getCategoryHref(cat)} className="hover:text-white transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/shop?sale=true" className="text-rose-400 hover:text-rose-300 transition-colors">
                  Archivo & Ofertas
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Asistencia al Cliente */}
          <div className="space-y-4">
            <h4 className="text-[11px] uppercase tracking-[0.25em] text-white font-semibold">
              Atención al Cliente
            </h4>
            <ul className="space-y-2.5 text-neutral-400">
              <li>
                <Link href="/perfil" className="hover:text-white transition-colors">
                  Localizador de Pedidos
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-white transition-colors">
                  Envíos Gratis desde ${siteSettings.freeShippingThreshold}
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-white transition-colors">
                  Devoluciones Gratuitas (30 días)
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-white transition-colors">
                  Guía de Tallas & Calce
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-white transition-colors">
                  Cuidado de Tejidos Nobles
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: La Maison */}
          <div className="space-y-4">
            <h4 className="text-[11px] uppercase tracking-[0.25em] text-white font-semibold">
              La Maison
            </h4>
            <ul className="space-y-2.5 text-neutral-400">
              <li>
                <span className="text-neutral-300">Historia & Filosofía Minimalista</span>
              </li>
              <li>
                <span className="text-neutral-300">Sostenibilidad & Trazabilidad</span>
              </li>
              <li>
                <span className="text-neutral-300">Nuestros Talleres en Florencia y Biella</span>
              </li>
              <li>
                <span className="text-neutral-300">Prensa & Editoriales</span>
              </li>
              <li>
                <span className="text-neutral-300">Carreras en {siteSettings.brandName}</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Boutiques & Contacto */}
          <div className="space-y-4">
            <h4 className="text-[11px] uppercase tracking-[0.25em] text-white font-semibold">
              Showrooms
            </h4>
            <div className="text-neutral-400 space-y-2 leading-relaxed">
              <p>
                <strong className="text-white block">{siteSettings.showroom1Title}</strong>
                {siteSettings.showroom1Address}
              </p>
              <p>
                <strong className="text-white block">{siteSettings.showroom2Title}</strong>
                {siteSettings.showroom2Address}
              </p>
              <p className="pt-2">
                <span className="text-neutral-300 block">Horario Atelier:</span>
                {siteSettings.atelierHours}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Payments, Currency */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div>
            © 2026 {siteSettings.brandName} {siteSettings.brandSubtitle} S.L. Todos los derechos reservados.
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] tracking-wider uppercase bg-neutral-900 px-2 py-1 rounded text-neutral-400">
              VISA
            </span>
            <span className="text-[10px] tracking-wider uppercase bg-neutral-900 px-2 py-1 rounded text-neutral-400">
              MASTERCARD
            </span>
            <span className="text-[10px] tracking-wider uppercase bg-neutral-900 px-2 py-1 rounded text-neutral-400">
              AMEX
            </span>
            <span className="text-[10px] tracking-wider uppercase bg-neutral-900 px-2 py-1 rounded text-neutral-400">
              APPLE PAY
            </span>
            <span className="text-[10px] tracking-wider uppercase bg-neutral-900 px-2 py-1 rounded text-neutral-400">
              PAYPAL
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>España (USD $)</span>
            <span>•</span>
            <span>Español</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
