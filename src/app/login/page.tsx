'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      if (email.includes('admin')) {
        router.push('/admin');
      } else {
        router.push('/perfil');
      }
    } else {
      setError(res.message || 'Error al iniciar sesión.');
      setLoading(false);
    }
  };

  const handleQuickDemo = (type: 'customer' | 'admin') => {
    if (type === 'admin') {
      login('admin@aurelia.com', 'admin123');
      router.push('/admin');
    } else {
      login('camila@aurelia.com', 'password123');
      router.push('/perfil');
    }
  };

  return (
    <div className="bg-[#faf8f5] min-h-[80vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-sm border border-neutral-200 shadow-xl space-y-8">
        
        <div className="text-center space-y-2">
          <span className="text-[11px] uppercase tracking-[0.3em] text-[#c5a880] font-semibold block">
            Acceso Privado
          </span>
          <h1 className="font-serif text-3xl text-neutral-900 font-normal">
            Iniciar Sesión
          </h1>
          <p className="text-xs text-neutral-500">
            Ingresa a tu cuenta de Aurelia Atelier para gestionar tus pedidos y direcciones.
          </p>
        </div>

        {/* Quick Demo Credentials Helper */}
        <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xs space-y-2 text-xs">
          <div className="flex items-center gap-1.5 text-neutral-700 font-semibold uppercase tracking-wider text-[10px]">
            <UserCheck className="w-3.5 h-3.5 text-[#c5a880]" />
            <span>Acceso rápido de prueba (1 clic):</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('customer')}
              className="py-1.5 px-2 bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-800 text-[11px] rounded transition-colors font-medium"
            >
              Demo Cliente
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="py-1.5 px-2 bg-neutral-900 hover:bg-black text-white text-[11px] rounded transition-colors font-medium"
            >
              Demo Administrador
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-700 text-xs p-3 rounded border border-rose-200">
            {error}
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
              <button
                type="button"
                onClick={() => alert('Para restablecer tu contraseña, se ha enviado un correo con instrucciones (Modo Demostración).')}
                className="text-[11px] text-neutral-500 hover:text-black underline"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xs focus:bg-white focus:outline-none focus:border-black"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-neutral-900 hover:bg-black text-white text-xs uppercase tracking-widest font-semibold transition-all rounded-xs shadow-md flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <span>Iniciando sesión...</span>
            ) : (
              <>
                <span>Acceder a mi Cuenta</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-neutral-100 text-xs text-neutral-600">
          <span>¿Aún no tienes cuenta en el Atelier? </span>
          <Link href="/registro" className="font-semibold text-black hover:underline uppercase tracking-wider">
            Registrarme
          </Link>
        </div>

      </div>
    </div>
  );
}
