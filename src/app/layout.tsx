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
  title: 'AURELIA ATELIER | Tienda Online de Moda & Alta Costura Minimalista',
  description: 'Descubre la nueva colección de prendas atemporales confeccionadas en lana virgen, seda pura y algodón orgánico. Elegancia arquitectónica y lujo silencioso.',
  keywords: ['moda', 'ropa de lujo', 'minimalismo', 'sastrería', 'vestidos de seda', 'abrigos de lana'],
  openGraph: {
    title: 'AURELIA ATELIER | Colección de Moda Minimalista',
    description: 'Elegancia atemporal y diseño contemporáneo. Envíos express internacionales.',
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
