# AURELIA ATELIER — E-Commerce de Moda & Alta Costura Minimalista

Una tienda online de nivel profesional para una firma de moda premium, inspirada en la experiencia de compra de referentes globales como **Zara Studio, Massimo Dutti, Toteme, COS y Jacquemus**.

Diseñada bajo los más altos estándares de UI/UX, arquitectura modular en **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, y preparada para persistencia en **Supabase / PostgreSQL** y pasarelas de pago con **Stripe**.

---

## 🌟 Características Principales

### 1. Diseño y Estética Visual
- **Identidad Minimalista de Lujo**: Paleta cromática en blanco puro, marfil/arena (`#faf8f5`), negro azabache y acento dorado atelier (`#c5a880`).
- **Fotografía Editorial en Alta Resolución**: Modelos y prendas con vistas múltiples (estudio y lookbook) y efectos hover continuos.
- **Micro-interacciones y Tipografía**: Encabezados serif clásicos combinados con tipografía sans geométrica ultra legible.
- **100% Responsive**: Experiencia optimizada para smartphones, tablets y pantallas de escritorio panorámicas.

### 2. Página Principal (Home)
- **Top Announcement Bar**: Información de envíos express y cupón promocional activo (`AURELIA15`).
- **Header con Navegación Multinivel**: Menú desplegable por categorías, logo de autor, selector de rol cliente/admin, buscador modal instantáneo, favoritos y cesta con contador en tiempo real.
- **Hero de Gran Impacto Editorial**: Fotografía a pantalla completa con CTA "Comprar Ahora" y "Ver Novedades".
- **Propuesta de Valor (Trust Badges)**: Envíos express internacionales, materiales nobles con certificado de origen, 30 días de devoluciones gratuitas y pasarela de pago seguro.
- **Categorías Destacadas**: Tarjetas visuales con zoom interactivo (Mujer, Hombre, Chaquetas & Abrigos).
- **Más Vendidos con Pestañas Interactivas**: Filtro dinámico entre Todos, Mujer, Hombre y Unisex.
- **Lookbook Banner**: Promoción con código promocional y diseño editorial.
- **Novedades de Temporada**: Selección de las últimas incorporaciones.
- **Testimonios de Clientes Verificados**: Reseñas de compradores VIP con puntuación por estrellas.
- **Suscripción al Club Atelier**: Formulario con validación en vivo y descuento de bienvenida (`BIENVENIDA10`).
- **Footer Completo**: Enlaces de navegación, políticas, showrooms internacionales (París, Madrid) y sellos de pago.

### 3. Catálogo de Productos y Filtros Multifacéticos (`/shop`)
- **Filtros en Tiempo Real**:
  - Por categoría (Chaquetas, Vestidos, Pantalones, Camisetas, Jeans, Sudaderas, Accesorios).
  - Por género (Mujer, Hombre, Unisex).
  - Por rango de precio dinámico ($50 a $500).
  - Por tallas (XS, S, M, L, XL, XXL, Única).
  - Por paleta de colores (Negro, Blanco, Beige, Gris, Azul).
  - Solo ofertas con descuento y solo prendas en stock.
- **Ordenamiento Inteligente**: Por recomendados, menor/mayor precio, novedades, más vendidos y mejor valorados.
- **Conmutador de Cuadrícula**: Selector entre 2, 3 y 4 columnas.
- **Añadir Rápido desde la Cuadrícula**: Selector de talla al pasar el cursor sobre la foto del producto.

### 4. Página de Detalle de Prenda (`/producto/[slug]`)
- **Galería Interactiva**: Miniaturas multi-ángulo y zoom suave en la imagen principal.
- **Selector de Colores y Muestras Reales**: Con indicación textual del acabado.
- **Selector de Tallas con Alertas de Stock**: Cantidad dinámica de existencias.
- **Modal de Guía de Tallas Interactiva**: Tabla completa de medidas para mujer, hombre y unisex en centímetros (cm) y pulgadas (in) con consejos de medición.
- **Botones Duales**: "Añadir a la Cesta" y "Comprar Ahora" (acceso directo al checkout).
- **Acordeones Desplegables**: Composición de tejidos, consejos de lavado y condiciones de envío y devolución.
- **Prendas Relacionadas**: Sugerencias para "Completa el Look".

### 5. Cesta de Compra (`CartDrawer` y `/carrito`)
- **Drawer Deslizante**: Accesible desde cualquier rincón de la tienda sin interrumpir la navegación.
- **Medidor de Envío Gratuito**: Barra de progreso hacia los $100 requeridos para el envío sin coste.
- **Control de Unidades y Eliminación**: Modificación de cantidades (+ / -) con actualización automática de subtotales.
- **Cupones de Descuento Reales**:
  - `AURELIA15` (15% de descuento en pedidos superiores a $50)
  - `BIENVENIDA10` (10% de bienvenida)
  - `VIP20` (20% para socios)
- **Persistencia Local**: El contenido de la cesta se conserva aunque el cliente recargue la página o cierre el navegador.

### 6. Checkout y Pasarela de Pago (`/checkout`)
- **Proceso en 3 Pasos Clave**:
  1. Datos de Contacto y Envío (validación de nombre, correo, teléfono, dirección, ciudad, código postal y país).
  2. Método de Envío (Courier Express DHL/GLS en 24/48h).
  3. Método de Pago (Tarjeta de Crédito, PayPal, Apple Pay o Transferencia bancaria).
- **Confirmación con Generación de Pedido Real**: Código de orden `#ORD-XXXXX` guardado en la base de datos/estado.
- **Pantalla de Éxito (`/checkout/success`)**: Animación de confeti, desglose de prendas, fecha estimada de entrega y botón para imprimir el comprobante fiscal.

### 7. Panel Administrativo Completo (`/admin`)
- **Métricas y KPIs**: Ingresos totales, número de pedidos, ticket medio (AOV) y prendas en inventario.
- **Gestión de Catálogo**:
  - Modal para agregar nuevos productos con subida de imagen/URL, selector de categoría, género, tallas, color, precio y precio en oferta.
  - Edición en tiempo real de cualquier prenda existente.
  - Eliminación con diálogo de confirmación.
- **Gestión de Pedidos**: Tabla de compras con cambio inmediato de estado (`Pendiente` → `Procesando` → `Enviado` → `Entregado` → `Cancelado`).
- **Control de Inventario**: Alertas automáticas para prendas con stock bajo (≤ 10 uds) y botones de ajuste rápido de unidades (+5 / -1).
- **Directorio de Clientes VIP**: Registro de compradores con historial y gasto acumulado.

### 8. Autenticación y Perfil de Usuario (`/login`, `/registro`, `/perfil`)
- Inicio de sesión y registro con validación.
- **Accesos Demo en 1 Clic**: Botones preconfigurados "Demo Cliente" y "Demo Administrador" para agilizar pruebas.
- Perfil con seguimiento visual en 4 etapas del pedido (Recibido → Procesando → Enviado → Entregado).
- Libreta de direcciones de entrega y edición de datos de contacto.

---

## 🛠️ Tecnologías Empleadas

- **Framework**: Next.js 16 (App Router con Turbopack)
- **Biblioteca UI**: React 19
- **Tipado**: TypeScript 5
- **Estilos**: Tailwind CSS 4 con utilidades de lujo y scrollbars personalizados
- **Iconografía**: Lucide React
- **Base de Datos y Auth**: Supabase (@supabase/supabase-js) + PostgreSQL con Row Level Security (RLS)
- **Efectos y Celebraciones**: Canvas-confetti

---

## 🚀 Instalación y Puesta en Marcha

### Prerrequisitos
- Node.js 18+ instalado en tu sistema.
- Gestor de paquetes `npm` (o `yarn` / `pnpm`).

### Pasos:

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Configurar variables de entorno**:
   Copia el archivo de ejemplo:
   ```bash
   cp .env.example .env.local
   ```
   *(Nota: La tienda funciona al 100% de manera autónoma con su motor de datos local incluso antes de conectar claves de Supabase o Stripe).*

3. **Iniciar servidor de desarrollo**:
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

4. **Compilar para producción**:
   ```bash
   npm run build
   npm run start
   ```

---

## 🗄️ Configuración de Supabase (Opcional para persistencia en nube)

1. Crea un proyecto en [Supabase](https://supabase.com).
2. Dirígete al **SQL Editor** en tu panel de Supabase.
3. Copia y ejecuta todo el contenido del archivo `supabase/schema.sql` incluido en este repositorio.
4. Obtén tu URL de proyecto y tu clave `anon` pública desde **Project Settings > API**.
5. Añádelas a tu archivo `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-publica
   ```

---

## 💳 Conexión de Stripe (Pasarela de Pagos)

1. En tu panel de desarrolladores de [Stripe](https://dashboard.stripe.com/test/apikeys), obtén tus claves de prueba:
   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   ```
2. La ruta `/api/checkout/stripe` ya se encuentra implementada y preparada para recibir payloads de pedidos.

---

## 📁 Estructura del Código

```
WEB1/
├── src/
│   ├── app/                      # Rutas y páginas de Next.js App Router
│   │   ├── page.tsx              # Página principal (Home)
│   │   ├── layout.tsx            # Layout global con Providers, Navbar y Footer
│   │   ├── globals.css           # Estilos base y tokens visuales de Tailwind
│   │   ├── shop/                 # Catálogo general con filtros dinámicos
│   │   ├── producto/[slug]/      # Detalle individual de producto y guía de tallas
│   │   ├── carrito/              # Cesta de compra detallada
│   │   ├── checkout/             # Proceso de pago en 3 pasos
│   │   │   └── success/          # Confirmación de pedido con confeti
│   │   ├── favoritos/            # Lista de prendas deseadas
│   │   ├── login/                # Inicio de sesión con accesos directos
│   │   ├── registro/             # Registro de clientes
│   │   ├── perfil/               # Panel de cliente y tracking de envíos
│   │   ├── admin/                # Panel de control administrativo
│   │   ├── not-found.tsx         # Página 404 personalizada
│   │   └── api/
│   │       └── checkout/stripe/  # Endpoint de pasarela de pago
│   ├── components/
│   │   ├── layout/               # Navbar, Footer y anuncios
│   │   ├── product/              # ProductCard y SizeGuideModal
│   │   ├── cart/                 # CartDrawer deslizable
│   │   └── search/               # SearchModal interactivo
│   ├── context/                  # Gestores de estado React Context
│   │   ├── CartContext.tsx       # Carrito, cupones y cálculos
│   │   ├── WishlistContext.tsx   # Favoritos
│   │   ├── StoreContext.tsx      # Base de productos y pedidos
│   │   └── AuthContext.tsx       # Sesión de usuario y cambio de roles
│   ├── data/
│   │   └── products.ts           # Catálogo inicial de 12 prendas de lujo
│   ├── lib/
│   │   └── supabase.ts           # Cliente Supabase con fallback local
│   └── types/
│       └── index.ts              # Definiciones TypeScript de datos
├── supabase/
│   └── schema.sql                # Esquema SQL completo para Supabase
├── .env.example                  # Plantilla de variables de entorno
└── package.json
```

---

## 👑 Credenciales de Demostración para Pruebas

- **Cliente**: `camila@aurelia.com` (o cualquier correo)
- **Administrador**: `admin@aurelia.com` (o pulsa el botón **"Modo Admin"** en el header para alternar roles en 1 clic).
- **Cupones activos**:
  - `AURELIA15`: -15% en compras superiores a $50.
  - `BIENVENIDA10`: -10% de bienvenida sin importe mínimo.
  - `VIP20`: -20% en pedidos superiores a $150.
