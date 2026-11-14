'use client';

import React, { useState } from 'react';
import { X, Ruler, CheckCircle } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SizeGuideModal({ isOpen, onClose }: SizeGuideModalProps) {
  const [activeTab, setActiveTab] = useState<'mujer' | 'hombre' | 'unisex'>('mujer');
  const [unit, setUnit] = useState<'cm' | 'in'>('cm');

  if (!isOpen) return null;

  const sizeData = {
    mujer: [
      { size: 'XS', eu: '34', chest: { cm: '80-84', in: '31-33' }, waist: { cm: '60-64', in: '23-25' }, hips: { cm: '86-90', in: '34-35' } },
      { size: 'S', eu: '36', chest: { cm: '84-88', in: '33-35' }, waist: { cm: '64-68', in: '25-27' }, hips: { cm: '90-94', in: '35-37' } },
      { size: 'M', eu: '38', chest: { cm: '88-92', in: '35-36' }, waist: { cm: '68-72', in: '27-28' }, hips: { cm: '94-98', in: '37-38' } },
      { size: 'L', eu: '40', chest: { cm: '92-98', in: '36-38' }, waist: { cm: '72-78', in: '28-31' }, hips: { cm: '98-104', in: '38-41' } },
      { size: 'XL', eu: '42', chest: { cm: '98-104', in: '38-41' }, waist: { cm: '78-84', in: '31-33' }, hips: { cm: '104-110', in: '41-43' } },
    ],
    hombre: [
      { size: 'S', eu: '46', chest: { cm: '90-94', in: '35-37' }, waist: { cm: '76-80', in: '30-31' }, hips: { cm: '92-96', in: '36-38' } },
      { size: 'M', eu: '48', chest: { cm: '94-98', in: '37-38' }, waist: { cm: '80-84', in: '31-33' }, hips: { cm: '96-100', in: '38-39' } },
      { size: 'L', eu: '50', chest: { cm: '98-102', in: '38-40' }, waist: { cm: '84-88', in: '33-35' }, hips: { cm: '100-104', in: '39-41' } },
      { size: 'XL', eu: '52', chest: { cm: '102-108', in: '40-42' }, waist: { cm: '88-94', in: '35-37' }, hips: { cm: '104-110', in: '41-43' } },
      { size: 'XXL', eu: '54', chest: { cm: '108-114', in: '42-45' }, waist: { cm: '94-100', in: '37-39' }, hips: { cm: '110-116', in: '43-45' } },
    ],
    unisex: [
      { size: 'XS', eu: '34-36', chest: { cm: '82-86', in: '32-34' }, waist: { cm: '64-70', in: '25-27' }, hips: { cm: '88-92', in: '34-36' } },
      { size: 'S', eu: '38-40', chest: { cm: '88-94', in: '34-37' }, waist: { cm: '72-78', in: '28-30' }, hips: { cm: '94-98', in: '37-38' } },
      { size: 'M', eu: '42-44', chest: { cm: '96-102', in: '37-40' }, waist: { cm: '80-86', in: '31-34' }, hips: { cm: '100-104', in: '39-41' } },
      { size: 'L', eu: '46-48', chest: { cm: '104-110', in: '41-43' }, waist: { cm: '88-94', in: '34-37' }, hips: { cm: '106-112', in: '41-44' } },
      { size: 'XL', eu: '50-52', chest: { cm: '112-118', in: '44-46' }, waist: { cm: '96-102', in: '38-40' }, hips: { cm: '114-120', in: '45-47' } },
    ],
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-sm border border-neutral-100 p-6 sm:p-8">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <Ruler className="w-5 h-5 text-neutral-800" />
              <h3 className="font-serif text-lg uppercase tracking-wider text-neutral-900 font-semibold">
                Guía de Tallas & Medidas
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-neutral-400 hover:text-black transition-colors"
              aria-label="Cerrar guía"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Controls: Category Tabs and Unit Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-6 mb-6">
            <div className="flex border border-neutral-200 rounded-sm overflow-hidden text-xs uppercase tracking-wider">
              {(['mujer', 'hombre', 'unisex'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 font-medium transition-colors ${
                    activeTab === tab
                      ? 'bg-neutral-900 text-white'
                      : 'bg-white text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-neutral-400">Unidad:</span>
              <div className="flex border border-neutral-200 rounded-sm overflow-hidden">
                <button
                  type="button"
                  onClick={() => setUnit('cm')}
                  className={`px-2.5 py-1 font-medium transition-colors ${
                    unit === 'cm' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-600'
                  }`}
                >
                  CM
                </button>
                <button
                  type="button"
                  onClick={() => setUnit('in')}
                  className={`px-2.5 py-1 font-medium transition-colors ${
                    unit === 'in' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-600'
                  }`}
                >
                  IN
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-neutral-100 rounded-sm mb-6">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#faf8f5] text-neutral-700 uppercase tracking-wider font-semibold border-b border-neutral-200">
                <tr>
                  <th className="py-3 px-4">Talla</th>
                  <th className="py-3 px-4">Equiv. EU</th>
                  <th className="py-3 px-4">Pecho ({unit})</th>
                  <th className="py-3 px-4">Cintura ({unit})</th>
                  <th className="py-3 px-4">Cadera ({unit})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-800">
                {sizeData[activeTab].map((row) => (
                  <tr key={row.size} className="hover:bg-neutral-50/70">
                    <td className="py-3 px-4 font-semibold text-neutral-900">{row.size}</td>
                    <td className="py-3 px-4 text-neutral-500">{row.eu}</td>
                    <td className="py-3 px-4">{row.chest[unit]}</td>
                    <td className="py-3 px-4">{row.waist[unit]}</td>
                    <td className="py-3 px-4">{row.hips[unit]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Measuring tips */}
          <div className="bg-[#faf8f5] p-4 rounded-sm text-xs text-neutral-600 space-y-2">
            <h4 className="font-semibold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-[#c5a880]" />
              Consejos del Atelier para acertar con tu talla:
            </h4>
            <p>
              • <strong>Pecho:</strong> Pasa la cinta métrica por la parte más prominente del busto manteniendo la cinta horizontal.
            </p>
            <p>
              • <strong>Cintura:</strong> Mide el contorno de la parte más estrecha de la cintura, habitualmente sobre el ombligo.
            </p>
            <p>
              • <strong>Ajuste:</strong> Para un corte relajado o silueta oversize contemporánea, opta por tu talla habitual; para un ajuste ceñido al cuerpo, escoge una talla menos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
