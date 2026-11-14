'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  SlidersHorizontal,
  X,
  RotateCcw,
  Grid2X2,
  Grid3X3,
  LayoutGrid,
  ChevronDown,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { ProductCard } from '@/components/product/ProductCard';

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { products, categories: storeCategories, siteSettings } = useStore();

  const maxCatalogPrice = useMemo(() => {
    const highest = products.reduce((max, p) => Math.max(max, p.price), 500);
    return Math.ceil(highest / 50) * 50;
  }, [products]);

  // Read URL parameters
  const initialCategory = searchParams.get('category') || 'todos';
  const initialGender = searchParams.get('gender') || 'todos';
  const initialSort = searchParams.get('sort') || 'featured';
  const initialSale = searchParams.get('sale') === 'true';

  // State
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedGender, setSelectedGender] = useState<string>(initialGender);
  const [selectedSort, setSelectedSort] = useState<string>(initialSort);
  const [onlySale, setOnlySale] = useState<boolean>(initialSale);
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [selectedSize, setSelectedSize] = useState<string>('todos');
  const [selectedColor, setSelectedColor] = useState<string>('todos');
  const [priceRange, setPriceRange] = useState<number>(maxCatalogPrice);
  const [gridCols, setGridCols] = useState<2 | 3 | 4>(3);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Sync URL query params when navigating from Navbar/Footer links
  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || 'todos');
    setSelectedGender(searchParams.get('gender') || 'todos');
    setSelectedSort(searchParams.get('sort') || 'featured');
    setOnlySale(searchParams.get('sale') === 'true');
  }, [searchParams]);

  useEffect(() => {
    setPriceRange((prev) => (prev === 500 || prev > maxCatalogPrice ? maxCatalogPrice : prev));
  }, [maxCatalogPrice]);

  // Dynamic Categories list from StoreContext
  const categories = useMemo(() => {
    const productCats = storeCategories.filter(
      (c) => c.filterType !== 'gender' && !['mujer', 'hombre', 'unisex'].includes(c.slug)
    );
    return [
      { label: 'Todas las Prendas', value: 'todos' },
      ...productCats.map((c) => ({ label: c.name, value: c.slug })),
    ];
  }, [storeCategories]);

  const genders: { label: string; value: string }[] = [
    { label: 'Todo el Género', value: 'todos' },
    { label: 'Mujer', value: 'mujer' },
    { label: 'Hombre', value: 'hombre' },
    { label: 'Unisex', value: 'unisex' },
  ];

  const sizes = useMemo(() => {
    const uniqueSizes = Array.from(new Set(products.flatMap((p) => p.sizes)));
    return ['todos', ...uniqueSizes];
  }, [products]);

  const colors = [
    { name: 'todos', label: 'Todos' },
    { name: 'Negro', label: 'Negro', hex: '#111111' },
    { name: 'Blanco', label: 'Blanco', hex: '#ffffff' },
    { name: 'Beige', label: 'Beige / Camel', hex: '#b99b6b' },
    { name: 'Gris', label: 'Gris', hex: '#444444' },
    { name: 'Azul', label: 'Azul', hex: '#1b2a4a' },
  ];

  // Active category metadata for dynamic header
  const activeCategoryMeta = useMemo(() => {
    if (selectedCategory !== 'todos') {
      return storeCategories.find((c) => c.slug === selectedCategory);
    }
    if (selectedGender !== 'todos') {
      return storeCategories.find((c) => c.slug === selectedGender);
    }
    return undefined;
  }, [selectedCategory, selectedGender, storeCategories]);

  // Filtering Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (selectedCategory !== 'todos' && p.category !== selectedCategory) {
          return false;
        }
        if (selectedGender !== 'todos' && p.gender !== selectedGender && p.gender !== 'unisex') {
          return false;
        }
        if (onlySale && !p.isSale) {
          return false;
        }
        if (onlyInStock && p.stock <= 0) {
          return false;
        }
        if (p.price > priceRange) {
          return false;
        }
        if (selectedSize !== 'todos' && !p.sizes.includes(selectedSize)) {
          return false;
        }
        if (selectedColor !== 'todos') {
          const matchesColor = p.colors.some((c) =>
            c.name.toLowerCase().includes(selectedColor.toLowerCase())
          );
          if (!matchesColor) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (selectedSort === 'price-asc') return a.price - b.price;
        if (selectedSort === 'price-desc') return b.price - a.price;
        if (selectedSort === 'new') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
        if (selectedSort === 'bestseller') return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
        if (selectedSort === 'rating') return b.rating - a.rating;
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      });
  }, [
    products,
    selectedCategory,
    selectedGender,
    onlySale,
    onlyInStock,
    priceRange,
    selectedSize,
    selectedColor,
    selectedSort,
  ]);

  const resetFilters = () => {
    setSelectedCategory('todos');
    setSelectedGender('todos');
    setSelectedSort('featured');
    setOnlySale(false);
    setOnlyInStock(false);
    setSelectedSize('todos');
    setSelectedColor('todos');
    setPriceRange(maxCatalogPrice);
    router.push('/shop');
  };

  const hasActiveFilters =
    selectedCategory !== 'todos' ||
    selectedGender !== 'todos' ||
    onlySale ||
    onlyInStock ||
    selectedSize !== 'todos' ||
    selectedColor !== 'todos' ||
    priceRange < maxCatalogPrice;

  return (
    <div className="bg-white min-h-screen">
      {/* Page Title & Breadcrumbs Header */}
      <div className="bg-[#faf8f5] border-b border-neutral-100 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <span className="text-[11px] uppercase tracking-[0.3em] text-[#c5a880] font-semibold block">
            {siteSettings.brandName} {siteSettings.brandSubtitle} •{' '}
            {activeCategoryMeta?.badge || 'Colección Permanente'}
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-neutral-900 font-normal">
            {activeCategoryMeta ? activeCategoryMeta.name : 'Catálogo de Moda & Prendas'}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 max-w-xl mx-auto">
            {activeCategoryMeta
              ? activeCategoryMeta.description
              : 'Explora nuestra selección de sastrería pura, vestidos de seda y prendas esenciales elaboradas con los mejores tejidos del mundo.'}
          </p>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-neutral-100">
          {/* Mobile filter toggle & Count */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
              className="lg:hidden flex items-center gap-2 px-3 py-2 border border-neutral-200 rounded-xs text-xs uppercase tracking-wider font-medium text-neutral-800"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filtros {hasActiveFilters && '•'}</span>
            </button>

            <span className="text-xs uppercase tracking-widest text-neutral-500">
              {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado
              {filteredProducts.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Right Controls: Sort & Grid View Switcher */}
          <div className="flex items-center gap-4">
            {/* Sort Select */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-neutral-400 hidden sm:inline uppercase tracking-wider">
                Ordenar por:
              </span>
              <div className="relative">
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="appearance-none bg-neutral-50 border border-neutral-200 text-neutral-900 text-xs uppercase tracking-wider py-2 pl-3 pr-8 rounded-xs focus:outline-none focus:border-black cursor-pointer"
                >
                  <option value="featured">Recomendados</option>
                  <option value="new">Novedades</option>
                  <option value="bestseller">Más Vendidos</option>
                  <option value="price-asc">Precio: Menor a Mayor</option>
                  <option value="price-desc">Precio: Mayor a Menor</option>
                  <option value="rating">Mejor Valorados</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Grid Columns Switcher (Desktop) */}
            <div className="hidden md:flex items-center border border-neutral-200 rounded-xs overflow-hidden">
              <button
                type="button"
                onClick={() => setGridCols(2)}
                className={`p-1.5 transition-colors ${
                  gridCols === 2
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-500 hover:bg-neutral-100'
                }`}
                title="Vista de 2 columnas"
              >
                <Grid2X2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setGridCols(3)}
                className={`p-1.5 transition-colors ${
                  gridCols === 3
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-500 hover:bg-neutral-100'
                }`}
                title="Vista de 3 columnas"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setGridCols(4)}
                className={`p-1.5 transition-colors ${
                  gridCols === 4
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-500 hover:bg-neutral-100'
                }`}
                title="Vista de 4 columnas"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters Pill Bar */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-4 pb-2">
            <span className="text-[11px] uppercase tracking-wider text-neutral-400">
              Filtros activos:
            </span>
            {selectedCategory !== 'todos' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 text-neutral-800 text-xs rounded-full">
                <span>Cat: {selectedCategory}</span>
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCategory('todos')} />
              </span>
            )}
            {selectedGender !== 'todos' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 text-neutral-800 text-xs rounded-full">
                <span>Género: {selectedGender}</span>
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedGender('todos')} />
              </span>
            )}
            {selectedSize !== 'todos' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 text-neutral-800 text-xs rounded-full">
                <span>Talla: {selectedSize}</span>
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedSize('todos')} />
              </span>
            )}
            {selectedColor !== 'todos' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 text-neutral-800 text-xs rounded-full">
                <span>Color: {selectedColor}</span>
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedColor('todos')} />
              </span>
            )}
            {onlySale && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 text-rose-700 text-xs rounded-full">
                <span>Solo ofertas</span>
                <X className="w-3 h-3 cursor-pointer" onClick={() => setOnlySale(false)} />
              </span>
            )}
            {priceRange < maxCatalogPrice && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 text-neutral-800 text-xs rounded-full">
                <span>Hasta ${priceRange}</span>
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => setPriceRange(maxCatalogPrice)}
                />
              </span>
            )}
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs text-neutral-500 hover:text-black uppercase tracking-wider font-semibold underline ml-2 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Limpiar todo
            </button>
          </div>
        )}

        {/* Content Layout: Sidebar + Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-6">
          {/* Desktop Filters Sidebar */}
          <aside className={`lg:block ${isMobileFiltersOpen ? 'block' : 'hidden'} space-y-8 pr-4`}>
            {/* Header in mobile */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 lg:hidden">
              <span className="text-xs uppercase tracking-widest font-semibold text-neutral-900">
                Filtros de búsqueda
              </span>
              <button onClick={() => setIsMobileFiltersOpen(false)}>
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>

            {/* Filter: Categorías */}
            <div className="space-y-3">
              <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-neutral-900">
                Categoría
              </h3>
              <div className="space-y-1.5 text-xs">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`block w-full text-left py-1 transition-colors ${
                      selectedCategory === cat.value
                        ? 'font-bold text-black border-l-2 border-black pl-2'
                        : 'text-neutral-600 hover:text-black'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter: Género */}
            <div className="space-y-3 pt-4 border-t border-neutral-100">
              <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-neutral-900">
                Género
              </h3>
              <div className="flex flex-wrap gap-1.5 text-xs">
                {genders.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setSelectedGender(g.value)}
                    className={`px-3 py-1.5 rounded-sm border uppercase tracking-wider text-[11px] transition-colors ${
                      selectedGender === g.value
                        ? 'bg-neutral-900 text-white border-neutral-900 font-medium'
                        : 'border-neutral-200 text-neutral-600 hover:border-black'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter: Precio Máximo */}
            <div className="space-y-3 pt-4 border-t border-neutral-100">
              <div className="flex justify-between items-center text-xs">
                <h3 className="uppercase tracking-[0.2em] font-semibold text-neutral-900">
                  Precio Máximo
                </h3>
                <span className="font-semibold text-neutral-900">${priceRange}</span>
              </div>
              <input
                type="range"
                min="50"
                max={maxCatalogPrice}
                step="10"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-neutral-900 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-400">
                <span>$50</span>
                <span>${maxCatalogPrice}</span>
              </div>
            </div>

            {/* Filter: Tallas */}
            <div className="space-y-3 pt-4 border-t border-neutral-100">
              <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-neutral-900">
                Talla
              </h3>
              <div className="grid grid-cols-4 gap-1.5 text-xs text-center">
                {sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={`py-1.5 border rounded-xs uppercase tracking-wider text-[11px] font-medium transition-colors ${
                      selectedSize === s
                        ? 'bg-neutral-900 text-white border-neutral-900'
                        : 'border-neutral-200 text-neutral-600 hover:border-black'
                    }`}
                  >
                    {s === 'todos' ? 'Todas' : s}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter: Colores */}
            <div className="space-y-3 pt-4 border-t border-neutral-100">
              <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-neutral-900">
                Gama de Color
              </h3>
              <div className="flex flex-wrap gap-2">
                {colors.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setSelectedColor(c.name)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 border rounded-sm text-[11px] transition-all ${
                      selectedColor === c.name
                        ? 'border-black bg-neutral-900 text-white font-medium'
                        : 'border-neutral-200 text-neutral-700 hover:border-black'
                    }`}
                  >
                    {c.hex && (
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-neutral-400 inline-block"
                        style={{ backgroundColor: c.hex }}
                      />
                    )}
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Filter: Solo Ofertas / En Stock */}
            <div className="space-y-2.5 pt-4 border-t border-neutral-100 text-xs">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlySale}
                  onChange={(e) => setOnlySale(e.target.checked)}
                  className="w-4 h-4 accent-neutral-900 rounded"
                />
                <span className="text-neutral-800">Solo prendas en oferta</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                  className="w-4 h-4 accent-neutral-900 rounded"
                />
                <span className="text-neutral-800">Solo piezas en stock</span>
              </label>
            </div>

            {/* Reset Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="w-full py-2.5 text-xs uppercase tracking-widest text-neutral-700 hover:text-black border border-neutral-300 hover:border-black rounded-xs transition-colors font-medium"
              >
                Restablecer Filtros
              </button>
            )}
          </aside>

          {/* Products Grid Area */}
          <div className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-24 bg-neutral-50 rounded-sm border border-neutral-100 p-8 space-y-4">
                <p className="font-serif text-xl text-neutral-800">
                  No se encontraron prendas con los filtros seleccionados
                </p>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  Prueba modificando el rango de precio, cambiando la categoría o restableciendo todos los filtros.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-6 py-3 bg-neutral-900 text-white text-xs uppercase tracking-widest font-semibold hover:bg-black transition-all rounded-xs"
                >
                  Restablecer Filtros
                </button>
              </div>
            ) : (
              <div
                className={`grid gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12 ${
                  gridCols === 2
                    ? 'grid-cols-1 sm:grid-cols-2'
                    : gridCols === 4
                    ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
                    : 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3'
                }`}
              >
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen py-24 text-center text-xs uppercase tracking-widest text-neutral-400">
          Cargando colección...
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
