'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  Award,
  Star,
  Quote,
  Check,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { ProductCard } from '@/components/product/ProductCard';

export default function HomePage() {
  const { products, categories, siteSettings } = useStore();
  const [bestsellerTab, setBestsellerTab] = useState<'todos' | 'mujer' | 'hombre' | 'unisex'>('todos');

  // Filtered lists
  const bestSellers = products.filter((p) => {
    if (bestsellerTab === 'todos') return p.isBestSeller;
    return p.isBestSeller && (p.gender === bestsellerTab || p.gender === 'unisex');
  });

  const newArrivals = products.filter((p) => p.isNew);
  const saleProducts = products.filter((p) => p.isSale);

  const featuredCategories = categories.filter((c) => c.showInHome);
  const homeCategories = featuredCategories.length > 0 ? featuredCategories : categories.slice(0, 3);

  const getCategoryHref = (cat: { slug: string; filterType?: 'category' | 'gender' }) => {
    if (cat.filterType === 'gender' || ['mujer', 'hombre', 'unisex'].includes(cat.slug)) {
      return `/shop?gender=${cat.slug}`;
    }
    return `/shop?category=${cat.slug}`;
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION: Impacto Editorial de Alta Costura */}
      <section className="relative h-[85vh] sm:h-[92vh] w-full overflow-hidden bg-neutral-900 flex items-center justify-center">
        {/* Background Editorial Image */}
        <Image
          src={
            siteSettings.heroImage ||
            'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000&auto=format&fit=crop'
          }
          alt={siteSettings.heroTitleLine1}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-75 scale-100 animate-fade-in transition-transform duration-1000 ease-out"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/30" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white space-y-6">
          {siteSettings.heroBadge && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[11px] uppercase tracking-[0.3em] font-medium text-[#f4f1ea]">
              <Sparkles className="w-3.5 h-3.5 text-[#c5a880]" />
              <span>{siteSettings.heroBadge}</span>
            </div>
          )}

          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-[1.05] font-light uppercase">
            {siteSettings.heroTitleLine1} <br />
            <span className="italic font-normal">{siteSettings.heroTitleItalic}</span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-neutral-200 max-w-xl mx-auto font-light tracking-wide leading-relaxed">
            {siteSettings.heroSubtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href={siteSettings.heroPrimaryCtaHref || '/shop'}
              className="w-full sm:w-auto px-8 py-4 bg-white text-black hover:bg-neutral-100 text-xs uppercase tracking-[0.2em] font-semibold transition-all rounded-xs shadow-xl hover:scale-105 duration-300 flex items-center justify-center gap-2"
            >
              <span>{siteSettings.heroPrimaryCtaText || 'Comprar Ahora'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href={siteSettings.heroSecondaryCtaHref || '/shop?sort=new'}
              className="w-full sm:w-auto px-8 py-4 bg-transparent text-white hover:bg-white/10 border border-white/40 text-xs uppercase tracking-[0.2em] font-medium transition-all rounded-xs backdrop-blur-xs"
            >
              {siteSettings.heroSecondaryCtaText || 'Ver Novedades'}
            </Link>
          </div>
        </div>

        {/* Bottom subtle indicator */}
        <div className="absolute bottom-6 inset-x-0 flex justify-center text-white/50 text-[10px] uppercase tracking-[0.3em]">
          <span>Desliza para explorar</span>
        </div>
      </section>

      {/* 2. VALUE PROPOSITION STRIP: Trust & Exclusivity */}
      <section className="bg-[#faf8f5] border-y border-[#ede8df] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center space-y-2 p-2">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-xs text-neutral-800">
                <Truck className="w-5 h-5 text-[#c5a880]" />
              </div>
              <h4 className="text-xs uppercase tracking-wider font-semibold text-neutral-900">
                Envíos Express Globales
              </h4>
              <p className="text-[11px] text-neutral-500 max-w-xs">
                Gratuitos a partir de ${siteSettings.freeShippingThreshold}. Entrega en 24-48 horas en Europa y América.
              </p>
            </div>

            <div className="flex flex-col items-center space-y-2 p-2">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-xs text-neutral-800">
                <Award className="w-5 h-5 text-[#c5a880]" />
              </div>
              <h4 className="text-xs uppercase tracking-wider font-semibold text-neutral-900">
                Materiales Nobles
              </h4>
              <p className="text-[11px] text-neutral-500 max-w-xs">
                Lana virgen, seda mulberry 22 momme y algodón orgánico certificado.
              </p>
            </div>

            <div className="flex flex-col items-center space-y-2 p-2">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-xs text-neutral-800">
                <RotateCcw className="w-5 h-5 text-[#c5a880]" />
              </div>
              <h4 className="text-xs uppercase tracking-wider font-semibold text-neutral-900">
                Devoluciones 30 Días
              </h4>
              <p className="text-[11px] text-neutral-500 max-w-xs">
                Pruébate las prendas en casa con recogida y cambio de talla gratuito.
              </p>
            </div>

            <div className="flex flex-col items-center space-y-2 p-2">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-xs text-neutral-800">
                <ShieldCheck className="w-5 h-5 text-[#c5a880]" />
              </div>
              <h4 className="text-xs uppercase tracking-wider font-semibold text-neutral-900">
                Pago Cifrado & Seguro
              </h4>
              <p className="text-[11px] text-neutral-500 max-w-xs">
                Pasarelas de alta seguridad con Stripe, Apple Pay, PayPal y Visa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED CATEGORIES: Tarjetas Editoriales Dinámicas */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-[#c5a880] font-semibold block mb-2">
                Explorar por Categoría
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-neutral-900 font-normal">
                El Universo {siteSettings.brandName}
              </h2>
            </div>
            <Link
              href="/shop"
              className="mt-4 md:mt-0 text-xs uppercase tracking-widest text-neutral-800 hover:text-black font-semibold inline-flex items-center gap-1.5 group"
            >
              <span>Ver todas las categorías</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {homeCategories.map((cat) => (
              <Link
                key={cat.id}
                href={getCategoryHref(cat)}
                className="group relative h-[480px] overflow-hidden rounded-xs bg-neutral-100 block"
              >
                <Image
                  src={
                    cat.image ||
                    'https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=800&auto=format&fit=crop'
                  }
                  alt={cat.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-6 inset-x-6 text-white space-y-2">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-[#c5a880]">
                    {cat.badge || 'Colección'}
                  </span>
                  <h3 className="font-serif text-2xl tracking-wide font-light">{cat.name}</h3>
                  <p className="text-xs text-neutral-300 font-light line-clamp-2">
                    {cat.description}
                  </p>
                  <div className="pt-2 flex items-center text-xs uppercase tracking-widest font-semibold text-white group-hover:underline">
                    <span>Descubrir Colección →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. BEST SELLERS: Productos Más Vendidos con Pestañas Interactivas */}
      <section className="py-20 bg-[#faf8f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
            <span className="text-xs uppercase tracking-[0.25em] text-[#c5a880] font-semibold block">
              Preferidos de la Maison
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-neutral-900 font-normal">
              Prendas Más Vendidas
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500">
              Las piezas más icónicas elegidas por nuestros clientes de todo el mundo.
            </p>

            {/* Filter Tabs */}
            <div className="flex items-center justify-center gap-2 pt-4">
              {(['todos', 'mujer', 'hombre', 'unisex'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setBestsellerTab(tab)}
                  className={`px-4 py-2 text-xs uppercase tracking-widest font-medium rounded-full transition-all ${
                    bestsellerTab === tab
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
                  }`}
                >
                  {tab === 'todos' ? 'Todos' : tab}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-neutral-900 text-white text-xs uppercase tracking-widest font-semibold hover:bg-black transition-all rounded-xs shadow-md"
            >
              <span>Ver Catálogo Completo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. EDITORIAL LOOKBOOK PROMO BANNER */}
      <section className="relative py-28 bg-[#111111] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <Image
            src={
              siteSettings.lookbookImage ||
              'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2000&auto=format&fit=crop'
            }
            alt={siteSettings.lookbookTitle}
            fill
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl space-y-6">
            <span className="text-xs uppercase tracking-[0.3em] text-[#c5a880] font-semibold">
              {siteSettings.lookbookBadge}
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-light leading-tight">
              {siteSettings.lookbookTitle}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 font-light leading-relaxed">
              {siteSettings.lookbookDescription}
            </p>
            {siteSettings.lookbookCouponCode && (
              <div className="p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-neutral-300 block">
                    Beneficio de Temporada
                  </span>
                  <span className="text-xs font-semibold text-white">
                    Descuento exclusivo en el checkout con el código:
                  </span>
                </div>
                <span className="px-3 py-1.5 bg-[#c5a880] text-black text-xs font-mono font-bold tracking-widest rounded-xs">
                  {siteSettings.lookbookCouponCode}
                </span>
              </div>
            )}
            <div>
              <Link
                href={siteSettings.lookbookCtaHref || '/shop?sale=true'}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black text-xs uppercase tracking-widest font-semibold hover:bg-neutral-100 transition-all rounded-xs"
              >
                <span>{siteSettings.lookbookCtaText || 'Descubrir Piezas Seleccionadas'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. NEW ARRIVALS: Novedades de Temporada */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-[#c5a880] font-semibold block mb-2">
                Nuevas Incorporaciones
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-neutral-900 font-normal">
                Recién Llegadas al Atelier
              </h2>
            </div>
            <Link
              href="/shop?sort=new"
              className="mt-4 sm:mt-0 text-xs uppercase tracking-widest text-neutral-800 hover:text-black font-semibold inline-flex items-center gap-1.5 group"
            >
              <span>Ver todas las novedades</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12">
            {newArrivals.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 7. SPECIAL OFFERS: Sección de Ofertas Especiales */}
      {saleProducts.length > 0 && (
        <section className="py-20 bg-[#faf8f5] border-t border-[#ede8df]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
              <div>
                <span className="text-xs uppercase tracking-[0.25em] text-rose-700 font-semibold block mb-2">
                  Venta Privada & Archivo
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl text-neutral-900 font-normal">
                  Ofertas Exclusivas
                </h2>
              </div>
              <Link
                href="/shop?sale=true"
                className="mt-4 sm:mt-0 text-xs uppercase tracking-widest text-rose-700 hover:text-rose-900 font-semibold inline-flex items-center gap-1.5 group"
              >
                <span>Explorar archivo con descuento</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12">
              {saleProducts.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8. TESTIMONIALS: Testimonios de Clientes Verificados */}
      {siteSettings.testimonials && siteSettings.testimonials.length > 0 && (
        <section className="py-20 bg-white border-t border-neutral-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
              <span className="text-xs uppercase tracking-[0.25em] text-[#c5a880] font-semibold block">
                Opiniones Reales
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-neutral-900 font-normal">
                Experiencias en el Atelier
              </h2>
              <div className="flex items-center justify-center gap-1 pt-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
                <span className="text-xs font-semibold text-neutral-800 ml-2">
                  4.9 / 5 estrellas en más de 1.200 pedidos
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {siteSettings.testimonials.map((t) => (
                <div
                  key={t.id}
                  className="bg-[#faf8f5] p-8 rounded-sm border border-[#eee8df] flex flex-col justify-between space-y-6"
                >
                  <div className="space-y-4">
                    <Quote className="w-8 h-8 text-[#c5a880]/40 stroke-[1.5]" />
                    <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed font-light italic">
                      &ldquo;{t.comment}&rdquo;
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#ede8df] flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
                        {t.name}
                      </h4>
                      <span className="text-[11px] text-neutral-500 block">{t.role}</span>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded">
                        <Check className="w-3 h-3" />
                        Comprador VIP
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
