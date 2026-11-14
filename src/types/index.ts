export type CategorySlug = string;

export type StoreMode = 'atelier_completo' | 'zapatos_jeans';

export type Gender = 'hombre' | 'mujer' | 'unisex';

export interface CategoryItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  filterType?: 'category' | 'gender';
  showInNavbar?: boolean;
  showInHome?: boolean;
  badge?: string;
}

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: CategorySlug;
  gender: Gender;
  images: string[];
  colors: ProductColor[];
  sizes: string[];
  stock: number;
  isNew?: boolean;
  isSale?: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  rating: number;
  reviewsCount: number;
  details: string[];
  composition: string;
  care: string[];
  sku: string;
}

export interface CartItem {
  id: string; // unique item id e.g. `${product.id}-${size}-${color.name}`
  product: Product;
  selectedSize: string;
  selectedColor: ProductColor;
  quantity: number;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  apartment?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export type OrderStatus = 'Pendiente' | 'Procesando' | 'Enviado' | 'Entregado' | 'Cancelado';

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  customer: ShippingAddress;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  status: OrderStatus;
  trackingNumber?: string;
  couponCode?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  phone?: string;
  avatarUrl?: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verified: boolean;
}

export interface Coupon {
  code: string;
  discountPercent: number;
  description: string;
  minOrder?: number;
  isActive?: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  comment: string;
  rating: number;
  product: string;
}

export interface SiteSettings {
  // Brand & Top Bar
  brandName: string;
  brandSubtitle: string;
  announcementText: string;
  announcementPromo: string;
  announcementEnabled: boolean;

  // Hero Section
  heroBadge: string;
  heroTitleLine1: string;
  heroTitleItalic: string;
  heroSubtitle: string;
  heroImage: string;
  heroPrimaryCtaText: string;
  heroPrimaryCtaHref: string;
  heroSecondaryCtaText: string;
  heroSecondaryCtaHref: string;

  // Editorial Lookbook Banner
  lookbookBadge: string;
  lookbookTitle: string;
  lookbookDescription: string;
  lookbookImage: string;
  lookbookCouponCode: string;
  lookbookCtaText: string;
  lookbookCtaHref: string;

  // Store & Shipping Rules
  freeShippingThreshold: number;
  standardShippingCost: number;
  expressShippingExtra: number;

  // Footer & Showrooms
  newsletterBadge: string;
  newsletterTitle: string;
  newsletterDescription: string;
  showroom1Title: string;
  showroom1Address: string;
  showroom2Title: string;
  showroom2Address: string;
  atelierHours: string;

  // Testimonials
  testimonials: Testimonial[];
}
