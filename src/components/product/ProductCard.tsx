'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Star } from 'lucide-react';
import { Product } from '@/types';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [isHovered, setIsHovered] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isFavorite = isInWishlist(product.id);
  const hasMultipleImages = product.images.length > 1;

  const handleQuickAdd = (size: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, size, selectedColor, 1);
    setToastMessage(`Añadido: Talla ${size}`);
    setTimeout(() => setToastMessage(null), 2000);
  };

  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div 
      className="group relative flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Frame */}
      <div className="relative aspect-[3/4] w-full bg-[#f4f2ee] overflow-hidden rounded-xs">
        <Link href={`/producto/${product.slug}`} className="block w-full h-full">
          {/* Primary image */}
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className={`object-cover object-center transition-all duration-700 ease-out ${
              hasMultipleImages && isHovered ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
            }`}
          />
          {/* Secondary Lookbook image on hover */}
          {hasMultipleImages && (
            <Image
              src={product.images[1]}
              alt={`${product.name} lookbook`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className={`object-cover object-center transition-all duration-700 ease-out absolute inset-0 ${
                isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              }`}
            />
          )}
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {product.isNew && (
            <span className="bg-neutral-900 text-white text-[10px] uppercase tracking-[0.2em] px-2.5 py-1 font-semibold">
              Nuevo
            </span>
          )}
          {product.isSale && discountPercentage > 0 && (
            <span className="bg-rose-700 text-white text-[10px] uppercase tracking-[0.2em] px-2.5 py-1 font-semibold">
              -{discountPercentage}%
            </span>
          )}
          {product.stock <= 3 && product.stock > 0 && (
            <span className="bg-[#c5a880] text-black text-[10px] uppercase tracking-[0.2em] px-2 py-0.5 font-semibold">
              Últimas {product.stock}
            </span>
          )}
          {product.stock === 0 && (
            <span className="bg-neutral-500 text-white text-[10px] uppercase tracking-[0.2em] px-2 py-0.5 font-semibold">
              Agotado
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
            isFavorite 
              ? 'bg-rose-50 text-rose-600 shadow-md' 
              : 'bg-white/80 backdrop-blur-xs text-neutral-700 hover:bg-white hover:text-black shadow-xs'
          }`}
          aria-label={isFavorite ? 'Eliminar de favoritos' : 'Añadir a favoritos'}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-600 stroke-rose-600' : 'stroke-[1.6]'}`} />
        </button>

        {/* Quick Size Selector Bar (Appears on Hover) */}
        {product.stock > 0 && (
          <div className="absolute inset-x-0 bottom-0 z-10 p-3 bg-white/95 backdrop-blur-md translate-y-full group-hover:translate-y-0 transition-transform duration-300 border-t border-neutral-100 flex flex-col gap-1.5">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold text-center">
              Seleccionar talla para añadir
            </span>
            <div className="flex items-center justify-center gap-1.5">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={(e) => handleQuickAdd(size, e)}
                  className="px-2.5 py-1 text-xs uppercase tracking-wider border border-neutral-200 hover:border-black hover:bg-black hover:text-white transition-all rounded-xs font-medium"
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Toast confirmation overlay */}
        {toastMessage && (
          <div className="absolute inset-x-3 bottom-3 z-20 bg-neutral-900 text-white text-xs py-2 px-3 text-center rounded shadow-lg animate-fade-in font-medium">
            {toastMessage}
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="pt-3 pb-1 flex flex-col gap-1">
        {/* Color swatches */}
        {product.colors.length > 1 && (
          <div className="flex items-center gap-1.5 mb-0.5">
            {product.colors.map((color) => (
              <button
                key={color.name}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`w-3 h-3 rounded-full border transition-all ${
                  selectedColor.name === color.name
                    ? 'ring-1 ring-offset-1 ring-black scale-110'
                    : 'border-neutral-300 opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
            <span className="text-[11px] text-neutral-400 ml-1">
              {product.colors.length} colores
            </span>
          </div>
        )}

        {/* Category & Rating */}
        <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-neutral-400">
          <span>{product.category}</span>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="font-medium text-neutral-700">{product.rating}</span>
          </div>
        </div>

        {/* Name */}
        <Link 
          href={`/producto/${product.slug}`}
          className="text-sm font-medium text-neutral-900 group-hover:text-neutral-600 transition-colors line-clamp-1"
        >
          {product.name}
        </Link>

        {/* Subtitle / Fabric */}
        <p className="text-xs text-neutral-500 line-clamp-1">
          {product.subtitle}
        </p>

        {/* Price Row */}
        <div className="flex items-center gap-2 pt-0.5">
          <span className="text-sm font-semibold text-neutral-900">
            ${product.price}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-neutral-400 line-through">
              ${product.originalPrice}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
