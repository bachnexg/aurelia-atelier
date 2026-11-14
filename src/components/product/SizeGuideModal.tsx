'use client';

import React, { useState } from 'react';
import { X, Ruler, CheckCircle } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SizeGuideModal({ isOpen, onClose }: SizeGuideModalProps) {
  const [activeTab, setActiveTab] = useState<'zapatos' | 'jeans' | 'mujer' | 'hombre'>('zapatos');
  const [unit, setUnit] = useState<'cm' | 'in'>('cm');

  if (!isOpen) return null;

  const shoeSizes = [
    { eu: '36', us: '6 W / 4.5 M', footCm: '23.0 cm', footIn: '9.0 in' },
    { eu: '37', us: '6.5 W / 5 M', footCm: '23.6 cm', footIn: '9.3 in' },
    { eu: '38', us: '7.5 W / 6 M', footCm: '24.3 cm', footIn: '9.6 in' },
    { eu: '39', us: '8.5 W / 6.5 M', footCm: '25.0 cm', footIn: '9.8 in' },
    { eu: '40', us: '9 W / 7 M', footCm: '25.6 cm', footIn: '10.1 in' },
    { eu: '41', us: '10 W / 8 M', footCm: '26.3 cm', footIn: '10.4 in' },
    { eu: '42', us: '9 M', footCm: '27.0 cm', footIn: '10.6 in' },
    { eu: '43', us: '10 M', footCm: '27.6 cm', footIn: '10.9 in' },
    { eu: '44', us: '11 M', footCm: '28.3 cm', footIn: '11.1 in' },
    { eu: '45', us: '12 M', footCm: '29.0 cm', footIn: '11.4 in' },
  ];

  const jeanSizes = [
    { size: '26', eu: '34 EU', waist: { cm: '66-69', in: '26-27' }, hips: { cm: '90-93', in: '35.5-36.5' } },
    { size: '28', eu: '36-38 EU', waist: { cm: '71-74', in: '28-29' }, hips: { cm: '94-97', in: '37-38' } },
    { size: '30', eu: '38-40 EU', waist: { cm: '76-79', in: '30-31' }, hips: { cm: '98-101', in: '38.5-40' } },
    { size: '32', eu: '42 EU', waist: { cm: '81-84', in: '32-33' }, hips: { cm: '102-105', in: '40-41.5' } },
    { size: '34', eu: '44 EU', waist: { cm: '86-90', in: '34-35' }, hips: { cm: '106-110', in: '42-43.5' } },
    { size: '36', eu: '46 EU', waist: { cm: '91-96', in: '36-38' }, hips: { cm: '111-115', in: '44-45.5' } },
  ];

  const apparelSizes = {
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
                Guía de Tallas • Calzado, Jeans & Sastrería
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
              {(['zapatos', 'jeans', 'mujer', 'hombre'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-2 font-medium transition-colors ${
                    activeTab === tab
                      ? 'bg-neutral-900 text-white'
                      : 'bg-white text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  {tab === 'zapatos' ? 'Zapatos' : tab === 'jeans' ? 'Jeans' : tab}
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
            {activeTab === 'zapatos' ? (
              <table className="w-full text-xs text-left">
                <thead className="bg-[#faf8f5] text-neutral-700 uppercase tracking-wider font-semibold border-b border-neutral-200">
                  <tr>
                    <th className="py-3 px-4">Talla EU</th>
                    <th className="py-3 px-4">Equiv. US</th>
                    <th className="py-3 px-4">Largo del Pie ({unit.toUpperCase()})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-800">
                  {shoeSizes.map((row) => (
                    <tr key={row.eu} className="hover:bg-neutral-50/70">
                      <td className="py-2.5 px-4 font-semibold text-neutral-900">EU {row.eu}</td>
                      <td className="py-2.5 px-4 text-neutral-500">{row.us}</td>
                      <td className="py-2.5 px-4">{unit === 'cm' ? row.footCm : row.footIn}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : activeTab === 'jeans' ? (
              <table className="w-full text-xs text-left">
                <thead className="bg-[#faf8f5] text-neutral-700 uppercase tracking-wider font-semibold border-b border-neutral-200">
                  <tr>
                    <th className="py-3 px-4">Talla Jean (W)</th>
                    <th className="py-3 px-4">Equiv. EU</th>
                    <th className="py-3 px-4">Cintura ({unit})</th>
                    <th className="py-3 px-4">Cadera ({unit})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-800">
                  {jeanSizes.map((row) => (
                    <tr key={row.size} className="hover:bg-neutral-50/70">
                      <td className="py-3 px-4 font-semibold text-neutral-900">W{row.size}</td>
                      <td className="py-3 px-4 text-neutral-500">{row.eu}</td>
                      <td className="py-3 px-4">{row.waist[unit]}</td>
                      <td className="py-3 px-4">{row.hips[unit]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
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
                  {apparelSizes[activeTab].map((row) => (
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
            )}
          </div>

          {/* Measuring tips */}
          <div className="bg-[#faf8f5] p-4 rounded-sm text-xs text-neutral-600 space-y-2">
            <h4 className="font-semibold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-[#c5a880]" />
              Consejos del Atelier para acertar con tu talla:
            </h4>
            <p>
              • <strong>Calzado:</strong> Mide desde el talón hasta la punta del dedo más largo apoyando el pie sobre una hoja de papel. Si estás entre dos tallas en botines Goodyear, elige tu talla habitual.
            </p>
            <p>
              • <strong>Pantalones Jean (Denim):</strong> Las tallas W26–W36 corresponden al contorno de cintura en pulgadas. El denim selvedge 100% algodón cede ligeramente (~0.5 cm) tras los primeros usos para adaptarse a tu silueta.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
