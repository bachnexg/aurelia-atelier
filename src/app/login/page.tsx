'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, ArrowRight, ShieldCheck, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const redirectTo = searchParams.get('redirect');
  const reason = searchParams.get('reason');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor completa todos los campos.');
      return;
    }
    setLoading(true);
    setError(null);

    const res = await login(email, password);
    if (res.success) {
      if (redirectTo) {
        router.push(redirectTo);
      } else if (res.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/perfil');
      }
      router.refresh();
    } else {
      setError(res.message || 'Credenciales inválidas.');
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#faf8f5] min-h-[80vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-sm border border-neutral-200 shadow-xl space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.3em] text-[#c5a880] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Acceso Cifrado & Protegido</span>
          </div>
          <h1 className="font-serif text-3xl text-neutral-900 font-normal">
            Iniciar Sesión
          </h1>
          <p className="text-xs text-neutral-500">
            Ingresa tus credenciales de Aurelia Atelier para acceder a tu cuenta o consola administrativa.
          </p>
        </div>

        {reason === 'admin_required' && !error && (
          <div className="bg-amber-50 text-amber-800 text-xs p-3.5 rounded-xs border border-amber-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <span>
              La ruta solicitada requiere autenticación verificada de <strong>Administrador</strong>.
            </span>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 text-rose-700 text-xs p-3.5 rounded-xs border border-rose-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-700 font-semibold mb-1.5">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full text-xs pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xs focus:bg-white focus:outline-none focus:border-black"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs uppercase tracking-wider text-neutral-700 font-semibold">
                Contraseña
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full text-xs pl-9 pr-10 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xs focus:bg-white focus:outline-none focus:border-black"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-neutral-900 hover:bg-black text-white text-xs uppercase tracking-widest font-semibold transition-all rounded-xs shadow-md flex items-center justify-center gap-2 mt-4 disabled:opacity-60"
          >
            {loading ? (
              <span>Verificando credenciales...</span>
            ) : (
              <>
                <span>Acceder de Forma Segura</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-neutral-100 text-xs text-neutral-600">
          <span>¿Aún no tienes cuenta de cliente en el Atelier? </span>
          <Link
            href="/registro"
            className="font-semibold text-black hover:underline uppercase tracking-wider"
          >
            Registrarme
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center text-xs uppercase tracking-widest text-neutral-400">
          Cargando acceso seguro...
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
