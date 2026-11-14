'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Package, 
  MapPin, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  Calendar, 
  ExternalLink,
  CheckCircle,
  Truck,
  Clock
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/context/StoreContext';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, isAdmin, updateProfile } = useAuth();
  const { orders } = useStore();

  const [activeTab, setActiveTab] = useState<'pedidos' | 'direcciones' | 'ajustes'>('pedidos');
  const [profileName, setProfileName] = useState(user?.name || 'Camila Valmont');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '+34 622 110 998');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center space-y-4">
        <h2 className="font-serif text-2xl text-neutral-800">Inicia sesión para ver tu perfil</h2>
        <Link
          href="/login"
          className="px-6 py-3 bg-neutral-900 text-white text-xs uppercase tracking-widest font-semibold rounded-xs"
        >
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name: profileName, phone: profilePhone });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="bg-[#faf8f5] min-h-screen py-10 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Profile Header */}
        <div className="bg-white p-6 sm:p-8 rounded-sm border border-neutral-200 shadow-xs mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-neutral-900 text-white flex items-center justify-center font-serif text-2xl font-light">
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl text-neutral-900 font-normal">
                  {user.name}
                </h1>
                {isAdmin && (
                  <span className="text-[10px] uppercase tracking-wider bg-[#c5a880] text-black font-semibold px-2 py-0.5 rounded">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-500">{user.email}</p>
              <p className="text-[11px] text-neutral-400 mt-1">Miembro del Club Atelier desde 2026</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                href="/admin"
                className="px-4 py-2.5 bg-neutral-900 hover:bg-black text-white text-xs uppercase tracking-widest font-semibold rounded-xs transition-colors flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-[#c5a880]" />
                <span>Panel Admin</span>
              </Link>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2.5 border border-neutral-300 hover:border-black text-neutral-700 text-xs uppercase tracking-widest font-semibold rounded-xs transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-200 mb-8 overflow-x-auto text-xs uppercase tracking-wider font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('pedidos')}
            className={`pb-3 mr-8 flex items-center gap-2 transition-colors shrink-0 ${
              activeTab === 'pedidos'
                ? 'border-b-2 border-black text-black'
                : 'text-neutral-400 hover:text-black'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Mis Pedidos ({orders.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('direcciones')}
            className={`pb-3 mr-8 flex items-center gap-2 transition-colors shrink-0 ${
              activeTab === 'direcciones'
                ? 'border-b-2 border-black text-black'
                : 'text-neutral-400 hover:text-black'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Direcciones Guardadas</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ajustes')}
            className={`pb-3 flex items-center gap-2 transition-colors shrink-0 ${
              activeTab === 'ajustes'
                ? 'border-b-2 border-black text-black'
                : 'text-neutral-400 hover:text-black'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Ajustes de Cuenta</span>
          </button>
        </div>

        {/* Tab 1: Orders History */}
        {activeTab === 'pedidos' && (
          <div className="space-y-6">
            {orders.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-sm border border-neutral-200 space-y-3">
                <Package className="w-10 h-10 text-neutral-400 mx-auto stroke-[1.2]" />
                <h3 className="font-serif text-lg text-neutral-800">No tienes pedidos registrados</h3>
                <p className="text-xs text-neutral-500">
                  Tus compras aparecerán aquí para que puedas rastrear su estado en tiempo real.
                </p>
                <Link
                  href="/shop"
                  className="inline-block mt-3 px-6 py-2.5 bg-neutral-900 text-white text-xs uppercase tracking-widest font-semibold rounded-xs"
                >
                  Ir de Compras
                </Link>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white p-6 sm:p-8 rounded-sm border border-neutral-200 shadow-xs space-y-6"
                >
                  {/* Top Bar of Order Card */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-100 gap-3">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-serif text-lg font-semibold text-neutral-900">
                          {order.orderNumber}
                        </span>
                        <span
                          className={`text-[10px] uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full ${
                            order.status === 'Entregado'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : order.status === 'Enviado'
                              ? 'bg-sky-50 text-sky-700 border border-sky-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Realizado el {new Date(order.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <div className="text-right">
                        <span className="text-neutral-400 block text-[11px] uppercase tracking-wider">Total</span>
                        <span className="font-semibold text-neutral-900 text-base">${order.total}</span>
                      </div>
                      <Link
                        href={`/checkout/success?order=${order.orderNumber}`}
                        className="px-3.5 py-2 border border-neutral-200 hover:border-black text-neutral-800 text-xs font-semibold rounded-xs transition-colors flex items-center gap-1.5"
                      >
                        <span>Ver Recibo</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Status Timeline */}
                  <div className="py-2">
                    <div className="grid grid-cols-4 gap-2 text-center text-[10px] uppercase tracking-wider font-semibold">
                      <div className="text-emerald-700">✓ Recibido</div>
                      <div className={order.status !== 'Pendiente' ? 'text-emerald-700' : 'text-neutral-300'}>
                        {order.status !== 'Pendiente' ? '✓ ' : ''}Procesando
                      </div>
                      <div className={order.status === 'Enviado' || order.status === 'Entregado' ? 'text-emerald-700' : 'text-neutral-300'}>
                        {order.status === 'Enviado' || order.status === 'Entregado' ? '✓ ' : ''}Enviado
                      </div>
                      <div className={order.status === 'Entregado' ? 'text-emerald-700' : 'text-neutral-300'}>
                        {order.status === 'Entregado' ? '✓ ' : ''}Entregado
                      </div>
                    </div>
                    <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden mt-2">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                        style={{
                          width:
                            order.status === 'Entregado'
                              ? '100%'
                              : order.status === 'Enviado'
                              ? '75%'
                              : order.status === 'Procesando'
                              ? '50%'
                              : '25%',
                        }}
                      />
                    </div>
                  </div>

                  {/* Items in this order */}
                  <div className="divide-y divide-neutral-100 border border-neutral-100 rounded-xs overflow-hidden">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="p-3 bg-neutral-50/50 flex items-center justify-between text-xs">
                        <div>
                          <h4 className="font-medium text-neutral-900">{item.product.name}</h4>
                          <span className="text-[11px] text-neutral-500">
                            Talla: {item.selectedSize} • Color: {item.selectedColor.name} • Cantidad: {item.quantity}
                          </span>
                        </div>
                        <span className="font-semibold text-neutral-900">
                          ${item.product.price * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Destination info */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-500 pt-2 border-t border-neutral-100">
                    <div>
                      <span>Destino: </span>
                      <strong className="text-neutral-800">
                        {order.customer.address}, {order.customer.city}
                      </strong>
                    </div>
                    {order.trackingNumber && (
                      <div>
                        <span>Tracking: </span>
                        <strong className="text-neutral-800 font-mono">{order.trackingNumber}</strong>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Saved Addresses */}
        {activeTab === 'direcciones' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-sm border-2 border-neutral-900 shadow-xs space-y-3 relative">
              <span className="absolute top-4 right-4 bg-neutral-900 text-white text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-semibold">
                Predeterminada
              </span>
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-neutral-900">
                <MapPin className="w-4 h-4 text-[#c5a880]" />
                <span>Dirección Principal de Entrega</span>
              </div>
              <div className="text-xs text-neutral-600 space-y-1 pt-1">
                <p className="font-semibold text-neutral-900">{user.name}</p>
                <p>Calle Velázquez 48, 3º Izquierda</p>
                <p>Madrid, 28001</p>
                <p>España</p>
                <p className="pt-2 text-[11px] text-neutral-400">Tel: +34 612 345 678</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Account Settings */}
        {activeTab === 'ajustes' && (
          <div className="bg-white p-6 sm:p-8 rounded-sm border border-neutral-200 shadow-xs max-w-xl">
            <h3 className="font-serif text-lg text-neutral-900 uppercase tracking-wider font-semibold pb-4 border-b border-neutral-100 mb-6">
              Datos Personales
            </h3>

            {savedSuccess && (
              <div className="bg-emerald-50 text-emerald-800 text-xs p-3 rounded mb-4 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Datos actualizados con éxito.</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-600 font-semibold mb-1.5">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xs focus:bg-white focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-600 font-semibold mb-1.5">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full text-xs px-3 py-2.5 bg-neutral-100 border border-neutral-200 rounded-xs text-neutral-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-600 font-semibold mb-1.5">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xs focus:bg-white focus:outline-none focus:border-black"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3 bg-neutral-900 hover:bg-black text-white text-xs uppercase tracking-widest font-semibold transition-colors rounded-xs shadow-md mt-2"
              >
                Guardar Cambios
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
