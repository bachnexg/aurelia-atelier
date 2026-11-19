'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  ShoppingBag,
  Heart,
  User as UserIcon,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/context/StoreContext';
import { SearchModal } from '@/components/search/SearchModal';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItemsCount, openCart } = useCart();
  const { wishlist } = useWishlist();
  const { user, isAdmin, logout } = useAuth();
  const { categories, siteSettings } = useStore();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [collectionDropdownOpen, setCollectionDropdownOpen] = useState(false);

  const getCategoryHref = (cat: { slug: string; filterType?: 'category' | 'gender' }) => {
    if (cat.filterType === 'gender' || ['mujer', 'hombre', 'unisex'].includes(cat.slug)) {
      return `/shop?gender=${cat.slug}`;
    }
    return `/shop?category=${cat.slug}`;
  };

  const navbarCategories = categories.filter((c) => c.showInNavbar !== false);
  const dropdownCategories = categories.filter(
    (c) => c.filterType !== 'gender' && !['mujer', 'hombre', 'unisex'].includes(c.slug)
  );

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <>
      {/* Top Announcement Bar */}
      {siteSettings.announcementEnabled && (
        <div className="bg-[#111111] text-[#f7f5f0] text-[11px] uppercase tracking-[0.2em] py-2 px-4 text-center font-medium flex items-center justify-center gap-3">
          <span>{siteSettings.announcementText}</span>
          {siteSettings.announcementPromo && (
            <>
              <span className="hidden md:inline text-neutral-400">|</span>
              <span className="hidden md:inline text-[#c5a880]">
                {siteSettings.announcementPromo}
              </span>
            </>
          )}
        </div>
      )}

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Mobile menu button */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 -ml-2 text-neutral-800 hover:text-black focus:outline-none"
                aria-label="Abrir menú"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-neutral-800 hover:text-black focus:outline-none ml-1"
                aria-label="Buscar productos"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-6 text-[12px] tracking-[0.15em] uppercase font-medium text-neutral-700">
              <div
                className="relative group"
                onMouseEnter={() => setCollectionDropdownOpen(true)}
                onMouseLeave={() => setCollectionDropdownOpen(false)}
              >
                <Link
                  href="/shop"
                  className="flex items-center gap-1 hover:text-black transition-colors py-2"
                >
                  <span>Colección</span>
                  <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" />
                </Link>

                {/* Dropdown Menu */}
                {collectionDropdownOpen && (
                  <div className="absolute top-full left-0 w-64 bg-white border border-neutral-100 shadow-xl py-3 px-2 rounded-sm transition-all duration-200">
                    <Link
                      href="/shop"
                      className="block px-4 py-2 text-xs uppercase tracking-wider text-neutral-800 hover:bg-neutral-50 hover:text-black font-semibold"
                    >
                      Ver Todo el Catálogo
                    </Link>
                    <Link
                      href="/shop?sort=new"
                      className="block px-4 py-2 text-xs uppercase tracking-wider text-neutral-600 hover:bg-neutral-50 hover:text-black"
                    >
                      Novedades de Temporada
                    </Link>
                    <Link
                      href="/shop?sort=bestseller"
                      className="block px-4 py-2 text-xs uppercase tracking-wider text-neutral-600 hover:bg-neutral-50 hover:text-black"
                    >
                      Más Vendidos
                    </Link>
                    <div className="h-px bg-neutral-100 my-1"></div>
                    {dropdownCategories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={getCategoryHref(cat)}
                        className="block px-4 py-2 text-xs uppercase tracking-wider text-neutral-600 hover:bg-neutral-50 hover:text-black"
                      >
                        {cat.name}
                      </Link>
                    ))}
                    <div className="h-px bg-neutral-100 my-1"></div>
                    <Link
                      href="/shop?sale=true"
                      className="block px-4 py-2 text-xs uppercase tracking-wider text-rose-700 hover:bg-rose-50 font-medium"
                    >
                      Archivo / Ofertas
                    </Link>
                  </div>
                )}
              </div>

              {navbarCategories.slice(0, 6).map((cat) => {
                const href = getCategoryHref(cat);
                return (
                  <Link
                    key={cat.id}
                    href={href}
                    className={`hover:text-black transition-colors whitespace-nowrap ${
                      pathname === href ? 'text-black font-semibold' : ''
                    }`}
                  >
                    {cat.name.split('&')[0].trim()}
                  </Link>
                );
              })}
            </nav>

            {/* Brand Logo (Center) */}
            <div className="flex-1 lg:flex-none text-center">
              <Link href="/" className="inline-flex items-center justify-center gap-2.5 group">
                <img
                  src="/images/logo-valisbe.png"
                  alt={siteSettings.brandName || 'VALISBE'}
                  className="h-12 sm:h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                />
                <div className="text-left hidden sm:block border-l border-neutral-200 pl-2.5">
                  <span className="block font-serif text-lg tracking-[0.25em] text-[#66121f] group-hover:text-black transition-colors uppercase font-semibold leading-tight">
                    {siteSettings.brandName || 'VALISBE'}
                  </span>
                  <span className="block text-[8px] tracking-[0.38em] text-neutral-500 uppercase font-sans">
                    {siteSettings.brandSubtitle || 'D E N I M  &  S H O E S'}
                  </span>
                </div>
              </Link>
            </div>

            {/* Right Icons: Search, Verified Admin Link, Wishlist, Account, Cart */}
            <div className="flex items-center space-x-3 sm:space-x-5">
              {/* Desktop Search Trigger */}
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="hidden lg:flex items-center text-neutral-700 hover:text-black transition-colors"
                title="Buscar prendas"
              >
                <Search className="w-5 h-5 stroke-[1.6]" />
              </button>

              {isAdmin && (
                <Link
                  href="/admin"
                  className="hidden sm:inline-flex items-center gap-1.5 text-[11px] tracking-widest uppercase bg-neutral-900 text-white font-semibold px-3 py-1.5 rounded-xs hover:bg-black transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#c5a880]" />
                  <span>Panel Admin</span>
                </Link>
              )}

              {/* Account / User */}
              <Link
                href={user ? (isAdmin ? '/admin' : '/perfil') : '/login'}
                className="text-neutral-700 hover:text-black transition-colors p-1 flex items-center gap-1.5"
                title={user ? `Sesión activa: ${user.name}` : 'Iniciar Sesión'}
              >
                <UserIcon className="w-5 h-5 stroke-[1.6]" />
                {user && (
                  <span className="hidden xl:inline text-[11px] uppercase tracking-wider font-medium text-neutral-800 max-w-[110px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                )}
              </Link>

              {user && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="hidden sm:inline-flex text-neutral-500 hover:text-rose-600 transition-colors p-1"
                  title="Cerrar sesión segura"
                >
                  <LogOut className="w-4 h-4 stroke-[1.6]" />
                </button>
              )}

              {/* Wishlist */}
              <Link
                href="/favoritos"
                className="relative text-neutral-700 hover:text-black transition-colors p-1"
                title="Lista de Favoritos"
              >
                <Heart className="w-5 h-5 stroke-[1.6]" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-neutral-900 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* Cart Drawer Trigger */}
              <button
                type="button"
                onClick={openCart}
                className="relative text-neutral-900 hover:text-black transition-colors p-1"
                aria-label="Abrir Carrito de compras"
              >
                <ShoppingBag className="w-5 h-5 stroke-[1.6]" />
                {totalItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 bg-neutral-900 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium shadow-sm animate-pulse">
                    {totalItemsCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-neutral-100 bg-white px-6 py-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <span className="text-xs uppercase tracking-widest text-neutral-400">Navegación</span>
              {user ? (
                <button
                  onClick={handleLogout}
                  className="text-[11px] uppercase tracking-wider text-rose-600 font-semibold"
                >
                  Cerrar Sesión
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-[11px] uppercase tracking-wider text-neutral-900 font-semibold"
                >
                  Iniciar Sesión →
                </Link>
              )}
            </div>
            <div className="flex flex-col space-y-3 text-sm tracking-[0.15em] uppercase font-medium">
              <Link
                href="/shop"
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:text-neutral-500 py-1"
              >
                Catálogo Completo
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={getCategoryHref(cat)}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="hover:text-neutral-500 py-1"
                >
                  {cat.name}
                </Link>
              ))}
              <Link
                href="/shop?sale=true"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-rose-600 font-semibold py-1"
              >
                Ofertas Especiales
              </Link>
            </div>
            {isAdmin && (
              <div className="pt-4 border-t border-neutral-100">
                <Link
                  href="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-center py-2.5 bg-neutral-900 text-white text-xs uppercase tracking-widest rounded"
                >
                  Ir al Panel de Administración
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Global Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
