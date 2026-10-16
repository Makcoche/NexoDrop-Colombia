import React from 'react';
import { ColombiaFlag, VenezuelaFlag } from './CountryFlags';
import { CountryCode } from '../types';
import { Lock, LogIn, UserPlus, ArrowLeft, ShieldCheck } from 'lucide-react';

interface Props {
  moduleName: string;
  onOpenRegister: (country?: CountryCode) => void;
  onOpenLogin: () => void;
  onGoHome: () => void;
}

export const AuthGate: React.FC<Props> = ({
  moduleName,
  onOpenRegister,
  onOpenLogin,
  onGoHome,
}) => {
  return (
    <div className="max-w-2xl mx-auto my-12 bg-white rounded-3xl border border-zinc-200 p-8 sm:p-12 shadow-xl text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-xs">
        <Lock className="w-8 h-8" />
      </div>

      <div className="space-y-2 max-w-lg mx-auto">
        <span className="text-xs font-bold text-amber-800 bg-amber-100/70 border border-amber-200 px-3 py-1 rounded-full uppercase tracking-wider">
          Acceso Restringido a Miembros
        </span>
        <h2 className="text-2xl font-black text-zinc-900 tracking-tight">
          El módulo de {moduleName} es exclusivo para usuarios registrados
        </h2>
        <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
          Para proteger los precios mayoristas de los proveedores, inventario real y datos de clientes, debes iniciar
          sesión o registrarte como <strong>Vendedor</strong> o <strong>Proveedor</strong> en Colombia o Venezuela.
        </p>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto pt-2">
        <button
          onClick={() => onOpenRegister('CO')}
          className="flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
        >
          <ColombiaFlag className="w-4 h-3" />
          <span>Registrarme en Colombia</span>
        </button>

        <button
          onClick={() => onOpenRegister('VE')}
          className="flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer"
        >
          <VenezuelaFlag className="w-4 h-3" />
          <span>Registrarme en Venezuela</span>
        </button>
      </div>

      <div className="pt-4 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs">
        <button
          onClick={onOpenLogin}
          className="text-zinc-800 font-bold hover:text-emerald-700 flex items-center gap-1.5"
        >
          <LogIn className="w-4 h-4 text-emerald-600" />
          <span>¿Ya tienes cuenta o quieres probar una demo? Inicia sesión aquí</span>
        </button>
      </div>

      <button
        onClick={onGoHome}
        className="text-xs text-zinc-400 hover:text-zinc-700 font-medium inline-flex items-center gap-1"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Volver a la portada principal</span>
      </button>
    </div>
  );
};
