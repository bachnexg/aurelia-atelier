import { NextResponse } from 'next/server';
import {
  checkRateLimit,
  recordFailedAttempt,
  clearFailedAttempts,
  verifyAdminCredentials,
  signSessionToken,
  SESSION_COOKIE_NAME,
} from '@/lib/auth-security';

export async function POST(req: Request) {
  try {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'local-ip';

    const rateStatus = checkRateLimit(ip);
    if (!rateStatus.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Demasiados intentos fallidos. Por seguridad, tu acceso está bloqueado temporalmente. Intenta de nuevo en ${Math.ceil(
            (rateStatus.retryAfterSeconds || 60) / 60
          )} minutos.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const email = (body.email || '').toLowerCase().trim();
    const password = body.password || '';
    const name = body.name || '';

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Correo y contraseña obligatorios.' },
        { status: 400 }
      );
    }

    // Check if matches Admin Credentials
    const isAdminValid = verifyAdminCredentials(email, password);

    // Block any unauthorized attempt to use an "admin" email with a wrong password
    if (!isAdminValid && (email.includes('admin') || email === 'admin@aurelia-atelier.com')) {
      recordFailedAttempt(ip);
      return NextResponse.json(
        {
          success: false,
          message: 'Credenciales de administrador inválidas. El intento ha sido registrado.',
        },
        { status: 401 }
      );
    }

    if (!isAdminValid && password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: 'La contraseña debe tener al menos 6 caracteres.',
        },
        { status: 400 }
      );
    }

    clearFailedAttempts(ip);

    const sessionUser = isAdminValid
      ? {
          id: 'usr-master-admin',
          name: 'Director Ejecutivo • Aurelia Atelier',
          email,
          role: 'admin' as const,
          phone: '+34 910 000 001',
        }
      : {
          id: `usr-${Buffer.from(email).toString('hex').slice(0, 12)}`,
          name: name.trim() || email.split('@')[0] || 'Cliente Aurelia',
          email,
          role: 'customer' as const,
          phone: '+34 600 000 000',
        };

    const token = signSessionToken(sessionUser);

    const response = NextResponse.json({
      success: true,
      user: sessionUser,
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Auth login error:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor de autenticación.' },
      { status: 500 }
    );
  }
}
