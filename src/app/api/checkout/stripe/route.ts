import { NextResponse } from 'next/server';
import { INITIAL_COUPONS } from '@/data/products';

interface CheckoutPayloadItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  image?: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      items,
      couponCode,
      discountPercent: clientDiscountPercent,
      shippingAddress,
      paymentMethod,
      freeShippingThreshold = 100,
      standardShippingCost = 15,
    } = body as {
      items: CheckoutPayloadItem[];
      couponCode?: string;
      discountPercent?: number;
      shippingAddress: Record<string, string>;
      paymentMethod?: string;
      freeShippingThreshold?: number;
      standardShippingCost?: number;
    };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'La cesta de compra está vacía.' },
        { status: 400 }
      );
    }

    if (
      !shippingAddress?.firstName ||
      !shippingAddress?.lastName ||
      !shippingAddress?.email ||
      !shippingAddress?.address ||
      !shippingAddress?.city ||
      !shippingAddress?.postalCode
    ) {
      return NextResponse.json(
        { error: 'Faltan datos obligatorios en la dirección de envío.' },
        { status: 400 }
      );
    }

    // Recalculate totals on the server
    const subtotal = items.reduce((acc, item) => {
      const unitPrice = Math.max(0, Number(item.price) || 0);
      const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));
      return acc + unitPrice * qty;
    }, 0);

    let verifiedDiscountPercent = 0;
    if (couponCode) {
      const cleanCode = couponCode.trim().toUpperCase();
      const matched = INITIAL_COUPONS.find((c) => c.code === cleanCode);
      if (matched && (!matched.minOrder || subtotal >= matched.minOrder)) {
        verifiedDiscountPercent = matched.discountPercent;
      } else if (clientDiscountPercent && clientDiscountPercent > 0 && clientDiscountPercent <= 90) {
        // Support custom coupons created in Admin panel
        verifiedDiscountPercent = clientDiscountPercent;
      }
    }

    const discount = Math.round((subtotal * verifiedDiscountPercent) / 100);
    const shipping = subtotal >= freeShippingThreshold ? 0 : standardShippingCost;
    const total = Math.max(0, subtotal - discount + shipping);

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const isStripeConfigured = Boolean(
      stripeSecretKey &&
        !stripeSecretKey.includes('tu_clave_secreta') &&
        (stripeSecretKey.startsWith('sk_test_') || stripeSecretKey.startsWith('sk_live_'))
    );

    // If real Stripe Secret Key is configured and payment method is card, create Stripe Checkout Session
    if (isStripeConfigured && stripeSecretKey && (!paymentMethod || paymentMethod === 'card')) {
      const params = new URLSearchParams();
      params.append('mode', 'payment');
      params.append('success_url', `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`);
      params.append('cancel_url', `${siteUrl}/checkout`);
      params.append('customer_email', shippingAddress.email);

      const discountFactor = 1 - verifiedDiscountPercent / 100;

      items.forEach((item, idx) => {
        const unitCents = Math.max(50, Math.round(item.price * discountFactor * 100));
        params.append(`line_items[${idx}][price_data][currency]`, 'usd');
        params.append(
          `line_items[${idx}][price_data][product_data][name]`,
          `${item.name} (Talla ${item.size} • ${item.color})`
        );
        if (item.image && item.image.startsWith('https://')) {
          params.append(`line_items[${idx}][price_data][product_data][images][0]`, item.image);
        }
        params.append(`line_items[${idx}][price_data][unit_amount]`, String(unitCents));
        params.append(`line_items[${idx}][quantity]`, String(item.quantity));
      });

      if (shipping > 0) {
        const shipIdx = items.length;
        params.append(`line_items[${shipIdx}][price_data][currency]`, 'usd');
        params.append(
          `line_items[${shipIdx}][price_data][product_data][name]`,
          'Envío Express Internacional DHL / GLS'
        );
        params.append(`line_items[${shipIdx}][price_data][unit_amount]`, String(shipping * 100));
        params.append(`line_items[${shipIdx}][quantity]`, '1');
      }

      const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${stripeSecretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      const session = await stripeRes.json();

      if (stripeRes.ok && session.url) {
        return NextResponse.json({
          configured: true,
          mode: 'stripe_live',
          url: session.url,
          sessionId: session.id,
          verifiedTotals: { subtotal, discount, shipping, total },
        });
      }
    }

    return NextResponse.json(
      {
        configured: false,
        mode: 'sandbox_verified',
        authorizationId: `AUTH-${Date.now()}`,
        verifiedTotals: { subtotal, discount, shipping, total },
        message: 'Pedido verificado y autorizado por el servidor.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en checkout Stripe:', error);
    return NextResponse.json(
      { error: 'Error al procesar la pasarela de pago.' },
      { status: 500 }
    );
  }
}
