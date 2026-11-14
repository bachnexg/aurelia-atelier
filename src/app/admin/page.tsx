'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  BarChart3,
  Package,
  ShoppingBag,
  Users,
  Plus,
  Edit3,
  Trash2,
  TrendingUp,
  DollarSign,
  X,
  Search,
  AlertTriangle,
  ArrowUpRight,
  Layers,
  Tag,
  Globe,
  Copy,
  Check,
  Eye,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Star,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/context/AuthContext';
import {
  Product,
  OrderStatus,
  CategorySlug,
  Gender,
  CategoryItem,
  ProductColor,
  Testimonial,
} from '@/types';

type AdminTab =
  | 'kpis'
  | 'categorias'
  | 'productos'
  | 'cupones'
  | 'cms'
  | 'pedidos'
  | 'inventario'
  | 'clientes';

export default function AdminPage() {
  const {
    products,
    categories,
    coupons,
    orders,
    siteSettings,
    addProduct,
    updateProduct,
    deleteProduct,
    duplicateProduct,
    addCategory,
    updateCategory,
    deleteCategory,
    addCoupon,
    updateCoupon,
    deleteCoupon,
    updateSiteSettings,
    resetStoreToDefaults,
    updateOrderStatus,
  } = useStore();
  const { isAdmin, isLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<AdminTab>('kpis');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Search & Filters in admin
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('todas');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('todos');

  // ==========================================
  // 1. PRODUCT MODAL STATE (Full CRUD)
  // ==========================================
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState<number>(180);
  const [formOriginalPrice, setFormOriginalPrice] = useState<number | undefined>(undefined);
  const [formCategory, setFormCategory] = useState<CategorySlug>('chaquetas');
  const [formGender, setFormGender] = useState<Gender>('unisex');
  const [formStock, setFormStock] = useState<number>(15);
  const [formImages, setFormImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=1000&auto=format&fit=crop',
  ]);
  const [formSizes, setFormSizes] = useState<string>('XS, S, M, L, XL');
  const [formColors, setFormColors] = useState<ProductColor[]>([
    { name: 'Negro Azabache', hex: '#111111' },
  ]);
  const [formComposition, setFormComposition] = useState('100% Fibras Naturales Certificadas');
  const [formDetailsText, setFormDetailsText] = useState(
    'Confección artesanal en taller\nTejido noble de alta densidad\nAcabados sartoriales a mano'
  );
  const [formCareText, setFormCareText] = useState(
    'Limpieza en seco profesional\nNo usar secadora\nPlanchar a baja temperatura'
  );
  const [formIsNew, setFormIsNew] = useState(true);
  const [formIsSale, setFormIsSale] = useState(false);
  const [formIsFeatured, setFormIsFeatured] = useState(true);
  const [formIsBestSeller, setFormIsBestSeller] = useState(false);

  // ==========================================
  // 2. CATEGORY MODAL STATE (Full CRUD)
  // ==========================================
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catDescription, setCatDescription] = useState('');
  const [catImage, setCatImage] = useState('');
  const [catBadge, setCatBadge] = useState('Colección');
  const [catFilterType, setCatFilterType] = useState<'category' | 'gender'>('category');
  const [catShowInNavbar, setCatShowInNavbar] = useState(true);
  const [catShowInHome, setCatShowInHome] = useState(false);

  // ==========================================
  // 3. COUPON FORM STATE
  // ==========================================
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState<number>(15);
  const [newCouponMinOrder, setNewCouponMinOrder] = useState<number>(0);
  const [newCouponDesc, setNewCouponDesc] = useState('');

  // ==========================================
  // 4. NEW TESTIMONIAL STATE (in CMS tab)
  // ==========================================
  const [newTestName, setNewTestName] = useState('');
  const [newTestRole, setNewTestRole] = useState('');
  const [newTestProduct, setNewTestProduct] = useState('');
  const [newTestComment, setNewTestComment] = useState('');

  // Analytics Calculations
  const activeOrders = orders.filter((o) => o.status !== 'Cancelado');
  const totalRevenue = activeOrders.reduce((acc, o) => acc + o.total, 0);
  const totalOrdersCount = orders.length;
  const avgOrderValue =
    activeOrders.length > 0 ? Math.round(totalRevenue / activeOrders.length) : 0;
  const lowStockItems = products.filter((p) => p.stock <= 10);

  // Dynamic Clients Directory aggregated from Orders + Demo VIPs
  const clientsList = useMemo(() => {
    const map = new Map<
      string,
      { name: string; email: string; city: string; ordersCount: number; totalSpent: number }
    >();
    orders.forEach((o) => {
      const key = o.customer.email.toLowerCase();
      const existing = map.get(key);
      if (existing) {
        existing.ordersCount += 1;
        if (o.status !== 'Cancelado') existing.totalSpent += o.total;
      } else {
        map.set(key, {
          name: `${o.customer.firstName} ${o.customer.lastName}`.trim(),
          email: o.customer.email,
          city: `${o.customer.city}, ${o.customer.country}`,
          ordersCount: 1,
          totalSpent: o.status !== 'Cancelado' ? o.total : 0,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesQuery =
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCat =
      productCategoryFilter === 'todas' ||
      p.category === productCategoryFilter ||
      p.gender === productCategoryFilter;
    return matchesQuery && matchesCat;
  });

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer.firstName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer.lastName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer.email.toLowerCase().includes(orderSearch.toLowerCase());

    const matchesStatus = orderStatusFilter === 'todos' || o.status === orderStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

  // --- Product Modal Handlers ---
  const openCreateProductModal = () => {
    setEditingProductId(null);
    setFormName('');
    setFormSlug('');
    setFormSku(`AUR-${Math.floor(100 + Math.random() * 900)}`);
    setFormSubtitle('');
    setFormDescription('');
    setFormPrice(220);
    setFormOriginalPrice(undefined);
    const defaultCat =
      categories.find((c) => c.filterType !== 'gender')?.slug || 'chaquetas';
    setFormCategory(defaultCat);
    setFormGender('unisex');
    setFormStock(15);
    setFormImages([
      'https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=1000&auto=format&fit=crop',
    ]);
    setFormSizes('XS, S, M, L, XL');
    setFormColors([{ name: 'Negro Azabache', hex: '#111111' }]);
    setFormComposition('100% Lana Virgen Italiana Certificada.');
    setFormDetailsText(
      'Confección artesanal en taller\nAcabados sartoriales a mano\nForro interior transpirable'
    );
    setFormCareText('Limpieza en seco profesional\nPlanchar a baja temperatura');
    setFormIsNew(true);
    setFormIsSale(false);
    setFormIsFeatured(true);
    setFormIsBestSeller(false);
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (p: Product) => {
    setEditingProductId(p.id);
    setFormName(p.name);
    setFormSlug(p.slug);
    setFormSku(p.sku);
    setFormSubtitle(p.subtitle);
    setFormDescription(p.description);
    setFormPrice(p.price);
    setFormOriginalPrice(p.originalPrice);
    setFormCategory(p.category);
    setFormGender(p.gender);
    setFormStock(p.stock);
    setFormImages(p.images.length > 0 ? p.images : ['']);
    setFormSizes(p.sizes.join(', '));
    setFormColors(
      p.colors.length > 0 ? p.colors : [{ name: 'Negro Azabache', hex: '#111111' }]
    );
    setFormComposition(p.composition || '');
    setFormDetailsText((p.details || []).join('\n'));
    setFormCareText((p.care || []).join('\n'));
    setFormIsNew(Boolean(p.isNew));
    setFormIsSale(Boolean(p.isSale));
    setFormIsFeatured(Boolean(p.isFeatured));
    setFormIsBestSeller(Boolean(p.isBestSeller));
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const sizesArray = formSizes
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const cleanImages = formImages.map((img) => img.trim()).filter(Boolean);
    const finalImages =
      cleanImages.length > 0
        ? cleanImages
        : [
            'https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=1000&auto=format&fit=crop',
          ];
    const cleanColors = formColors.filter((c) => c.name.trim() !== '');
    const finalColors =
      cleanColors.length > 0 ? cleanColors : [{ name: 'Negro', hex: '#111111' }];
    const detailsArray = formDetailsText
      .split('\n')
      .map((d) => d.trim())
      .filter(Boolean);
    const careArray = formCareText
      .split('\n')
      .map((c) => c.trim())
      .filter(Boolean);
    const computedSlug = formSlug.trim() ? slugify(formSlug) : slugify(formName);

    if (editingProductId) {
      updateProduct(editingProductId, {
        name: formName,
        slug: computedSlug,
        sku: formSku || `AUR-${Math.floor(100 + Math.random() * 900)}`,
        subtitle: formSubtitle,
        description: formDescription,
        price: formPrice,
        originalPrice: formOriginalPrice || undefined,
        category: formCategory,
        gender: formGender,
        stock: formStock,
        images: finalImages,
        sizes: sizesArray.length > 0 ? sizesArray : ['Única'],
        colors: finalColors,
        composition: formComposition,
        details: detailsArray,
        care: careArray,
        isNew: formIsNew,
        isSale: formIsSale,
        isFeatured: formIsFeatured,
        isBestSeller: formIsBestSeller,
      });
      showToast(`Prenda "${formName}" actualizada correctamente.`);
    } else {
      addProduct({
        name: formName,
        slug: `${computedSlug}-${Date.now().toString().slice(-4)}`,
        sku: formSku || `AUR-${Math.floor(100 + Math.random() * 900)}`,
        subtitle: formSubtitle,
        description: formDescription,
        price: formPrice,
        originalPrice: formOriginalPrice || undefined,
        category: formCategory,
        gender: formGender,
        stock: formStock,
        images: finalImages,
        sizes: sizesArray.length > 0 ? sizesArray : ['Única'],
        colors: finalColors,
        composition: formComposition,
        details: detailsArray,
        care: careArray,
        isNew: formIsNew,
        isSale: formIsSale,
        isFeatured: formIsFeatured,
        isBestSeller: formIsBestSeller,
        rating: 5.0,
        reviewsCount: 1,
      });
      showToast(`Nueva prenda "${formName}" publicada en el catálogo.`);
    }

    setIsProductModalOpen(false);
  };

  // --- Category Modal Handlers ---
  const openCreateCategoryModal = () => {
    setEditingCategoryId(null);
    setCatName('');
    setCatSlug('');
    setCatDescription('');
    setCatBadge('Colección');
    setCatFilterType('category');
    setCatImage(
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop'
    );
    setCatShowInNavbar(true);
    setCatShowInHome(false);
    setIsCategoryModalOpen(true);
  };

  const openEditCategoryModal = (cat: CategoryItem) => {
    setEditingCategoryId(cat.id);
    setCatName(cat.name);
    setCatSlug(cat.slug);
    setCatDescription(cat.description);
    setCatBadge(cat.badge || 'Colección');
    setCatFilterType(
      cat.filterType ||
        (['mujer', 'hombre', 'unisex'].includes(cat.slug) ? 'gender' : 'category')
    );
    setCatImage(cat.image);
    setCatShowInNavbar(cat.showInNavbar !== false);
    setCatShowInHome(Boolean(cat.showInHome));
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const finalSlug = catSlug.trim() ? slugify(catSlug) : slugify(catName);
    if (!finalSlug) return;

    if (editingCategoryId) {
      updateCategory(editingCategoryId, {
        name: catName,
        slug: finalSlug,
        description: catDescription,
        image: catImage,
        badge: catBadge,
        filterType: catFilterType,
        showInNavbar: catShowInNavbar,
        showInHome: catShowInHome,
      });
      showToast(`Categoría "${catName}" actualizada.`);
    } else {
      addCategory({
        name: catName,
        slug: finalSlug,
        description: catDescription,
        image: catImage,
        badge: catBadge,
        filterType: catFilterType,
        showInNavbar: catShowInNavbar,
        showInHome: catShowInHome,
      });
      showToast(`Categoría "${catName}" creada y añadida a la tienda.`);
    }
    setIsCategoryModalOpen(false);
  };

  // --- Coupon Handlers ---
  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;
    addCoupon({
      code: newCouponCode.trim().toUpperCase(),
      discountPercent: Math.min(95, Math.max(1, Number(newCouponDiscount) || 10)),
      minOrder: Math.max(0, Number(newCouponMinOrder) || 0),
      description:
        newCouponDesc.trim() || `${newCouponDiscount}% de descuento en la colección`,
      isActive: true,
    });
    showToast(`Cupón ${newCouponCode.toUpperCase()} guardado.`);
    setNewCouponCode('');
    setNewCouponDesc('');
    setNewCouponMinOrder(0);
  };

  // --- Testimonial Handlers ---
  const handleAddTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestName.trim() || !newTestComment.trim()) return;
    const item: Testimonial = {
      id: `test-${Date.now()}`,
      name: newTestName.trim(),
      role: newTestRole.trim() || 'Cliente Verificado',
      product: newTestProduct.trim() || 'Colección Aurelia',
      comment: newTestComment.trim(),
      rating: 5,
    };
    updateSiteSettings({
      testimonials: [item, ...(siteSettings.testimonials || [])],
    });
    setNewTestName('');
    setNewTestRole('');
    setNewTestProduct('');
    setNewTestComment('');
    showToast('Testimonio añadido a la portada.');
  };

  const handleDeleteTestimonial = (id: string) => {
    updateSiteSettings({
      testimonials: (siteSettings.testimonials || []).filter((t) => t.id !== id),
    });
    showToast('Testimonio eliminado.');
  };

  // Guard if user is not authenticated as admin
  if (isLoading) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center bg-[#f7f5f0] px-4">
        <span className="text-xs uppercase tracking-widest text-neutral-500">
          Verificando sesión criptográfica de administrador...
        </span>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center bg-[#f7f5f0] px-4">
        <div className="max-w-md w-full bg-white p-8 border border-neutral-200 rounded-sm shadow-sm text-center space-y-5">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-2xl text-neutral-900">
            Autenticación de Administrador Requerida
          </h1>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Por protocolo de seguridad en producción, el acceso a la consola requiere iniciar sesión con las credenciales maestras de <strong>Administrador</strong>.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/login?redirect=/admin&reason=admin_required"
              className="px-6 py-3 bg-neutral-900 hover:bg-black text-white text-xs uppercase tracking-widest font-semibold rounded-xs transition-colors"
            >
              Iniciar Sesión como Admin
            </Link>
            <Link
              href="/"
              className="px-6 py-3 border border-neutral-300 text-neutral-700 hover:border-black text-xs uppercase tracking-widest font-semibold rounded-xs transition-colors"
            >
              Volver a la Tienda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f7f5f0] min-h-screen py-8 sm:py-12">
      {/* Floating notification toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white px-5 py-3.5 rounded-xs shadow-2xl border border-neutral-700 flex items-center gap-2.5 text-xs animate-fade-in">
          <Check className="w-4 h-4 text-[#c5a880]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Admin Header */}
        <div className="bg-white p-6 sm:p-8 rounded-sm border border-neutral-200 shadow-xs mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] uppercase tracking-[0.25em] text-[#c5a880] font-semibold">
                CMS & Consola Administrativa Total
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl text-neutral-900 font-normal mt-1">
              {siteSettings.brandName} {siteSettings.brandSubtitle} • Centro de Control
            </h1>
            <p className="text-xs text-neutral-500">
              Administra categorías, productos, tallas, colores, cupones, portada, textos de la web, stock y pedidos en tiempo real.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={openCreateCategoryModal}
              className="px-3.5 py-2.5 bg-[#faf8f5] hover:bg-neutral-100 text-neutral-900 border border-neutral-300 text-xs uppercase tracking-wider font-semibold rounded-xs transition-colors flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-[#c5a880]" />
              <span>+ Categoría</span>
            </button>
            <button
              type="button"
              onClick={openCreateProductModal}
              className="px-4 py-2.5 bg-neutral-900 hover:bg-black text-white text-xs uppercase tracking-wider font-semibold rounded-xs transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nuevo Producto</span>
            </button>
            <Link
              href="/"
              className="px-3.5 py-2.5 border border-neutral-300 hover:border-black text-neutral-800 text-xs uppercase tracking-wider font-semibold rounded-xs transition-colors flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Ver Tienda</span>
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-200 mb-8 overflow-x-auto text-xs uppercase tracking-wider font-semibold bg-white px-4 pt-3 rounded-t-sm border-x border-t">
          <button
            type="button"
            onClick={() => setActiveTab('kpis')}
            className={`pb-3 mr-6 flex items-center gap-2 transition-colors shrink-0 ${
              activeTab === 'kpis'
                ? 'border-b-2 border-black text-black'
                : 'text-neutral-400 hover:text-black'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Resumen</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('categorias')}
            className={`pb-3 mr-6 flex items-center gap-2 transition-colors shrink-0 ${
              activeTab === 'categorias'
                ? 'border-b-2 border-black text-black'
                : 'text-neutral-400 hover:text-black'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Categorías ({categories.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('productos')}
            className={`pb-3 mr-6 flex items-center gap-2 transition-colors shrink-0 ${
              activeTab === 'productos'
                ? 'border-b-2 border-black text-black'
                : 'text-neutral-400 hover:text-black'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Productos ({products.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cupones')}
            className={`pb-3 mr-6 flex items-center gap-2 transition-colors shrink-0 ${
              activeTab === 'cupones'
                ? 'border-b-2 border-black text-black'
                : 'text-neutral-400 hover:text-black'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Cupones ({coupons.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cms')}
            className={`pb-3 mr-6 flex items-center gap-2 transition-colors shrink-0 ${
              activeTab === 'cms'
                ? 'border-b-2 border-black text-black'
                : 'text-neutral-400 hover:text-black'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Diseño & Contenido Web</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pedidos')}
            className={`pb-3 mr-6 flex items-center gap-2 transition-colors shrink-0 ${
              activeTab === 'pedidos'
                ? 'border-b-2 border-black text-black'
                : 'text-neutral-400 hover:text-black'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Pedidos ({orders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inventario')}
            className={`pb-3 mr-6 flex items-center gap-2 transition-colors shrink-0 ${
              activeTab === 'inventario'
                ? 'border-b-2 border-black text-black'
                : 'text-neutral-400 hover:text-black'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Stock</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('clientes')}
            className={`pb-3 flex items-center gap-2 transition-colors shrink-0 ${
              activeTab === 'clientes'
                ? 'border-b-2 border-black text-black'
                : 'text-neutral-400 hover:text-black'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Clientes ({clientsList.length})</span>
          </button>
        </div>

        {/* =========================================================
            1. TAB: KPIs & ANALYTICS
           ========================================================= */}
        {activeTab === 'kpis' && (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-sm border border-neutral-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-neutral-500 text-xs">
                  <span className="uppercase tracking-wider font-semibold">Ventas Netas</span>
                  <DollarSign className="w-4 h-4 text-[#c5a880]" />
                </div>
                <div className="text-3xl font-serif text-neutral-900 font-semibold">
                  ${totalRevenue}
                </div>
                <div className="text-[11px] text-emerald-600 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{activeOrders.length} pedidos activos</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-sm border border-neutral-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-neutral-500 text-xs">
                  <span className="uppercase tracking-wider font-semibold">Ticket Promedio</span>
                  <ArrowUpRight className="w-4 h-4 text-[#c5a880]" />
                </div>
                <div className="text-3xl font-serif text-neutral-900 font-semibold">
                  ${avgOrderValue}
                </div>
                <div className="text-[11px] text-neutral-400">
                  Envío gratis desde ${siteSettings.freeShippingThreshold}
                </div>
              </div>

              <div
                onClick={() => setActiveTab('categorias')}
                className="bg-white p-6 rounded-sm border border-neutral-200 shadow-xs space-y-2 cursor-pointer hover:border-black transition-colors"
              >
                <div className="flex items-center justify-between text-neutral-500 text-xs">
                  <span className="uppercase tracking-wider font-semibold">
                    Categorías Activas
                  </span>
                  <Layers className="w-4 h-4 text-[#c5a880]" />
                </div>
                <div className="text-3xl font-serif text-neutral-900 font-semibold">
                  {categories.length}
                </div>
                <div className="text-[11px] text-[#c5a880] font-medium">
                  Haz clic para administrar categorías →
                </div>
              </div>

              <div
                onClick={() => setActiveTab('productos')}
                className="bg-white p-6 rounded-sm border border-neutral-200 shadow-xs space-y-2 cursor-pointer hover:border-black transition-colors"
              >
                <div className="flex items-center justify-between text-neutral-500 text-xs">
                  <span className="uppercase tracking-wider font-semibold">
                    Prendas en Catálogo
                  </span>
                  <Package className="w-4 h-4 text-[#c5a880]" />
                </div>
                <div className="text-3xl font-serif text-neutral-900 font-semibold">
                  {products.length}
                </div>
                <div className="text-[11px] text-amber-600">
                  {lowStockItems.length} prendas con stock ≤ 10 uds
                </div>
              </div>
            </div>

            {/* Quick Management Shortcuts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-sm border border-neutral-200 space-y-3">
                <h3 className="font-serif text-base text-neutral-900 font-semibold flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#c5a880]" />
                  <span>Gestión de Categorías</span>
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Crea nuevas colecciones, cambia las fotos de portada de Mujer, Hombre o Chaquetas y decide cuáles aparecen en el menú superior.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('categorias')}
                  className="text-xs uppercase tracking-wider font-semibold text-neutral-900 underline hover:text-[#c5a880]"
                >
                  Ir a Categorías →
                </button>
              </div>

              <div className="bg-white p-6 rounded-sm border border-neutral-200 space-y-3">
                <h3 className="font-serif text-base text-neutral-900 font-semibold flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#c5a880]" />
                  <span>Personalizar Portada & Textos</span>
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Edita el Hero banner, la barra de anuncio superior, el umbral de envío gratis, los showrooms y los testimonios de clientes.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('cms')}
                  className="text-xs uppercase tracking-wider font-semibold text-neutral-900 underline hover:text-[#c5a880]"
                >
                  Abrir Editor Web (CMS) →
                </button>
              </div>

              <div className="bg-white p-6 rounded-sm border border-neutral-200 space-y-3">
                <h3 className="font-serif text-base text-neutral-900 font-semibold flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-neutral-500" />
                  <span>Restauración del Sistema</span>
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  ¿Quieres volver al catálogo, categorías y diseño original de fábrica tras realizar pruebas?
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (
                      confirm(
                        '¿Restaurar todos los productos, categorías, cupones y textos a sus valores originales?'
                      )
                    ) {
                      resetStoreToDefaults();
                      showToast('Tienda restaurada a los valores originales de fábrica.');
                    }
                  }}
                  className="text-xs uppercase tracking-wider font-semibold text-rose-700 underline hover:text-rose-900"
                >
                  Restaurar datos de fábrica
                </button>
              </div>
            </div>

            {/* Quick Recent Orders */}
            <div className="bg-white p-6 sm:p-8 rounded-sm border border-neutral-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <h3 className="font-serif text-lg text-neutral-900 uppercase tracking-wider font-semibold">
                  Últimos Pedidos ({totalOrdersCount})
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('pedidos')}
                  className="text-xs uppercase tracking-wider text-neutral-600 hover:text-black underline"
                >
                  Ver todos
                </button>
              </div>
              <div className="divide-y divide-neutral-100">
                {orders.slice(0, 5).map((o) => (
                  <div
                    key={o.id}
                    className="py-3.5 flex flex-wrap items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <span className="font-mono font-semibold text-neutral-900 mr-2">
                        {o.orderNumber}
                      </span>
                      <span className="text-neutral-600">
                        {o.customer.firstName} {o.customer.lastName}
                      </span>
                      <span className="text-neutral-400 ml-2">
                        ({o.items.reduce((s, i) => s + i.quantity, 0)} uds)
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-neutral-900">${o.total}</span>
                      <span className="text-[10px] uppercase tracking-wider bg-neutral-100 px-2.5 py-1 rounded font-semibold text-neutral-700">
                        {o.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            2. TAB: CATEGORIES MANAGEMENT (Full CRUD)
           ========================================================= */}
        {activeTab === 'categorias' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-sm border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl text-neutral-900">
                  Administración de Categorías y Colecciones
                </h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Las categorías que crees o edites aquí actualizan automáticamente el menú de navegación superior, los filtros de la tienda, el pie de página y las tarjetas destacadas de la portada.
                </p>
              </div>
              <button
                type="button"
                onClick={openCreateCategoryModal}
                className="px-4 py-2.5 bg-neutral-900 hover:bg-black text-white text-xs uppercase tracking-wider font-semibold rounded-xs transition-colors flex items-center gap-2 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Nueva Categoría</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => {
                const count =
                  cat.filterType === 'gender' ||
                  ['mujer', 'hombre', 'unisex'].includes(cat.slug)
                    ? products.filter(
                        (p) => p.gender === cat.slug || p.gender === 'unisex'
                      ).length
                    : products.filter((p) => p.category === cat.slug).length;

                return (
                  <div
                    key={cat.id}
                    className="bg-white rounded-sm border border-neutral-200 overflow-hidden shadow-xs flex flex-col justify-between group"
                  >
                    <div>
                      <div className="relative h-48 bg-neutral-100 overflow-hidden">
                        <Image
                          src={
                            cat.image ||
                            'https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=800&auto=format&fit=crop'
                          }
                          alt={cat.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute top-3 left-3 flex gap-1.5">
                          <span className="px-2 py-0.5 bg-black/70 backdrop-blur-xs text-[#c5a880] text-[10px] uppercase tracking-widest font-semibold rounded">
                            {cat.badge || 'Colección'}
                          </span>
                          <span className="px-2 py-0.5 bg-white/90 text-neutral-900 text-[10px] font-mono rounded">
                            /{cat.slug}
                          </span>
                        </div>
                        <div className="absolute bottom-3 left-3 right-3 text-white flex items-end justify-between">
                          <div>
                            <h3 className="font-serif text-xl">{cat.name}</h3>
                            <span className="text-[11px] text-neutral-300">
                              {count} {count === 1 ? 'prenda asociada' : 'prendas asociadas'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 space-y-3">
                        <p className="text-xs text-neutral-600 line-clamp-2 min-h-[32px]">
                          {cat.description}
                        </p>

                        {/* Quick visibility toggles */}
                        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-neutral-100 text-[11px]">
                          <label className="flex items-center gap-1.5 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={cat.showInNavbar !== false}
                              onChange={(e) => {
                                updateCategory(cat.id, { showInNavbar: e.target.checked });
                                showToast(
                                  `Categoría "${cat.name}" ${
                                    e.target.checked ? 'visible' : 'oculta'
                                  } en Navbar.`
                                );
                              }}
                              className="w-3.5 h-3.5 accent-neutral-900 rounded"
                            />
                            <span className="text-neutral-700 font-medium">En Menú Navbar</span>
                          </label>

                          <label className="flex items-center gap-1.5 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={Boolean(cat.showInHome)}
                              onChange={(e) => {
                                updateCategory(cat.id, { showInHome: e.target.checked });
                                showToast(
                                  `Categoría "${cat.name}" ${
                                    e.target.checked ? 'destacada en' : 'quitada de'
                                  } la Portada.`
                                );
                              }}
                              className="w-3.5 h-3.5 accent-neutral-900 rounded"
                            />
                            <span className="text-neutral-700 font-medium">Destacar en Home</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="px-4 py-3 bg-[#faf8f5] border-t border-neutral-100 flex items-center justify-between text-xs">
                      <Link
                        href={
                          cat.filterType === 'gender' ||
                          ['mujer', 'hombre', 'unisex'].includes(cat.slug)
                            ? `/shop?gender=${cat.slug}`
                            : `/shop?category=${cat.slug}`
                        }
                        className="text-neutral-600 hover:text-black uppercase tracking-wider text-[11px] font-semibold"
                      >
                        Ver en Tienda →
                      </Link>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditCategoryModal(cat)}
                          className="px-2.5 py-1 bg-white border border-neutral-200 hover:border-black rounded text-neutral-800 flex items-center gap-1 font-medium"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Editar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              confirm(
                                `¿Eliminar la categoría "${cat.name}"? Los productos conservarán su estado pero la categoría desaparecerá del menú.`
                              )
                            ) {
                              deleteCategory(cat.id);
                              showToast(`Categoría "${cat.name}" eliminada.`);
                            }
                          }}
                          className="p-1 text-neutral-400 hover:text-rose-600 rounded"
                          title="Eliminar categoría"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================
            3. TAB: PRODUCT MANAGEMENT (Full CRUD & Quick Toggles)
           ========================================================= */}
        {activeTab === 'productos' && (
          <div className="bg-white rounded-sm border border-neutral-200 shadow-xs overflow-hidden">
            {/* Search, Category Filter & Actions Bar */}
            <div className="p-4 sm:p-6 border-b border-neutral-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                <div className="relative flex-1 min-w-[220px] max-w-sm">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Buscar por nombre, SKU o categoría..."
                    className="w-full text-xs pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xs focus:bg-white focus:outline-none focus:border-black"
                  />
                </div>

                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="text-xs py-2 px-3 bg-neutral-50 border border-neutral-200 rounded-xs uppercase tracking-wider text-neutral-800"
                >
                  <option value="todas">Todas las Categorías</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={openCreateProductModal}
                className="px-4 py-2 bg-neutral-900 hover:bg-black text-white text-xs uppercase tracking-wider font-semibold rounded-xs transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Nueva Prenda</span>
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#faf8f5] text-neutral-700 uppercase tracking-wider font-semibold border-b border-neutral-200">
                  <tr>
                    <th className="py-3 px-4">Prenda</th>
                    <th className="py-3 px-4">Categoría / Género</th>
                    <th className="py-3 px-4">Precio</th>
                    <th className="py-3 px-4">Variantes</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4">Etiquetas Activas (Clic para alternar)</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-800">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-neutral-50/70">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <div className="relative w-11 h-14 bg-neutral-100 rounded-xs overflow-hidden shrink-0">
                          <Image
                            src={
                              p.images[0] ||
                              'https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=400&auto=format&fit=crop'
                            }
                            alt={p.name}
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <Link
                            href={`/producto/${p.slug}`}
                            className="font-semibold text-neutral-900 hover:underline block"
                          >
                            {p.name}
                          </Link>
                          <span className="text-[11px] text-neutral-400 font-mono">
                            SKU: {p.sku} • {p.images.length} fotos
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="uppercase text-[11px] font-semibold text-neutral-800 block">
                          {p.category}
                        </span>
                        <span className="text-[10px] uppercase text-neutral-400">
                          {p.gender}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-neutral-900">${p.price}</span>
                        {p.originalPrice && (
                          <span className="text-[11px] text-neutral-400 line-through ml-1.5">
                            ${p.originalPrice}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 mb-1">
                          {p.colors.map((c, idx) => (
                            <span
                              key={idx}
                              title={c.name}
                              className="w-3 h-3 rounded-full border border-neutral-300"
                              style={{ backgroundColor: c.hex }}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-neutral-500">
                          {p.sizes.join(', ')}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`font-semibold ${
                            p.stock <= 5 ? 'text-rose-600' : 'text-neutral-800'
                          }`}
                        >
                          {p.stock} uds
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          <button
                            type="button"
                            onClick={() => updateProduct(p.id, { isBestSeller: !p.isBestSeller })}
                            className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase border transition-colors ${
                              p.isBestSeller
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : 'bg-neutral-50 text-neutral-400 border-neutral-200'
                            }`}
                          >
                            ★ Top Ventas
                          </button>
                          <button
                            type="button"
                            onClick={() => updateProduct(p.id, { isNew: !p.isNew })}
                            className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase border transition-colors ${
                              p.isNew
                                ? 'bg-neutral-900 text-white border-neutral-900'
                                : 'bg-neutral-50 text-neutral-400 border-neutral-200'
                            }`}
                          >
                            Nuevo
                          </button>
                          <button
                            type="button"
                            onClick={() => updateProduct(p.id, { isSale: !p.isSale })}
                            className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase border transition-colors ${
                              p.isSale
                                ? 'bg-rose-50 text-rose-700 border-rose-300'
                                : 'bg-neutral-50 text-neutral-400 border-neutral-200'
                            }`}
                          >
                            Oferta
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditProductModal(p)}
                            className="p-1.5 text-neutral-600 hover:text-black bg-neutral-100 hover:bg-neutral-200 rounded"
                            title="Editar prenda completa"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              duplicateProduct(p.id);
                              showToast(`Prenda "${p.name}" duplicada.`);
                            }}
                            className="p-1.5 text-neutral-600 hover:text-black bg-neutral-100 hover:bg-neutral-200 rounded"
                            title="Duplicar prenda"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`¿Estás seguro de eliminar "${p.name}"?`)) {
                                deleteProduct(p.id);
                                showToast(`Prenda "${p.name}" eliminada.`);
                              }
                            }}
                            className="p-1.5 text-neutral-400 hover:text-rose-600 rounded"
                            title="Eliminar prenda"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================
            4. TAB: COUPONS & PROMOTIONS MANAGEMENT
           ========================================================= */}
        {activeTab === 'cupones' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Create Coupon Form */}
            <div className="bg-white p-6 rounded-sm border border-neutral-200 shadow-xs space-y-4 h-fit">
              <h3 className="font-serif text-lg text-neutral-900 font-semibold border-b border-neutral-100 pb-3">
                Crear / Actualizar Cupón
              </h3>
              <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
                <div>
                  <label className="block uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                    Código del Cupón *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                    placeholder="Ej: VERANO25"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xs font-mono uppercase focus:bg-white focus:outline-none focus:border-black"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                      Descuento (%) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="95"
                      required
                      value={newCouponDiscount}
                      onChange={(e) => setNewCouponDiscount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xs focus:bg-white focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                      Compra Mínima ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newCouponMinOrder}
                      onChange={(e) => setNewCouponMinOrder(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xs focus:bg-white focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                    Descripción del Beneficio
                  </label>
                  <input
                    type="text"
                    value={newCouponDesc}
                    onChange={(e) => setNewCouponDesc(e.target.value)}
                    placeholder="Ej: 25% de descuento en toda la tienda"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xs focus:bg-white focus:outline-none focus:border-black"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-neutral-900 hover:bg-black text-white uppercase tracking-wider font-semibold rounded-xs transition-colors"
                >
                  Guardar Cupón Promocional
                </button>
              </form>
            </div>

            {/* Active Coupons List */}
            <div className="lg:col-span-2 bg-white rounded-sm border border-neutral-200 shadow-xs overflow-hidden">
              <div className="p-6 border-b border-neutral-100">
                <h3 className="font-serif text-lg text-neutral-900 font-semibold">
                  Cupones Configurados en la Pasarela y Carrito
                </h3>
                <p className="text-xs text-neutral-500">
                  Los clientes pueden aplicar cualquiera de los cupones activos directamente en el Carrito o en el Checkout.
                </p>
              </div>

              <div className="divide-y divide-neutral-100">
                {coupons.map((c) => (
                  <div
                    key={c.code}
                    className="p-5 flex flex-wrap items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold text-sm px-3 py-1 bg-[#faf8f5] border border-[#c5a880] text-neutral-900 rounded-xs">
                          {c.code}
                        </span>
                        <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          -{c.discountPercent}% DTO
                        </span>
                        {c.minOrder ? (
                          <span className="text-neutral-500">
                            Pedido mín: ${c.minOrder}
                          </span>
                        ) : (
                          <span className="text-neutral-400">Sin mínimo</span>
                        )}
                      </div>
                      <p className="text-neutral-600">{c.description}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          updateCoupon(c.code, { isActive: c.isActive === false });
                          showToast(
                            `Cupón ${c.code} ${
                              c.isActive === false ? 'activado' : 'desactivado'
                            }.`
                          );
                        }}
                        className={`px-3 py-1 rounded text-[11px] uppercase tracking-wider font-semibold border ${
                          c.isActive !== false
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-neutral-100 text-neutral-500 border-neutral-300'
                        }`}
                      >
                        {c.isActive !== false ? 'Activo' : 'Inactivo'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          deleteCoupon(c.code);
                          showToast(`Cupón ${c.code} eliminado.`);
                        }}
                        className="p-1.5 text-neutral-400 hover:text-rose-600"
                        title="Eliminar cupón"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            5. TAB: SITE CONTENT & CMS (Full Page Editor)
           ========================================================= */}
        {activeTab === 'cms' && (
          <div className="space-y-8 text-xs">
            {/* Section A: Brand, Top Announcement Bar & Shipping Rules */}
            <div className="bg-white p-6 sm:p-8 rounded-sm border border-neutral-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                <div>
                  <h3 className="font-serif text-xl text-neutral-900">
                    1. Identidad de Marca, Barra Superior y Tarifas de Envío
                  </h3>
                  <p className="text-neutral-500">
                    Los cambios se aplican instantáneamente en toda la tienda.
                  </p>
                </div>
                <Sparkles className="w-5 h-5 text-[#c5a880]" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                    Nombre de la Firma (Logo)
                  </label>
                  <input
                    type="text"
                    value={siteSettings.brandName}
                    onChange={(e) => updateSiteSettings({ brandName: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xs focus:bg-white focus:border-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                    Subtítulo del Logo
                  </label>
                  <input
                    type="text"
                    value={siteSettings.brandSubtitle}
                    onChange={(e) => updateSiteSettings({ brandSubtitle: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xs focus:bg-white focus:border-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                    Umbral Envío Gratis ($)
                  </label>
                  <input
                    type="number"
                    value={siteSettings.freeShippingThreshold}
                    onChange={(e) =>
                      updateSiteSettings({ freeShippingThreshold: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xs focus:bg-white focus:border-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                    Coste Envío Estándar ($)
                  </label>
                  <input
                    type="number"
                    value={siteSettings.standardShippingCost}
                    onChange={(e) =>
                      updateSiteSettings({ standardShippingCost: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xs focus:bg-white focus:border-black focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="md:col-span-2">
                  <label className="block uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                    Texto de la Barra de Anuncio Superior
                  </label>
                  <input
                    type="text"
                    value={siteSettings.announcementText}
                    onChange={(e) => updateSiteSettings({ announcementText: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xs focus:bg-white focus:border-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                    Destacado Derecha (Código)
                  </label>
                  <input
                    type="text"
                    value={siteSettings.announcementPromo}
                    onChange={(e) => updateSiteSettings({ announcementPromo: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xs focus:bg-white focus:border-black focus:outline-none"
                  />
                </div>
              </div>

              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={siteSettings.announcementEnabled}
                  onChange={(e) =>
                    updateSiteSettings({ announcementEnabled: e.target.checked })
                  }
                  className="w-4 h-4 accent-neutral-900 rounded"
                />
                <span className="font-medium text-neutral-800">
                  Mostrar Barra de Anuncio Superior en todas las páginas
                </span>
              </label>
            </div>

            {/* Section B: Hero Principal */}
            <div className="bg-white p-6 sm:p-8 rounded-sm border border-neutral-200 shadow-xs space-y-6">
              <div className="border-b border-neutral-100 pb-4">
                <h3 className="font-serif text-xl text-neutral-900">
                  2. Portada Principal (Hero Banner)
                </h3>
                <p className="text-neutral-500">
                  Personaliza la imagen a pantalla completa, los titulares y los botones de acción de la página de inicio.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                    Etiqueta / Badge Superior
                  </label>
                  <input
                    type="text"
                    value={siteSettings.heroBadge}
                    onChange={(e) => updateSiteSettings({ heroBadge: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xs"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                    Título Principal (Línea 1)
                  </label>
                  <input
                    type="text"
                    value={siteSettings.heroTitleLine1}
                    onChange={(e) => updateSiteSettings({ heroTitleLine1: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xs"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                    Título en Cursiva (Línea 2)
                  </label>
                  <input
                    type="text"
                    value={siteSettings.heroTitleItalic}
                    onChange={(e) => updateSiteSettings({ heroTitleItalic: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                  Subtítulo Editorial del Hero
                </label>
                <textarea
                  rows={2}
                  value={siteSettings.heroSubtitle}
                  onChange={(e) => updateSiteSettings({ heroSubtitle: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xs"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                    URL de Imagen de Fondo del Hero
                  </label>
                  <input
                    type="url"
                    value={siteSettings.heroImage}
                    onChange={(e) => updateSiteSettings({ heroImage: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xs font-mono text-[11px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                      Texto Botón Principal
                    </label>
                    <input
                      type="text"
                      value={siteSettings.heroPrimaryCtaText}
                      onChange={(e) =>
                        updateSiteSettings({ heroPrimaryCtaText: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xs"
                    />
                  </div>
                  <div>
                    <label className="block uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                      Texto Botón Secundario
                    </label>
                    <input
                      type="text"
                      value={siteSettings.heroSecondaryCtaText}
                      onChange={(e) =>
                        updateSiteSettings({ heroSecondaryCtaText: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section C: Lookbook Promo Banner & Showrooms */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-6 sm:p-8 rounded-sm border border-neutral-200 shadow-xs space-y-4">
                <h3 className="font-serif text-xl text-neutral-900 border-b border-neutral-100 pb-3">
                  3. Banner Editorial Lookbook
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                      Etiqueta Superior
                    </label>
                    <input
                      type="text"
                      value={siteSettings.lookbookBadge}
                      onChange={(e) => updateSiteSettings({ lookbookBadge: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xs"
                    />
                  </div>
                  <div>
                    <label className="block uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                      Cupón Destacado
                    </label>
                    <input
                      type="text"
                      value={siteSettings.lookbookCouponCode}
                      onChange={(e) =>
                        updateSiteSettings({ lookbookCouponCode: e.target.value.toUpperCase() })
                      }
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xs font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                    Titular del Banner
                  </label>
                  <input
                    type="text"
                    value={siteSettings.lookbookTitle}
                    onChange={(e) => updateSiteSettings({ lookbookTitle: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xs"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                    Descripción del Banner
                  </label>
                  <textarea
                    rows={2}
                    value={siteSettings.lookbookDescription}
                    onChange={(e) =>
                      updateSiteSettings({ lookbookDescription: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xs"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                    Imagen de Fondo Lookbook (URL)
                  </label>
                  <input
                    type="url"
                    value={siteSettings.lookbookImage}
                    onChange={(e) => updateSiteSettings({ lookbookImage: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xs font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Footer & Showrooms */}
              <div className="bg-white p-6 sm:p-8 rounded-sm border border-neutral-200 shadow-xs space-y-4">
                <h3 className="font-serif text-xl text-neutral-900 border-b border-neutral-100 pb-3">
                  4. Pie de Página, Newsletter y Showrooms
                </h3>
                <div>
                  <label className="block uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                    Título Newsletter
                  </label>
                  <input
                    type="text"
                    value={siteSettings.newsletterTitle}
                    onChange={(e) => updateSiteSettings({ newsletterTitle: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xs"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                    Descripción Newsletter
                  </label>
                  <textarea
                    rows={2}
                    value={siteSettings.newsletterDescription}
                    onChange={(e) =>
                      updateSiteSettings({ newsletterDescription: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                      Boutique 1
                    </label>
                    <input
                      type="text"
                      value={siteSettings.showroom1Address}
                      onChange={(e) =>
                        updateSiteSettings({ showroom1Address: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xs"
                    />
                  </div>
                  <div>
                    <label className="block uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                      Boutique 2
                    </label>
                    <input
                      type="text"
                      value={siteSettings.showroom2Address}
                      onChange={(e) =>
                        updateSiteSettings({ showroom2Address: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                    Horario de Atención
                  </label>
                  <input
                    type="text"
                    value={siteSettings.atelierHours}
                    onChange={(e) => updateSiteSettings({ atelierHours: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xs"
                  />
                </div>
              </div>
            </div>

            {/* Section D: Testimonials Management */}
            <div className="bg-white p-6 sm:p-8 rounded-sm border border-neutral-200 shadow-xs space-y-6">
              <h3 className="font-serif text-xl text-neutral-900 border-b border-neutral-100 pb-3">
                5. Reseñas y Testimonios en Portada ({siteSettings.testimonials?.length || 0})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(siteSettings.testimonials || []).map((t) => (
                  <div
                    key={t.id}
                    className="p-4 bg-[#faf8f5] border border-neutral-200 rounded-xs flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteTestimonial(t.id)}
                          className="text-neutral-400 hover:text-rose-600"
                          title="Eliminar testimonio"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="italic text-neutral-700">&ldquo;{t.comment}&rdquo;</p>
                    </div>
                    <div className="pt-2 border-t border-neutral-200/70">
                      <span className="font-semibold text-neutral-900 block">{t.name}</span>
                      <span className="text-[11px] text-neutral-500">{t.role}</span>
                    </div>
                  </div>
                ))}
              </div>

              <form
                onSubmit={handleAddTestimonial}
                className="pt-4 border-t border-neutral-100 grid grid-cols-1 md:grid-cols-4 gap-3 items-end"
              >
                <div>
                  <label className="block uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                    Nombre del Cliente *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTestName}
                    onChange={(e) => setNewTestName(e.target.value)}
                    placeholder="Ej: Clara Mendoza"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xs"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                    Cargo / Ciudad
                  </label>
                  <input
                    type="text"
                    value={newTestRole}
                    onChange={(e) => setNewTestRole(e.target.value)}
                    placeholder="Ej: Arquitecta, Zurích"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xs"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                    Opinión / Reseña *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTestComment}
                    onChange={(e) => setNewTestComment(e.target.value)}
                    placeholder="Comentario sobre la calidad..."
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xs"
                  />
                </div>
                <button
                  type="submit"
                  className="py-2 px-4 bg-neutral-900 hover:bg-black text-white uppercase tracking-wider font-semibold rounded-xs"
                >
                  + Añadir Testimonio
                </button>
              </form>
            </div>
          </div>
        )}

        {/* =========================================================
            6. TAB: ORDER MANAGEMENT
           ========================================================= */}
        {activeTab === 'pedidos' && (
          <div className="bg-white rounded-sm border border-neutral-200 shadow-xs overflow-hidden">
            {/* Search & Status Filters */}
            <div className="p-4 sm:p-6 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Buscar por Nº de pedido o cliente..."
                  className="w-full text-xs pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xs focus:bg-white focus:outline-none focus:border-black"
                />
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-neutral-400 uppercase tracking-wider">Estado:</span>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="bg-neutral-50 border border-neutral-200 text-neutral-800 text-xs py-1.5 px-3 rounded-xs uppercase tracking-wider"
                >
                  <option value="todos">Todos los Estados</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Procesando">Procesando</option>
                  <option value="Enviado">Enviado</option>
                  <option value="Entregado">Entregado</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#faf8f5] text-neutral-700 uppercase tracking-wider font-semibold border-b border-neutral-200">
                  <tr>
                    <th className="py-3 px-4">Nº Pedido</th>
                    <th className="py-3 px-4">Cliente & Destino</th>
                    <th className="py-3 px-4">Fecha</th>
                    <th className="py-3 px-4">Detalle de Prendas</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Estado (Stock reactivo)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-800">
                  {filteredOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-neutral-50/70">
                      <td className="py-3.5 px-4 font-mono font-semibold text-neutral-900">
                        {o.orderNumber}
                        {o.couponCode && (
                          <span className="block text-[10px] text-[#c5a880]">
                            Cupón: {o.couponCode}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-neutral-900 block">
                          {o.customer.firstName} {o.customer.lastName}
                        </span>
                        <span className="text-[11px] text-neutral-400 block">
                          {o.customer.email} • {o.customer.city}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-neutral-500">
                        {new Date(o.date).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4">
                        {o.items.map((item, i) => (
                          <div key={i} className="text-[11px] text-neutral-700">
                            {item.quantity}x {item.product.name} ({item.selectedSize})
                          </div>
                        ))}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-neutral-900">${o.total}</td>
                      <td className="py-3.5 px-4">
                        <select
                          value={o.status}
                          onChange={(e) => {
                            const nextStatus = e.target.value as OrderStatus;
                            updateOrderStatus(o.id, nextStatus);
                            showToast(
                              `Pedido ${o.orderNumber} actualizado a "${nextStatus}".`
                            );
                          }}
                          className={`text-xs font-semibold uppercase tracking-wider py-1 px-2.5 rounded border transition-colors cursor-pointer ${
                            o.status === 'Entregado'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : o.status === 'Enviado'
                              ? 'bg-sky-50 text-sky-800 border-sky-300'
                              : o.status === 'Procesando'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : o.status === 'Cancelado'
                              ? 'bg-rose-50 text-rose-800 border-rose-300'
                              : 'bg-neutral-50 text-neutral-800 border-neutral-300'
                          }`}
                        >
                          <option value="Pendiente">Pendiente</option>
                          <option value="Procesando">Procesando</option>
                          <option value="Enviado">Enviado</option>
                          <option value="Entregado">Entregado</option>
                          <option value="Cancelado">Cancelado (repone stock)</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================
            7. TAB: INVENTORY & STOCK ALERTS
           ========================================================= */}
        {activeTab === 'inventario' && (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-sm flex items-center gap-3 text-amber-800 text-xs">
              <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />
              <span>
                El stock se descuenta automáticamente cuando un cliente finaliza un pedido y se restaura si el pedido se marca como Cancelado. También puedes ajustarlo manualmente aquí.
              </span>
            </div>

            <div className="bg-white rounded-sm border border-neutral-200 shadow-xs overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#faf8f5] text-neutral-700 uppercase tracking-wider font-semibold border-b border-neutral-200">
                  <tr>
                    <th className="py-3 px-4">Prenda</th>
                    <th className="py-3 px-4">SKU</th>
                    <th className="py-3 px-4">Categoría</th>
                    <th className="py-3 px-4">Stock Disponible</th>
                    <th className="py-3 px-4">Ajuste Rápido</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-800">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-neutral-50/70">
                      <td className="py-3 px-4 font-semibold text-neutral-900">{p.name}</td>
                      <td className="py-3 px-4 font-mono text-neutral-500">{p.sku}</td>
                      <td className="py-3 px-4 uppercase text-[11px] text-neutral-600">
                        {p.category}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-semibold px-2.5 py-0.5 rounded ${
                            p.stock === 0
                              ? 'bg-rose-600 text-white'
                              : p.stock <= 8
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-neutral-100 text-neutral-800'
                          }`}
                        >
                          {p.stock === 0 ? 'Agotado (0 uds)' : `${p.stock} unidades`}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              updateProduct(p.id, { stock: Math.max(0, p.stock - 1) })
                            }
                            className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 rounded text-neutral-700 font-bold"
                          >
                            -1
                          </button>
                          <button
                            type="button"
                            onClick={() => updateProduct(p.id, { stock: p.stock + 1 })}
                            className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 rounded text-neutral-700 font-bold"
                          >
                            +1
                          </button>
                          <button
                            type="button"
                            onClick={() => updateProduct(p.id, { stock: p.stock + 5 })}
                            className="px-2.5 py-1 bg-neutral-900 hover:bg-black text-white rounded font-bold"
                          >
                            +5
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================
            8. TAB: CLIENTS DIRECTORY
           ========================================================= */}
        {activeTab === 'clientes' && (
          <div className="bg-white rounded-sm border border-neutral-200 shadow-xs overflow-hidden p-6 sm:p-8 space-y-4">
            <h3 className="font-serif text-lg text-neutral-900 uppercase tracking-wider font-semibold pb-3 border-b border-neutral-100">
              Directorio de Clientes y Compradores ({clientsList.length})
            </h3>
            <div className="divide-y divide-neutral-100 text-xs">
              {clientsList.map((client) => (
                <div
                  key={client.email}
                  className="py-3.5 flex items-center justify-between"
                >
                  <div>
                    <span className="font-semibold text-neutral-900 block">
                      {client.name}
                    </span>
                    <span className="text-neutral-500">
                      {client.email} • {client.city}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-neutral-900 block">
                      {client.ordersCount}{' '}
                      {client.ordersCount === 1 ? 'Pedido' : 'Pedidos'}
                    </span>
                    <span className="text-emerald-700 font-medium">
                      ${client.totalSpent} facturados
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================
            MODAL: CREATE / EDIT CATEGORY
           ========================================================= */}
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setIsCategoryModalOpen(false)}
            />
            <div className="min-h-screen flex items-center justify-center p-4">
              <div className="relative w-full max-w-xl bg-white shadow-2xl rounded-sm border border-neutral-200 p-6 sm:p-8 space-y-5 text-xs">
                <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                  <h3 className="font-serif text-lg uppercase tracking-wider text-neutral-900 font-semibold">
                    {editingCategoryId ? 'Editar Categoría' : 'Crear Nueva Categoría'}
                  </h3>
                  <button
                    onClick={() => setIsCategoryModalOpen(false)}
                    className="text-neutral-400 hover:text-black"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveCategory} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                        Nombre de la Categoría *
                      </label>
                      <input
                        type="text"
                        required
                        value={catName}
                        onChange={(e) => {
                          setCatName(e.target.value);
                          if (!editingCategoryId) setCatSlug(slugify(e.target.value));
                        }}
                        placeholder="Ej: Calzado Artesanal"
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xs focus:bg-white focus:outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="block uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                        Slug (Identificador URL) *
                      </label>
                      <input
                        type="text"
                        required
                        value={catSlug}
                        onChange={(e) => setCatSlug(slugify(e.target.value))}
                        placeholder="ej: calzado"
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xs font-mono focus:bg-white focus:outline-none focus:border-black"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                        Subtítulo / Badge Editorial
                      </label>
                      <input
                        type="text"
                        value={catBadge}
                        onChange={(e) => setCatBadge(e.target.value)}
                        placeholder="Ej: Edición Limitada"
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xs"
                      />
                    </div>
                    <div>
                      <label className="block uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                        Tipo de Filtro
                      </label>
                      <select
                        value={catFilterType}
                        onChange={(e) =>
                          setCatFilterType(e.target.value as 'category' | 'gender')
                        }
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xs"
                      >
                        <option value="category">Categoría de Prenda (ej: chaquetas, calzado)</option>
                        <option value="gender">Línea de Género (mujer, hombre, unisex)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                      Descripción de la Colección *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={catDescription}
                      onChange={(e) => setCatDescription(e.target.value)}
                      placeholder="Describe los tejidos y estilo de esta categoría..."
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xs"
                    />
                  </div>

                  <div>
                    <label className="block uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                      URL de Imagen de Portada *
                    </label>
                    <input
                      type="url"
                      required
                      value={catImage}
                      onChange={(e) => setCatImage(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xs font-mono text-[11px]"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-6 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={catShowInNavbar}
                        onChange={(e) => setCatShowInNavbar(e.target.checked)}
                        className="w-4 h-4 accent-neutral-900 rounded"
                      />
                      <span>Mostrar enlace directo en la Barra de Navegación</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={catShowInHome}
                        onChange={(e) => setCatShowInHome(e.target.checked)}
                        className="w-4 h-4 accent-neutral-900 rounded"
                      />
                      <span>Destacar como tarjeta visual en la Portada (Home)</span>
                    </label>
                  </div>

                  <div className="pt-4 border-t border-neutral-100 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsCategoryModalOpen(false)}
                      className="px-4 py-2.5 border border-neutral-300 text-neutral-700 hover:border-black uppercase tracking-wider font-semibold rounded-xs"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-neutral-900 hover:bg-black text-white uppercase tracking-wider font-semibold rounded-xs shadow-md"
                    >
                      {editingCategoryId ? 'Guardar Categoría' : 'Crear Categoría'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            MODAL: CREATE / EDIT PRODUCT (Full Multi-Image, Multi-Color, Details)
           ========================================================= */}
        {isProductModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setIsProductModalOpen(false)}
            />

            <div className="min-h-screen flex items-center justify-center p-4">
              <div className="relative w-full max-w-3xl bg-white shadow-2xl rounded-sm border border-neutral-200 p-6 sm:p-8 space-y-6 my-8">
                <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                  <h3 className="font-serif text-lg uppercase tracking-wider text-neutral-900 font-semibold">
                    {editingProductId ? 'Editar Prenda Completa' : 'Publicar Nueva Prenda'}
                  </h3>
                  <button
                    onClick={() => setIsProductModalOpen(false)}
                    className="text-neutral-400 hover:text-black"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveProduct} className="space-y-5 text-xs">
                  {/* Row 1: Name, SKU, Slug */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                        Nombre de la Prenda *
                      </label>
                      <input
                        type="text"
                        required
                        value={formName}
                        onChange={(e) => {
                          setFormName(e.target.value);
                          if (!editingProductId) setFormSlug(slugify(e.target.value));
                        }}
                        placeholder="Ej: Abrigo Sartorial en Lana Virgen"
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xs focus:bg-white focus:outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="block uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                        Código SKU *
                      </label>
                      <input
                        type="text"
                        required
                        value={formSku}
                        onChange={(e) => setFormSku(e.target.value.toUpperCase())}
                        placeholder="AUR-JKT-001"
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Row 2: Subtitle & Category/Gender */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                        Subtítulo / Tejido *
                      </label>
                      <input
                        type="text"
                        required
                        value={formSubtitle}
                        onChange={(e) => setFormSubtitle(e.target.value)}
                        placeholder="100% Lana Virgen Italiana"
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xs"
                      />
                    </div>

                    <div>
                      <label className="block uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                        Categoría (Dinámica) *
                      </label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xs"
                      >
                        {categories
                          .filter(
                            (c) =>
                              c.filterType !== 'gender' &&
                              !['mujer', 'hombre', 'unisex'].includes(c.slug)
                          )
                          .map((c) => (
                            <option key={c.id} value={c.slug}>
                              {c.name} ({c.slug})
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="block uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                        Género *
                      </label>
                      <select
                        value={formGender}
                        onChange={(e) => setFormGender(e.target.value as Gender)}
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xs"
                      >
                        <option value="mujer">Mujer</option>
                        <option value="hombre">Hombre</option>
                        <option value="unisex">Unisex</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 3: Description */}
                  <div>
                    <label className="block uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                      Descripción Editorial *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Descripción detallada del corte, caída y confección..."
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xs"
                    />
                  </div>

                  {/* Row 4: Price, Original Price, Stock, Sizes */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                        Precio Venta ($) *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formPrice}
                        onChange={(e) => setFormPrice(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xs"
                      />
                    </div>
                    <div>
                      <label className="block uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                        Precio Antes ($)
                      </label>
                      <input
                        type="number"
                        value={formOriginalPrice || ''}
                        onChange={(e) =>
                          setFormOriginalPrice(
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                        placeholder="Opcional"
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xs"
                      />
                    </div>
                    <div>
                      <label className="block uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                        Stock (Unidades) *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formStock}
                        onChange={(e) => setFormStock(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xs"
                      />
                    </div>
                    <div>
                      <label className="block uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                        Tallas (separar por coma) *
                      </label>
                      <input
                        type="text"
                        required
                        value={formSizes}
                        onChange={(e) => setFormSizes(e.target.value)}
                        placeholder="XS, S, M, L, XL"
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xs"
                      />
                    </div>
                  </div>

                  {/* Row 5: Multiple Images Manager */}
                  <div className="space-y-2 p-4 bg-[#faf8f5] border border-neutral-200 rounded-xs">
                    <div className="flex items-center justify-between">
                      <label className="uppercase tracking-wider text-neutral-800 font-semibold">
                        Galería de Fotografías ({formImages.length})
                      </label>
                      <button
                        type="button"
                        onClick={() => setFormImages([...formImages, ''])}
                        className="text-[11px] uppercase tracking-wider font-semibold text-neutral-900 underline"
                      >
                        + Añadir otra imagen
                      </button>
                    </div>
                    <div className="space-y-2">
                      {formImages.map((imgUrl, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="url"
                            value={imgUrl}
                            onChange={(e) => {
                              const next = [...formImages];
                              next[idx] = e.target.value;
                              setFormImages(next);
                            }}
                            placeholder="https://images.unsplash.com/photo-..."
                            className="flex-1 px-3 py-1.5 bg-white border border-neutral-200 rounded-xs font-mono text-[11px]"
                          />
                          {formImages.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                setFormImages(formImages.filter((_, i) => i !== idx))
                              }
                              className="p-1.5 text-neutral-400 hover:text-rose-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Row 6: Multiple Colors Manager */}
                  <div className="space-y-2 p-4 bg-[#faf8f5] border border-neutral-200 rounded-xs">
                    <div className="flex items-center justify-between">
                      <label className="uppercase tracking-wider text-neutral-800 font-semibold">
                        Variantes de Color ({formColors.length})
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setFormColors([
                            ...formColors,
                            { name: 'Marfil Editorial', hex: '#f5f2eb' },
                          ])
                        }
                        className="text-[11px] uppercase tracking-wider font-semibold text-neutral-900 underline"
                      >
                        + Añadir otro color
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {formColors.map((col, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-white p-2 border border-neutral-200 rounded-xs">
                          <input
                            type="color"
                            value={col.hex}
                            onChange={(e) => {
                              const next = [...formColors];
                              next[idx] = { ...next[idx], hex: e.target.value };
                              setFormColors(next);
                            }}
                            className="w-8 h-7 border border-neutral-200 cursor-pointer shrink-0"
                          />
                          <input
                            type="text"
                            value={col.name}
                            onChange={(e) => {
                              const next = [...formColors];
                              next[idx] = { ...next[idx], name: e.target.value };
                              setFormColors(next);
                            }}
                            placeholder="Nombre del color"
                            className="flex-1 px-2 py-1 text-xs border-b border-transparent focus:border-black focus:outline-none"
                          />
                          {formColors.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                setFormColors(formColors.filter((_, i) => i !== idx))
                              }
                              className="text-neutral-400 hover:text-rose-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Row 7: Composition, Details & Care */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                        Composición del Tejido
                      </label>
                      <textarea
                        rows={3}
                        value={formComposition}
                        onChange={(e) => setFormComposition(e.target.value)}
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xs"
                      />
                    </div>
                    <div>
                      <label className="block uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                        Detalles (1 por línea)
                      </label>
                      <textarea
                        rows={3}
                        value={formDetailsText}
                        onChange={(e) => setFormDetailsText(e.target.value)}
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xs"
                      />
                    </div>
                    <div>
                      <label className="block uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                        Cuidados (1 por línea)
                      </label>
                      <textarea
                        rows={3}
                        value={formCareText}
                        onChange={(e) => setFormCareText(e.target.value)}
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xs"
                      />
                    </div>
                  </div>

                  {/* Flags */}
                  <div className="flex flex-wrap items-center gap-6 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formIsNew}
                        onChange={(e) => setFormIsNew(e.target.checked)}
                        className="w-4 h-4 accent-neutral-900 rounded"
                      />
                      <span>Nuevo Lanzamiento</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formIsBestSeller}
                        onChange={(e) => setFormIsBestSeller(e.target.checked)}
                        className="w-4 h-4 accent-neutral-900 rounded"
                      />
                      <span>Más Vendido (Best Seller en Home)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formIsSale}
                        onChange={(e) => setFormIsSale(e.target.checked)}
                        className="w-4 h-4 accent-neutral-900 rounded"
                      />
                      <span>En Oferta Especial</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formIsFeatured}
                        onChange={(e) => setFormIsFeatured(e.target.checked)}
                        className="w-4 h-4 accent-neutral-900 rounded"
                      />
                      <span>Destacado en Catálogo</span>
                    </label>
                  </div>

                  <div className="pt-4 border-t border-neutral-100 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsProductModalOpen(false)}
                      className="px-4 py-2.5 border border-neutral-300 text-neutral-700 hover:border-black uppercase tracking-wider font-semibold rounded-xs"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-neutral-900 hover:bg-black text-white uppercase tracking-wider font-semibold rounded-xs shadow-md"
                    >
                      {editingProductId ? 'Guardar Cambios' : 'Publicar Prenda'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
