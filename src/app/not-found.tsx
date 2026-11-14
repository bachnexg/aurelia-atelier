import Link from 'next/link';
import { ArrowRight, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="bg-[#faf8f5] min-h-[75vh] flex items-center justify-center py-20 px-4 text-center">
      <div className="max-w-md space-y-6">
        <div className="w-16 h-16 bg-white border border-neutral-200 rounded-full flex items-center justify-center mx-auto text-neutral-400">
          <Compass className="w-8 h-8 stroke-[1.2]" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] uppercase tracking-[0.3em] text-[#c5a880] font-semibold block">
            Error 404 • Página No Encontrada
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-neutral-900 font-normal">
            Silueta Extraviada
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
            La página o prenda que buscas no está disponible o ha cambiado de ubicación en nuestro catálogo.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/shop"
            className="w-full sm:w-auto px-6 py-3.5 bg-neutral-900 hover:bg-black text-white text-xs uppercase tracking-widest font-semibold rounded-xs transition-colors flex items-center justify-center gap-2"
          >
            <span>Ver Catálogo Completo</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3.5 bg-white border border-neutral-300 text-neutral-800 text-xs uppercase tracking-widest font-semibold rounded-xs hover:border-black transition-colors"
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
