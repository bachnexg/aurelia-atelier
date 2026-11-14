'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Order,
  OrderStatus,
  CategoryItem,
  Coupon,
  SiteSettings,
} from '@/types';
import {
  INITIAL_PRODUCTS,
  CATEGORIES_METADATA,
  INITIAL_COUPONS,
  INITIAL_SITE_SETTINGS,
} from '@/data/products';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface StoreContextType {
  products: Product[];
  categories: CategoryItem[];
  coupons: Coupon[];
  orders: Order[];
  siteSettings: SiteSettings;
  isSupabaseConnected: boolean;

  // Products CRUD
  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  duplicateProduct: (id: string) => Product | undefined;
  getProductBySlug: (slug: string) => Product | undefined;
  getProductById: (id: string) => Product | undefined;

  // Categories CRUD
  addCategory: (category: Omit<CategoryItem, 'id'>) => CategoryItem;
  updateCategory: (id: string, category: Partial<CategoryItem>) => void;
  deleteCategory: (id: string) => void;

  // Coupons CRUD
  addCoupon: (coupon: Coupon) => void;
  updateCoupon: (code: string, coupon: Partial<Coupon>) => void;
  deleteCoupon: (code: string) => void;

  // Site Settings CMS
  updateSiteSettings: (settings: Partial<SiteSettings>) => void;
  resetStoreToDefaults: () => void;

  // Orders & Stock
  createOrder: (orderData: Omit<Order, 'id' | 'orderNumber' | 'date' | 'status'>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

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
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<CategoryItem[]>(CATEGORIES_METADATA);
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [orders, setOrders] = useState<Order[]>(SAMPLE_ORDERS);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(INITIAL_SITE_SETTINGS);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load state from localStorage & optionally sync from Supabase
  useEffect(() => {
    try {
      const savedProducts = localStorage.getItem('aurelia_products');
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts));
      } else {
        localStorage.setItem('aurelia_products', JSON.stringify(INITIAL_PRODUCTS));
      }

      const savedCategories = localStorage.getItem('aurelia_categories');
      if (savedCategories) {
        setCategories(JSON.parse(savedCategories));
      } else {
        localStorage.setItem('aurelia_categories', JSON.stringify(CATEGORIES_METADATA));
      }

      const savedCoupons = localStorage.getItem('aurelia_coupons_list');
      if (savedCoupons) {
        setCoupons(JSON.parse(savedCoupons));
      } else {
        localStorage.setItem('aurelia_coupons_list', JSON.stringify(INITIAL_COUPONS));
      }

      const savedSettings = localStorage.getItem('aurelia_site_settings');
      if (savedSettings) {
        setSiteSettings({ ...INITIAL_SITE_SETTINGS, ...JSON.parse(savedSettings) });
      } else {
        localStorage.setItem('aurelia_site_settings', JSON.stringify(INITIAL_SITE_SETTINGS));
      }

      const savedOrders = localStorage.getItem('aurelia_orders');
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      } else {
        localStorage.setItem('aurelia_orders', JSON.stringify(SAMPLE_ORDERS));
      }
    } catch (e) {
      console.error('Error loading store state', e);
    }
    setIsHydrated(true);

    // Optional cloud sync if Supabase credentials are provided
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
          // Fallback silently to localStorage if table doesn't exist yet
        }
      })();
    }
  }, []);

  // Persist changes to localStorage
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem('aurelia_products', JSON.stringify(products));
    } catch (e) {
      console.error('Error saving products', e);
    }
  }, [products, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem('aurelia_categories', JSON.stringify(categories));
    } catch (e) {
      console.error('Error saving categories', e);
    }
  }, [categories, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem('aurelia_coupons_list', JSON.stringify(coupons));
    } catch (e) {
      console.error('Error saving coupons', e);
    }
  }, [coupons, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem('aurelia_site_settings', JSON.stringify(siteSettings));
    } catch (e) {
      console.error('Error saving site settings', e);
    }
  }, [siteSettings, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem('aurelia_orders', JSON.stringify(orders));
    } catch (e) {
      console.error('Error saving orders', e);
    }
  }, [orders, isHydrated]);

  // --- PRODUCTS CRUD ---
  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = (id: string, updatedFields: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
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
    setProducts((prev) => [copy, ...prev]);
    return copy;
  };

  const getProductBySlug = (slug: string) => {
    return products.find((p) => p.slug === slug);
  };

  const getProductById = (id: string) => {
    return products.find((p) => p.id === id);
  };

  // --- CATEGORIES CRUD ---
  const addCategory = (categoryData: Omit<CategoryItem, 'id'>) => {
    const newCat: CategoryItem = {
      ...categoryData,
      id: `cat-${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCat]);
    return newCat;
  };

  const updateCategory = (id: string, updatedFields: Partial<CategoryItem>) => {
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const updated = { ...c, ...updatedFields };
        // If slug changed, also migrate products that belonged to old slug
        if (updatedFields.slug && updatedFields.slug !== c.slug && c.filterType !== 'gender') {
          setProducts((prods) =>
            prods.map((p) => (p.category === c.slug ? { ...p, category: updatedFields.slug! } : p))
          );
        }
        return updated;
      })
    );
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
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
    setSiteSettings((prev) => ({ ...prev, ...updated }));
  };

  const resetStoreToDefaults = () => {
    setProducts(INITIAL_PRODUCTS);
    setCategories(CATEGORIES_METADATA);
    setCoupons(INITIAL_COUPONS);
    setSiteSettings(INITIAL_SITE_SETTINGS);
    setOrders(SAMPLE_ORDERS);
    localStorage.setItem('aurelia_products', JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem('aurelia_categories', JSON.stringify(CATEGORIES_METADATA));
    localStorage.setItem('aurelia_coupons_list', JSON.stringify(INITIAL_COUPONS));
    localStorage.setItem('aurelia_site_settings', JSON.stringify(INITIAL_SITE_SETTINGS));
    localStorage.setItem('aurelia_orders', JSON.stringify(SAMPLE_ORDERS));
  };

  // --- ORDERS & AUTOMATIC STOCK MANAGEMENT ---
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

    // Deduct stock automatically for every purchased item
    setProducts((prevProducts) =>
      prevProducts.map((product) => {
        const orderedQty = orderData.items
          .filter((item) => item.product.id === product.id)
          .reduce((sum, item) => sum + item.quantity, 0);
        if (orderedQty === 0) return product;
        return {
          ...product,
          stock: Math.max(0, product.stock - orderedQty),
        };
      })
    );

    setOrders((prev) => [newOrder, ...prev]);

    // Sync to Supabase if configured
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
        // Restore stock if transitioning to Cancelado
        if (o.status !== 'Cancelado' && status === 'Cancelado') {
          setProducts((prevProducts) =>
            prevProducts.map((product) => {
              const orderedQty = o.items
                .filter((item) => item.product.id === product.id)
                .reduce((sum, item) => sum + item.quantity, 0);
              if (orderedQty === 0) return product;
              return { ...product, stock: product.stock + orderedQty };
            })
          );
        }
        // Deduct stock again if un-cancelling an order
        if (o.status === 'Cancelado' && status !== 'Cancelado') {
          setProducts((prevProducts) =>
            prevProducts.map((product) => {
              const orderedQty = o.items
                .filter((item) => item.product.id === product.id)
                .reduce((sum, item) => sum + item.quantity, 0);
              if (orderedQty === 0) return product;
              return { ...product, stock: Math.max(0, product.stock - orderedQty) };
            })
          );
        }
        return { ...o, status };
      })
    );
  };

  return (
    <StoreContext.Provider
      value={{
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
