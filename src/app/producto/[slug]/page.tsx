'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Heart, 
  ShoppingBag, 
  Star, 
  Truck, 
  RotateCcw, 
  ShieldCheck, 
  Ruler, 
  Plus, 
  Minus, 
  Check, 
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { ProductCard } from '@/components/product/ProductCard';
import { SizeGuideModal } from '@/components/product/SizeGuideModal';
import { ProductColor } from '@/types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const router = useRouter();

  const { getProductBySlug, products } = useStore();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const product = getProductBySlug(slug);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'descripcion' | 'composicion' | 'envios'>('descripcion');
  const [addedToast, setAddedToast] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedImage(0);
      setSelectedSize(product.sizes[0] || 'M');
      setSelectedColor(product.colors[0] || null);
      setQuantity(1);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center space-y-4">
        <h2 className="font-serif text-2xl text-neutral-800">Prenda no encontrada</h2>
        <p className="text-xs text-neutral-500 max-w-sm">
          La prenda que buscas no existe o ha sido retirada del catálogo de temporada.
        </p>
        <Link
          href="/shop"
          className="px-6 py-3 bg-neutral-900 text-white text-xs uppercase tracking-widest font-semibold rounded-xs"
        >
          Volver a la Colección
        </Link>
      </div>
    );
  }

  const isFavorite = isInWishlist(product.id);
  const relatedProducts = products
    .filter((p) => p.id !== product.id && (p.category === product.category || p.gender === product.gender))
    .slice(0, 4);

  const handleAddToCart = () => {
    if (!selectedColor) return;
    addToCart(product, selectedSize, selectedColor, quantity);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  const handleBuyNow = () => {
    if (!selectedColor) return;
    addToCart(product, selectedSize, selectedColor, quantity);
    router.push('/checkout');
  };

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="bg-white min-h-screen">
      
      {/* Breadcrumb Navigation */}
      <div className="border-b border-neutral-100 bg-[#faf8f5]/60 py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-2 text-xs text-neutral-500">
            <Link href="/" className="hover:text-black transition-colors">Inicio</Link>
            <ChevronRight className="w-3 h-3 text-neutral-400" />
            <Link href="/shop" className="hover:text-black transition-colors">Colección</Link>
            <ChevronRight className="w-3 h-3 text-neutral-400" />
            <Link href={`/shop?category=${product.category}`} className="hover:text-black uppercase tracking-wider transition-colors">
              {product.category}
            </Link>
            <ChevronRight className="w-3 h-3 text-neutral-400" />
            <span className="text-neutral-900 font-medium truncate max-w-[200px] sm:max-w-none">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      {/* Main Product Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          
          {/* Left Column: Image Gallery (Thumbs + Big View) */}
          <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
            
            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible shrink-0 pb-2 sm:pb-0">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-18 h-24 sm:w-20 sm:h-28 rounded-xs overflow-hidden border-2 transition-all shrink-0 ${
                      selectedImage === idx
                        ? 'border-neutral-900 ring-1 ring-neutral-900'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} thumbnail ${idx + 1}`}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main Stage Image */}
            <div className="relative aspect-[3/4] w-full bg-[#f4f2ee] rounded-xs overflow-hidden flex-1 group shadow-sm">
              <Image
                src={product.images[selectedImage] || product.images[0]}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover object-center transition-transform duration-700 hover:scale-105"
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                {product.isNew && (
                  <span className="bg-neutral-900 text-white text-[10px] uppercase tracking-[0.25em] px-3 py-1 font-semibold">
                    Nuevo Lanzamiento
                  </span>
                )}
                {product.isSale && discountPercent > 0 && (
                  <span className="bg-rose-700 text-white text-[10px] uppercase tracking-[0.25em] px-3 py-1 font-semibold">
                    -{discountPercent}% Exclusivo
                  </span>
                )}
              </div>

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                className={`absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md ${
                  isFavorite
                    ? 'bg-rose-50 text-rose-600'
                    : 'bg-white/80 backdrop-blur-sm text-neutral-800 hover:bg-white'
                }`}
                aria-label="Guardar en favoritos"
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-600 stroke-rose-600' : 'stroke-[1.6]'}`} />
              </button>
            </div>
          </div>

          {/* Right Column: Product Purchase Info */}
          <div className="lg:col-span-5 flex flex-col justify-start space-y-6">
            
            {/* SKU and Rating */}
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span className="tracking-widest uppercase">SKU: {product.sku}</span>
              <div className="flex items-center gap-1.5">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < Math.floor(product.rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-neutral-200 text-neutral-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-semibold text-neutral-700">{product.rating}</span>
                <span className="text-neutral-400">({product.reviewsCount} reseñas)</span>
              </div>
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-1">
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl text-neutral-900 font-normal tracking-tight">
                {product.name}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 font-light">
                {product.subtitle}
              </p>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 pb-4 border-b border-neutral-100">
              <span className="text-2xl sm:text-3xl font-semibold text-neutral-900">
                ${product.price}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-base text-neutral-400 line-through">
                    ${product.originalPrice}
                  </span>
                  <span className="text-xs text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-semibold">
                    Ahorras ${product.originalPrice - product.price}
                  </span>
                </>
              )}
            </div>

            {/* Color Selector */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="uppercase tracking-wider font-semibold text-neutral-900">
                  Color:{' '}
                  <span className="font-normal text-neutral-600">
                    {selectedColor?.name || product.colors[0]?.name}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`group relative p-0.5 rounded-full border-2 transition-all ${
                      selectedColor?.name === color.name
                        ? 'border-neutral-900 scale-110'
                        : 'border-transparent hover:border-neutral-300'
                    }`}
                  >
                    <span
                      className="block w-6 h-6 rounded-full border border-neutral-300"
                      style={{ backgroundColor: color.hex }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selector with Guide Button */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="uppercase tracking-wider font-semibold text-neutral-900">
                  Talla:{' '}
                  <span className="font-normal text-neutral-600">{selectedSize}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="flex items-center gap-1 text-neutral-600 hover:text-black uppercase tracking-wider font-semibold underline text-[11px]"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Guía de Tallas</span>
                </button>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 text-xs uppercase tracking-wider font-semibold border rounded-xs transition-all ${
                      selectedSize === size
                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:border-black'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Stock Availability Indicator */}
            <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50/70 border border-emerald-100 p-2.5 rounded-xs">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>
                {product.stock > 0
                  ? `En stock para entrega inmediata (${product.stock} unidades disponibles)`
                  : 'Agotado temporalmente'}
              </span>
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                {/* Quantity Stepper */}
                <div className="flex items-center border border-neutral-200 rounded-xs h-12 px-2">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1.5 text-neutral-500 hover:text-black transition-colors"
                    aria-label="Restar una unidad"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-4 text-sm font-semibold text-neutral-900 select-none">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-1.5 text-neutral-500 hover:text-black transition-colors"
                    aria-label="Sumar una unidad"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 h-12 flex items-center justify-center gap-2 bg-neutral-900 hover:bg-black text-white text-xs uppercase tracking-widest font-semibold transition-all rounded-xs shadow-md disabled:bg-neutral-300 disabled:cursor-not-allowed"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Añadir a la Cesta</span>
                </button>
              </div>

              {/* Buy Now Button (Direct Checkout) */}
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="w-full h-12 flex items-center justify-center gap-2 bg-[#f4f1ea] hover:bg-[#eae4d5] text-neutral-900 border border-[#e2dcd2] text-xs uppercase tracking-widest font-semibold transition-all rounded-xs shadow-xs disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-[#c5a880]" />
                <span>Comprar Ahora • Pago Rápido</span>
              </button>

              {addedToast && (
                <div className="bg-neutral-900 text-white text-xs py-2.5 px-4 rounded-xs text-center font-medium animate-fade-in flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>¡Prenda añadida a tu cesta con éxito!</span>
                </div>
              )}
            </div>

            {/* Trust Assurances Icons */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-neutral-100 text-[11px] text-neutral-600">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#c5a880]" />
                <span>Envío express en 24/48h</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-[#c5a880]" />
                <span>Devolución sin coste (30 días)</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#c5a880]" />
                <span>Garantía de confección artesanal</span>
              </div>
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-[#c5a880]" />
                <span>Packaging de lujo reciclable</span>
              </div>
            </div>

            {/* Informational Tabs */}
            <div className="pt-6 border-t border-neutral-100">
              <div className="flex border-b border-neutral-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('descripcion')}
                  className={`pb-3 text-xs uppercase tracking-wider font-semibold transition-colors mr-6 ${
                    activeTab === 'descripcion'
                      ? 'border-b-2 border-black text-black'
                      : 'text-neutral-400 hover:text-black'
                  }`}
                >
                  Descripción & Detalles
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('composicion')}
                  className={`pb-3 text-xs uppercase tracking-wider font-semibold transition-colors mr-6 ${
                    activeTab === 'composicion'
                      ? 'border-b-2 border-black text-black'
                      : 'text-neutral-400 hover:text-black'
                  }`}
                >
                  Composición & Cuidados
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('envios')}
                  className={`pb-3 text-xs uppercase tracking-wider font-semibold transition-colors ${
                    activeTab === 'envios'
                      ? 'border-b-2 border-black text-black'
                      : 'text-neutral-400 hover:text-black'
                  }`}
                >
                  Envíos & Devoluciones
                </button>
              </div>

              <div className="pt-4 text-xs text-neutral-600 leading-relaxed">
                {activeTab === 'descripcion' && (
                  <div className="space-y-3">
                    <p>{product.description}</p>
                    <ul className="list-disc pl-4 space-y-1 text-neutral-700">
                      {product.details.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeTab === 'composicion' && (
                  <div className="space-y-3">
                    <p>
                      <strong>Composición del tejido:</strong> {product.composition}
                    </p>
                    <div className="space-y-1">
                      <strong className="block text-neutral-800">Recomendaciones de cuidado:</strong>
                      <ul className="list-disc pl-4 space-y-1 text-neutral-700">
                        {product.care.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === 'envios' && (
                  <div className="space-y-2 text-neutral-700">
                    <p>
                      • <strong>Envío Estándar:</strong> Gratuito en compras a partir de $100. Entrega en 3 a 5 días laborables.
                    </p>
                    <p>
                      • <strong>Envío Express:</strong> $15 (o gratuito a partir de $150). Entrega garantizada en 24 a 48 horas con número de seguimiento en tiempo real.
                    </p>
                    <p>
                      • <strong>Devoluciones sin complicaciones:</strong> Tienes 30 días naturales desde la recepción para solicitar la devolución o el cambio de talla con etiqueta prepagada.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-24 pt-16 border-t border-neutral-100">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="text-xs uppercase tracking-[0.25em] text-[#c5a880] font-semibold block mb-1">
                  Completa el Look
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl text-neutral-900 font-normal">
                  Prendas Sugeridas
                </h3>
              </div>
              <Link
                href="/shop"
                className="text-xs uppercase tracking-widest text-neutral-800 hover:text-black font-semibold"
              >
                Ver Colección →
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Size Guide Modal */}
      <SizeGuideModal isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />
    </div>
  );
}
