'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, ArrowRight, Trash2, ShoppingBag } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { ProductCard } from '@/components/product/ProductCard';

export default function WishlistPage() {
  const { wishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveAllToCart = () => {
    wishlist.forEach((p) => {
      addToCart(p, p.sizes[0] || 'M', p.colors[0], 1);
    });
  };

  if (wishlist.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-400">
          <Heart className="w-8 h-8 stroke-[1.2]" />
        </div>
        <h1 className="font-serif text-3xl text-neutral-900 font-normal">
          Tu Lista de Favoritos está Vacía
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 max-w-sm">
          Guarda tus prendas y accesorios favoritos para no perderlos de vista y agregarlos a tu cesta cuando desees.
        </p>
        <Link
          href="/shop"
          className="mt-4 px-8 py-3.5 bg-neutral-900 hover:bg-black text-white text-xs uppercase tracking-widest font-semibold transition-all rounded-xs"
        >
          Explorar Colección
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
              Guardado en la Maison
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-neutral-900 font-normal">
              Prendas Favoritas ({wishlist.length})
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleMoveAllToCart}
              className="px-4 py-2.5 bg-neutral-900 hover:bg-black text-white text-xs uppercase tracking-wider font-semibold rounded-xs transition-colors flex items-center gap-2"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Añadir Todas a la Cesta</span>
            </button>
            <button
              type="button"
              onClick={clearWishlist}
              className="p-2.5 text-neutral-400 hover:text-rose-600 transition-colors"
              title="Borrar todos los favoritos"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12 pt-8">
          {wishlist.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

      </div>
    </div>
  );
}
