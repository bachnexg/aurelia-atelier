'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, ProductColor, Coupon } from '@/types';
import { useStore } from '@/context/StoreContext';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, size: string, color: ProductColor, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  freeShippingThreshold: number;
  freeShippingProgress: number;
  totalItemsCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { products, coupons, siteSettings } = useStore();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('aurelia_cart');
      if (saved) {
        setItems(JSON.parse(saved));
      }
      const savedCoupon = localStorage.getItem('aurelia_coupon');
      if (savedCoupon) {
        setAppliedCoupon(JSON.parse(savedCoupon));
      }
    } catch (e) {
      console.error('Error loading cart from storage', e);
    }
    setIsHydrated(true);
  }, []);

  // Keep cart items synchronized with latest product prices/stock from StoreContext
  useEffect(() => {
    if (!isHydrated) return;
    setItems((prev) =>
      prev
        .map((item) => {
          const freshProduct = products.find((p) => p.id === item.product.id);
          if (!freshProduct) return item;
          return {
            ...item,
            product: freshProduct,
            quantity: freshProduct.stock > 0 ? Math.min(item.quantity, freshProduct.stock) : item.quantity,
          };
        })
        .filter((item) => item.product.stock > 0)
    );
  }, [products, isHydrated]);

  // Save to localStorage
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem('aurelia_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Error saving cart to storage', e);
    }
  }, [items, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      if (appliedCoupon) {
        localStorage.setItem('aurelia_coupon', JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem('aurelia_coupon');
      }
    } catch (e) {
      console.error('Error saving coupon to storage', e);
    }
  }, [appliedCoupon, isHydrated]);

  const addToCart = (product: Product, size: string, color: ProductColor, quantity = 1) => {
    const liveProduct = products.find((p) => p.id === product.id) || product;
    if (liveProduct.stock <= 0) return;

    const itemId = `${liveProduct.id}-${size}-${color.name}`;
    setItems((prev) => {
      const existing = prev.find((item) => item.id === itemId);
      const totalCurrentForProduct = prev
        .filter((item) => item.product.id === liveProduct.id)
        .reduce((sum, item) => sum + item.quantity, 0);

      const allowedIncrement = Math.max(0, liveProduct.stock - totalCurrentForProduct);
      const addQty = Math.min(quantity, allowedIncrement);

      if (existing) {
        if (addQty <= 0) return prev;
        return prev.map((item) =>
          item.id === itemId ? { ...item, product: liveProduct, quantity: item.quantity + addQty } : item
        );
      }

      if (addQty <= 0) return prev;

      return [
        ...prev,
        {
          id: itemId,
          product: liveProduct,
          selectedSize: size,
          selectedColor: color,
          quantity: addQty,
        },
      ];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const liveProduct = products.find((p) => p.id === item.product.id) || item.product;
        const clampedQty = Math.min(quantity, Math.max(1, liveProduct.stock));
        return { ...item, product: liveProduct, quantity: clampedQty };
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const applyCoupon = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    const found = coupons.find((c) => c.code === cleanCode && c.isActive !== false);
    if (!found) {
      return { success: false, message: 'El cupón no es válido o ha sido desactivado.' };
    }
    if (found.minOrder && subtotal < found.minOrder) {
      return {
        success: false,
        message: `Este cupón requiere un pedido mínimo de $${found.minOrder}.`,
      };
    }
    setAppliedCoupon(found);
    return {
      success: true,
      message: `¡Cupón ${found.code} aplicado con éxito (-${found.discountPercent}%)!`,
    };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  // Calculations using dynamic siteSettings
  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discount = appliedCoupon ? Math.round((subtotal * appliedCoupon.discountPercent) / 100) : 0;
  const freeShippingThreshold = siteSettings.freeShippingThreshold || 100;
  const shippingCost = siteSettings.standardShippingCost ?? 15;
  const shipping = subtotal === 0 || subtotal >= freeShippingThreshold ? 0 : shippingCost;
  const total = Math.max(0, subtotal - discount + shipping);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const totalItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        openCart,
        closeCart,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        subtotal,
        discount,
        shipping,
        total,
        freeShippingThreshold,
        freeShippingProgress,
        totalItemsCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
