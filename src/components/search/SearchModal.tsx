'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, X, ArrowRight } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const { products, storeMode } = useStore();
  const [query, setQuery] = useState('');

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // toggle handled externally or can trigger
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const filteredProducts = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.gender.toLowerCase().includes(q)
    );
  }, [query, products]);

  const trendingTags =
    storeMode === 'zapatos_jeans'
      ? ['Botín Chelsea', 'Sneaker Nappa', 'Jeans Selvedge', 'Wide-Leg', 'Mocasín Loafer', 'Denim Negro']
      : ['Abrigo lana', 'Vestido seda', 'Blazer cruzado', 'Denim selvedge', 'Cachemira', 'Lino'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative min-h-screen flex items-start justify-center p-4 sm:p-6 lg:p-12">
        <div className="relative w-full max-w-3xl bg-white rounded-sm shadow-2xl overflow-hidden mt-8 sm:mt-16 border border-neutral-200">
          
          {/* Search Input Bar */}
          <div className="relative flex items-center px-6 py-5 border-b border-neutral-100">
            <Search className="w-5 h-5 text-neutral-400 mr-3 shrink-0" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar abrigos, camisas, vestidos o materiales..."
              className="w-full text-base sm:text-lg bg-transparent border-0 outline-none placeholder:text-neutral-400 text-neutral-900"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-xs uppercase tracking-wider text-neutral-400 hover:text-black mr-2 px-2 py-1"
              >
                Borrar
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-neutral-400 hover:text-black transition-colors"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 max-h-[65vh] overflow-y-auto">
            {/* When no query entered */}
            {!query.trim() && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">
                  Búsquedas sugeridas
                </p>
                <div className="flex flex-wrap gap-2 mb-8">
                  {trendingTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setQuery(tag)}
                      className="text-xs px-3.5 py-1.5 rounded-full border border-neutral-200 hover:border-black hover:bg-neutral-900 hover:text-white transition-all text-neutral-700"
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                <div className="border-t border-neutral-100 pt-6">
                  <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-4">
                    Colecciones populares
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <Link
                      href={
                        storeMode === 'zapatos_jeans'
                          ? '/shop?category=zapatos'
                          : '/shop?category=chaquetas'
                      }
                      onClick={onClose}
                      className="group p-3 border border-neutral-100 hover:border-neutral-900 transition-colors rounded-sm"
                    >
                      <span className="block text-xs uppercase tracking-wider font-medium text-neutral-900 group-hover:underline">
                        {storeMode === 'zapatos_jeans'
                          ? 'Zapatos & Calzado →'
                          : 'Abrigos & Sastrería →'}
                      </span>
                      <span className="text-[11px] text-neutral-400">
                        {storeMode === 'zapatos_jeans' ? 'Piel italiana' : 'Prendas icónicas'}
                      </span>
                    </Link>
                    <Link
                      href={
                        storeMode === 'zapatos_jeans'
                          ? '/shop?category=jeans'
                          : '/shop?category=vestidos'
                      }
                      onClick={onClose}
                      className="group p-3 border border-neutral-100 hover:border-neutral-900 transition-colors rounded-sm"
                    >
                      <span className="block text-xs uppercase tracking-wider font-medium text-neutral-900 group-hover:underline">
                        {storeMode === 'zapatos_jeans'
                          ? 'Pantalones Jean →'
                          : 'Seda & Noche →'}
                      </span>
                      <span className="text-[11px] text-neutral-400">
                        {storeMode === 'zapatos_jeans' ? 'Denim Selvedge' : 'Siluetas fluidas'}
                      </span>
                    </Link>
                    <Link
                      href="/shop?sale=true"
                      onClick={onClose}
                      className="group p-3 border border-neutral-100 hover:border-rose-600 transition-colors rounded-sm"
                    >
                      <span className="block text-xs uppercase tracking-wider font-medium text-rose-600 group-hover:underline">
                        Archivo en Oferta →
                      </span>
                      <span className="text-[11px] text-neutral-400">Hasta 30% descuento</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* When query has results */}
            {query.trim() && filteredProducts.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-widest text-neutral-500 mb-4">
                  {filteredProducts.length} resultado{filteredProducts.length > 1 ? 's' : ''} para &ldquo;{query}&rdquo;
                </p>
                <div className="divide-y divide-neutral-100">
                  {filteredProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={`/producto/${product.slug}`}
                      onClick={onClose}
                      className="flex items-center gap-4 py-3.5 px-2 hover:bg-neutral-50 transition-colors group rounded-sm"
                    >
                      <div className="relative w-16 h-20 bg-neutral-100 overflow-hidden shrink-0">
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          sizes="64px"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] uppercase tracking-widest text-neutral-400 block mb-0.5">
                          {product.category} • {product.gender}
                        </span>
                        <h4 className="text-sm font-medium text-neutral-900 truncate group-hover:text-neutral-600 transition-colors">
                          {product.name}
                        </h4>
                        <p className="text-xs text-neutral-500 truncate mt-0.5">
                          {product.subtitle}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-semibold text-neutral-900">
                          ${product.price}
                        </div>
                        {product.originalPrice && (
                          <div className="text-xs text-neutral-400 line-through">
                            ${product.originalPrice}
                          </div>
                        )}
                      </div>
                      <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-800 transition-colors ml-1" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* When query has NO results */}
            {query.trim() && filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-sm text-neutral-500 mb-2">
                  No encontramos resultados para &ldquo;{query}&rdquo;.
                </p>
                <p className="text-xs text-neutral-400 mb-4">
                  Prueba buscando por categoría general como &quot;chaqueta&quot;, &quot;vestido&quot; o &quot;camisa&quot;.
                </p>
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="text-xs uppercase tracking-wider underline text-neutral-800 hover:text-black font-medium"
                >
                  Restablecer búsqueda
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
