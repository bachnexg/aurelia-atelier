'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Por favor completa todos los campos.');
      return;
    }
    if (!agree) {
      setError('Debes aceptar los Términos y la Política de Privacidad.');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await register(name, email, password);
    if (res.success) {
      router.push('/perfil');
    } else {
      setError(res.message || 'Error al crear la cuenta.');
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#faf8f5] min-h-[80vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-sm border border-neutral-200 shadow-xl space-y-8">
        
        <div className="text-center space-y-2">
          <span className="text-[11px] uppercase tracking-[0.3em] text-[#c5a880] font-semibold block">
            Maison VALISBE
          </span>
          <h1 className="font-serif text-3xl text-neutral-900 font-normal">
            Crear Cuenta
          </h1>
          <p className="text-xs text-neutral-500">
            Regístrate para disfrutar de beneficios exclusivos, acceso a ventas privadas y seguimiento en vivo de tus pedidos.
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-700 text-xs p-3 rounded border border-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-700 font-semibold mb-1.5">
              Nombre Completo
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Camila Valmont"
                className="w-full text-xs pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xs focus:bg-white focus:outline-none focus:border-black"
              />
            </div>
          </div>

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
            <label className="block text-xs uppercase tracking-wider text-neutral-700 font-semibold mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="w-full text-xs pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xs focus:bg-white focus:outline-none focus:border-black"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-neutral-600 select-none">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-neutral-900 rounded"
              />
              <span>
                Acepto los Términos de Servicio y la Política de Privacidad de VALISBE.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-neutral-900 hover:bg-black text-white text-xs uppercase tracking-widest font-semibold transition-all rounded-xs shadow-md flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <span>Creando cuenta...</span>
            ) : (
              <>
                <span>Completar Registro</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-neutral-100 text-xs text-neutral-600">
          <span>¿Ya tienes una cuenta registrada? </span>
          <Link href="/login" className="font-semibold text-black hover:underline uppercase tracking-wider">
            Iniciar Sesión
          </Link>
        </div>

      </div>
    </div>
  );
}
