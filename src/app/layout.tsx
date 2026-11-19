import type { Metadata } from 'next';
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { StoreProvider } from '@/context/StoreContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { AuthProvider } from '@/context/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'VALISBE | Tienda Online de Jeans, Calzado & Moda de Autor',
  description: 'Descubre la nueva colección de VALISBE: pantalones jean de corte escultural, línea Plus Size, calzado en piel y prendas atemporales.',
  keywords: ['Valisbe', 'jeans', 'pantalones jean', 'wide leg', 'levantacola', 'zapatos', 'moda de lujo'],
  icons: {
    icon: '/images/logo-monogram.png',
    apple: '/images/logoPrincipal.jpg',
  },
  openGraph: {
    title: 'VALISBE | Colección Oficial de Jeans & Moda',
    description: 'Cortes que esculpen la silueta y diseño contemporáneo. Envíos express.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${playfair.variable} ${jakarta.variable} h-full`}>
      <body className="min-h-screen flex flex-col bg-white text-neutral-900 antialiased selection:bg-neutral-900 selection:text-white">
        <StoreProvider>
          <AuthProvider>
            <WishlistProvider>
              <CartProvider>
                <Navbar />
                <main className="flex-1">
                  {children}
                </main>
                <Footer />
                <CartDrawer />
              </CartProvider>
            </WishlistProvider>
          </AuthProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
