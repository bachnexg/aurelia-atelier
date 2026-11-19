'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Order,
  OrderStatus,
  CategoryItem,
  Coupon,
  SiteSettings,
  StoreMode,
} from '@/types';
import {
  INITIAL_PRODUCTS,
  CATEGORIES_METADATA,
  INITIAL_COUPONS,
  INITIAL_SITE_SETTINGS,
  SHOES_JEANS_PRODUCTS,
  SHOES_JEANS_CATEGORIES,
  SHOES_JEANS_SITE_SETTINGS,
} from '@/data/products';
import initialSnapshot from '@/data/store-snapshot.json';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface StoreContextType {
  storeMode: StoreMode;
  setStoreMode: (mode: StoreMode) => Promise<{ success: boolean; deployedVia?: string }>;
  publishToProduction: (
    overrideMode?: StoreMode
  ) => Promise<{ success: boolean; deployedVia?: string; message?: string }>;
  isSyncingProduction: boolean;
  products: Product[];
  categories: CategoryItem[];
  coupons: Coupon[];
  orders: Order[];
  siteSettings: SiteSettings;
  isSupabaseConnected: boolean;

  // Products CRUD (operates on active storeMode)
  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  duplicateProduct: (id: string) => Product | undefined;
  getProductBySlug: (slug: string) => Product | undefined;
  getProductById: (id: string) => Product | undefined;

  // Categories CRUD (operates on active storeMode)
  addCategory: (category: Omit<CategoryItem, 'id'>) => CategoryItem;
  updateCategory: (id: string, category: Partial<CategoryItem>) => void;
  deleteCategory: (id: string) => void;

  // Coupons CRUD
  addCoupon: (coupon: Coupon) => void;
  updateCoupon: (code: string, coupon: Partial<Coupon>) => void;
  deleteCoupon: (code: string) => void;

  // Site Settings CMS (operates on active storeMode)
  updateSiteSettings: (settings: Partial<SiteSettings>) => void;
  resetStoreToDefaults: () => void;

  // Orders & Stock
  createOrder: (orderData: Omit<Order, 'id' | 'orderNumber' | 'date' | 'status'>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const DEFAULT_STORE_MODE: StoreMode =
  (initialSnapshot.storeMode as StoreMode) === 'atelier_completo'
    ? 'atelier_completo'
    : 'zapatos_jeans';

const SAMPLE_ORDERS: Order[] = [
  {
    id: 'ord-101',
    orderNumber: 'ORD-89421',
    date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    customer: {
      firstName: 'Valentina',
      lastName: 'Rios',
      email: 'valentina.rios@example.com',
      phone: '+34 612 345 678',
      address: 'Paseo de la Castellana 45, 4º B',
      city: 'Madrid',
      postalCode: '28046',
      country: 'España',
    },
    items: [
      {
        id: 'prod-1-M-Negro Azabache',
        product: INITIAL_PRODUCTS[0],
        selectedSize: 'M',
        selectedColor: INITIAL_PRODUCTS[0].colors[0],
        quantity: 1,
      },
    ],
    subtotal: 389,
    discount: 0,
    shipping: 0,
    total: 389,
    paymentMethod: 'Tarjeta de Crédito',
    status: 'Procesando',
    trackingNumber: 'ES-GLS-9840214',
  },
  {
    id: 'ord-102',
    orderNumber: 'ORD-89418',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    customer: {
      firstName: 'Mateo',
      lastName: 'Alonso',
      email: 'mateo.alonso@example.com',
      phone: '+34 699 876 543',
      address: 'Rambla de Catalunya 112',
      city: 'Barcelona',
      postalCode: '08008',
      country: 'España',
    },
    items: [
      {
        id: 'prod-4-L-Blanco Crudo / Écru',
        product: INITIAL_PRODUCTS[3],
        selectedSize: 'L',
        selectedColor: INITIAL_PRODUCTS[3].colors[0],
        quantity: 2,
      },
    ],
    subtotal: 290,
    discount: 29,
    shipping: 0,
    total: 261,
    paymentMethod: 'PayPal',
    status: 'Enviado',
    trackingNumber: 'DHL-EX-47109283',
    couponCode: 'BIENVENIDA10',
  },
];

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [storeMode, setStoreModeState] = useState<StoreMode>(DEFAULT_STORE_MODE);
  const [isSyncingProduction, setIsSyncingProduction] = useState(false);

  // Mode 1: Modelo Actual (Atelier Completo)
  const [fullProducts, setFullProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [fullCategories, setFullCategories] = useState<CategoryItem[]>(CATEGORIES_METADATA);
  const [fullSettings, setFullSettings] = useState<SiteSettings>(INITIAL_SITE_SETTINGS);

  // Mode 2: Modo Zapatos & Pantalones Jean
  const [sjProducts, setSjProducts] = useState<Product[]>(SHOES_JEANS_PRODUCTS);
  const [sjCategories, setSjCategories] = useState<CategoryItem[]>(SHOES_JEANS_CATEGORIES);
  const [sjSettings, setSjSettings] = useState<SiteSettings>(SHOES_JEANS_SITE_SETTINGS);

  // Shared across modes
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [orders, setOrders] = useState<Order[]>(SAMPLE_ORDERS);
  const [isHydrated, setIsHydrated] = useState(false);

  // Active pointers based on storeMode
  const products = storeMode === 'zapatos_jeans' ? sjProducts : fullProducts;
  const categories = storeMode === 'zapatos_jeans' ? sjCategories : fullCategories;
  const siteSettings = storeMode === 'zapatos_jeans' ? sjSettings : fullSettings;

  // Load state from localStorage AND sync with Global Server State (/api/store/state)
  useEffect(() => {
    try {
      const savedProducts = localStorage.getItem('aurelia_products_v4');
      if (savedProducts) setFullProducts(JSON.parse(savedProducts));

      const savedCategories = localStorage.getItem('aurelia_categories_v4');
      if (savedCategories) setFullCategories(JSON.parse(savedCategories));

      const savedSettings = localStorage.getItem('aurelia_site_settings_v4');
      if (savedSettings) {
        setFullSettings({ ...INITIAL_SITE_SETTINGS, ...JSON.parse(savedSettings) });
      }

      const savedSjProducts = localStorage.getItem('aurelia_sj_products_v4');
      if (savedSjProducts) setSjProducts(JSON.parse(savedSjProducts));

      const savedSjCategories = localStorage.getItem('aurelia_sj_categories_v4');
      if (savedSjCategories) setSjCategories(JSON.parse(savedSjCategories));

      const savedSjSettings = localStorage.getItem('aurelia_sj_site_settings_v4');
      if (savedSjSettings) {
        setSjSettings({ ...SHOES_JEANS_SITE_SETTINGS, ...JSON.parse(savedSjSettings) });
      }

      const savedCoupons = localStorage.getItem('aurelia_coupons_list');
      if (savedCoupons) setCoupons(JSON.parse(savedCoupons));

      const savedOrders = localStorage.getItem('aurelia_orders');
      if (savedOrders) setOrders(JSON.parse(savedOrders));
    } catch (e) {
      console.error('Error loading local store state', e);
    }

    setIsHydrated(true);

    // Fetch authoritative server state so production visitors always see the Admin's chosen mode
    (async () => {
      try {
        const res = await fetch('/api/store/state', { cache: 'no-store' });
        if (!res.ok) return;
        const serverState = await res.json();

        if (
          serverState.storeMode === 'atelier_completo' ||
          serverState.storeMode === 'zapatos_jeans'
        ) {
          setStoreModeState(serverState.storeMode);
          localStorage.setItem('aurelia_store_mode', serverState.storeMode);
        }

        if (Array.isArray(serverState.fullProducts) && serverState.fullProducts.length > 0) {
          setFullProducts(serverState.fullProducts);
        }
        if (Array.isArray(serverState.fullCategories) && serverState.fullCategories.length > 0) {
          setFullCategories(serverState.fullCategories);
        }
        if (serverState.fullSettings) {
          setFullSettings({ ...INITIAL_SITE_SETTINGS, ...serverState.fullSettings });
        }
        if (Array.isArray(serverState.sjProducts) && serverState.sjProducts.length > 0) {
          setSjProducts(serverState.sjProducts);
        }
        if (Array.isArray(serverState.sjCategories) && serverState.sjCategories.length > 0) {
          setSjCategories(serverState.sjCategories);
        }
        if (serverState.sjSettings) {
          setSjSettings({ ...SHOES_JEANS_SITE_SETTINGS, ...serverState.sjSettings });
        }
        if (Array.isArray(serverState.coupons) && serverState.coupons.length > 0) {
          setCoupons(serverState.coupons);
        }
      } catch {
        // Offline or fallback to localStorage
      }
    })();

    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          const { data: dbCoupons } = await supabase.from('coupons').select('*');
          if (dbCoupons && dbCoupons.length > 0) {
            setCoupons(
              dbCoupons.map((c) => ({
                code: c.code,
                discountPercent: Number(c.discount_percent),
                description: c.description || '',
                minOrder: Number(c.min_order || 0),
                isActive: c.is_active ?? true,
              }))
            );
          }
        } catch {
          // Fallback silently
        }
      })();
    }
  }, []);

  // Persist changes to localStorage
  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem('aurelia_store_mode', storeMode);
  }, [storeMode, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem('aurelia_products_v4', JSON.stringify(fullProducts));
  }, [fullProducts, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem('aurelia_categories_v4', JSON.stringify(fullCategories));
  }, [fullCategories, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem('aurelia_site_settings_v4', JSON.stringify(fullSettings));
  }, [fullSettings, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem('aurelia_sj_products_v4', JSON.stringify(sjProducts));
  }, [sjProducts, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem('aurelia_sj_categories_v4', JSON.stringify(sjCategories));
  }, [sjCategories, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem('aurelia_sj_site_settings_v4', JSON.stringify(sjSettings));
  }, [sjSettings, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem('aurelia_coupons_list', JSON.stringify(coupons));
  }, [coupons, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem('aurelia_orders', JSON.stringify(orders));
  }, [orders, isHydrated]);

  // Publish current store state & mode to the server + GitHub/Production
  const publishToProduction = async (overrideMode?: StoreMode) => {
    const targetMode = overrideMode || storeMode;
    setIsSyncingProduction(true);
    try {
      const res = await fetch('/api/store/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          storeMode: targetMode,
          fullProducts,
          fullCategories,
          fullSettings,
          sjProducts,
          sjCategories,
          sjSettings,
          coupons,
          deployToProduction: true,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          message: data.message || 'No se pudo sincronizar con el servidor.',
        };
      }
      return {
        success: true,
        deployedVia: data.deployedVia,
      };
    } catch {
      return {
        success: false,
        message: 'Error de red al sincronizar con producción.',
      };
    } finally {
      setIsSyncingProduction(false);
    }
  };

  const setStoreMode = async (mode: StoreMode) => {
    setStoreModeState(mode);
    localStorage.setItem('aurelia_store_mode', mode);
    return publishToProduction(mode);
  };

  // Helper setters for the active mode
  const setActiveProducts = (updater: (prev: Product[]) => Product[]) => {
    if (storeMode === 'zapatos_jeans') {
      setSjProducts(updater);
    } else {
      setFullProducts(updater);
    }
  };

  const setActiveCategories = (updater: (prev: CategoryItem[]) => CategoryItem[]) => {
    if (storeMode === 'zapatos_jeans') {
      setSjCategories(updater);
    } else {
      setFullCategories(updater);
    }
  };

  const setActiveSettings = (updater: (prev: SiteSettings) => SiteSettings) => {
    if (storeMode === 'zapatos_jeans') {
      setSjSettings(updater);
    } else {
      setFullSettings(updater);
    }
  };

  // --- PRODUCTS CRUD ---
  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
    };
    setActiveProducts((prev) => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = (id: string, updatedFields: Partial<Product>) => {
    setActiveProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p))
    );
  };

  const deleteProduct = (id: string) => {
    setActiveProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const duplicateProduct = (id: string) => {
    const source = products.find((p) => p.id === id);
    if (!source) return undefined;
    const copy: Product = {
      ...source,
      id: `prod-${Date.now()}`,
      name: `${source.name} (Copia)`,
      slug: `${source.slug}-copia-${Date.now().toString().slice(-4)}`,
      sku: `${source.sku}-CP`,
    };
    setActiveProducts((prev) => [copy, ...prev]);
    return copy;
  };

  const getProductBySlug = (slug: string) => {
    return (
      products.find((p) => p.slug === slug) ||
      fullProducts.find((p) => p.slug === slug) ||
      sjProducts.find((p) => p.slug === slug)
    );
  };

  const getProductById = (id: string) => {
    return (
      products.find((p) => p.id === id) ||
      fullProducts.find((p) => p.id === id) ||
      sjProducts.find((p) => p.id === id)
    );
  };

  // --- CATEGORIES CRUD ---
  const addCategory = (categoryData: Omit<CategoryItem, 'id'>) => {
    const newCat: CategoryItem = {
      ...categoryData,
      id: `cat-${Date.now()}`,
    };
    setActiveCategories((prev) => [...prev, newCat]);
    return newCat;
  };

  const updateCategory = (id: string, updatedFields: Partial<CategoryItem>) => {
    setActiveCategories((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const updated = { ...c, ...updatedFields };
        if (
          updatedFields.slug &&
          updatedFields.slug !== c.slug &&
          c.filterType !== 'gender'
        ) {
          setActiveProducts((prods) =>
            prods.map((p) =>
              p.category === c.slug ? { ...p, category: updatedFields.slug! } : p
            )
          );
        }
        return updated;
      })
    );
  };

  const deleteCategory = (id: string) => {
    setActiveCategories((prev) => prev.filter((c) => c.id !== id));
  };

  // --- COUPONS CRUD ---
  const addCoupon = (coupon: Coupon) => {
    const cleanCode = coupon.code.trim().toUpperCase();
    setCoupons((prev) => [
      { ...coupon, code: cleanCode, isActive: coupon.isActive ?? true },
      ...prev.filter((c) => c.code !== cleanCode),
    ]);
  };

  const updateCoupon = (code: string, updatedFields: Partial<Coupon>) => {
    setCoupons((prev) =>
      prev.map((c) => (c.code === code ? { ...c, ...updatedFields } : c))
    );
  };

  const deleteCoupon = (code: string) => {
    setCoupons((prev) => prev.filter((c) => c.code !== code));
  };

  // --- SITE SETTINGS CMS ---
  const updateSiteSettings = (updated: Partial<SiteSettings>) => {
    setActiveSettings((prev) => ({ ...prev, ...updated }));
  };

  const resetStoreToDefaults = () => {
    setFullProducts(INITIAL_PRODUCTS);
    setFullCategories(CATEGORIES_METADATA);
    setFullSettings(INITIAL_SITE_SETTINGS);
    setSjProducts(SHOES_JEANS_PRODUCTS);
    setSjCategories(SHOES_JEANS_CATEGORIES);
    setSjSettings(SHOES_JEANS_SITE_SETTINGS);
    setCoupons(INITIAL_COUPONS);
    setOrders(SAMPLE_ORDERS);

    localStorage.setItem('aurelia_products_v4', JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem('aurelia_categories_v4', JSON.stringify(CATEGORIES_METADATA));
    localStorage.setItem('aurelia_site_settings_v4', JSON.stringify(INITIAL_SITE_SETTINGS));
    localStorage.setItem('aurelia_sj_products_v4', JSON.stringify(SHOES_JEANS_PRODUCTS));
    localStorage.setItem('aurelia_sj_categories_v4', JSON.stringify(SHOES_JEANS_CATEGORIES));
    localStorage.setItem('aurelia_sj_site_settings_v4', JSON.stringify(SHOES_JEANS_SITE_SETTINGS));
    localStorage.setItem('aurelia_coupons_list', JSON.stringify(INITIAL_COUPONS));
    localStorage.setItem('aurelia_orders', JSON.stringify(SAMPLE_ORDERS));
  };

  // --- ORDERS & AUTOMATIC STOCK MANAGEMENT ---
  const applyStockDelta = (items: Order['items'], multiplier: -1 | 1) => {
    const updateList = (list: Product[]) =>
      list.map((product) => {
        const orderedQty = items
          .filter((item) => item.product.id === product.id)
          .reduce((sum, item) => sum + item.quantity, 0);
        if (orderedQty === 0) return product;
        return {
          ...product,
          stock: Math.max(0, product.stock + multiplier * orderedQty),
        };
      });

    setFullProducts(updateList);
    setSjProducts(updateList);
  };

  const createOrder = (orderData: Omit<Order, 'id' | 'orderNumber' | 'date' | 'status'>) => {
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const trackingSuffix = Math.floor(1000000 + Math.random() * 9000000);
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber: `ORD-${randomSuffix}`,
      date: new Date().toISOString(),
      status: 'Pendiente',
      trackingNumber: orderData.trackingNumber || `AUR-EXP-${trackingSuffix}`,
    };

    applyStockDelta(orderData.items, -1);
    setOrders((prev) => [newOrder, ...prev]);

    if (isSupabaseConfigured && supabase) {
      supabase
        .from('orders')
        .insert({
          order_number: newOrder.orderNumber,
          customer_name: `${newOrder.customer.firstName} ${newOrder.customer.lastName}`.trim(),
          customer_email: newOrder.customer.email,
          customer_phone: newOrder.customer.phone,
          shipping_address: newOrder.customer,
          subtotal: newOrder.subtotal,
          discount: newOrder.discount,
          shipping_cost: newOrder.shipping,
          total: newOrder.total,
          payment_method: newOrder.paymentMethod,
          status: newOrder.status,
          tracking_number: newOrder.trackingNumber,
          coupon_code: newOrder.couponCode,
        })
        .then(() => {});
    }

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        if (o.status !== 'Cancelado' && status === 'Cancelado') {
          applyStockDelta(o.items, 1);
        }
        if (o.status === 'Cancelado' && status !== 'Cancelado') {
          applyStockDelta(o.items, -1);
        }
        return { ...o, status };
      })
    );
  };

  return (
    <StoreContext.Provider
      value={{
        storeMode,
        setStoreMode,
        publishToProduction,
        isSyncingProduction,
        products,
        categories,
        coupons,
        orders,
        siteSettings,
        isSupabaseConnected: isSupabaseConfigured,
        addProduct,
        updateProduct,
        deleteProduct,
        duplicateProduct,
        getProductBySlug,
        getProductById,
        addCategory,
        updateCategory,
        deleteCategory,
        addCoupon,
        updateCoupon,
        deleteCoupon,
        updateSiteSettings,
        resetStoreToDefaults,
        createOrder,
        updateOrderStatus,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
