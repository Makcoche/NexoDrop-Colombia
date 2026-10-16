import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ColombiaFlag, VenezuelaFlag } from './CountryFlags';
import { CountryCode, UserRole } from '../types';
import {
  X,
  LogIn,
  ShoppingBag,
  Truck,
  ShieldCheck,
  HeadphonesIcon,
  Mail,
  UserPlus,
  ArrowRight,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface Props {
  onClose: () => void;
  onOpenRegister: (country?: CountryCode) => void;
  onLoginSuccess: () => void;
}

export const LoginModal: React.FC<Props> = ({
  onClose,
  onOpenRegister,
  onLoginSuccess,
}) => {
  const { loginWithGoogle, selectDemoUser, registerNewUser } = useApp();

  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const demoAccounts = [
    {
      id: 'vendedor_col',
      title: 'Vendedor Colombia',
      subtitle: 'Carlos Gómez • Comercializadora El Triunfo (Bogotá)',
      flag: ColombiaFlag,
      country: 'CO' as CountryCode,
      role: 'vendedor' as UserRole,
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: ShoppingBag,
      user: {
        id: 'seller-col-01',
        nombre: 'Carlos Gómez (Vendedor CO)',
        correo: 'carlos.gomez@vendedorcolombia.co',
        telefono: '+57 310 987 6543',
        rol: 'vendedor' as UserRole,
        pais: 'CO' as CountryCode,
        nombre_negocio: 'Comercializadora El Triunfo',
        ciudad: 'Bogotá D.C.',
        estado: 'activo' as const,
        fecha_creacion: '2025-01-15T00:00:00Z',
      },
    },
    {
      id: 'vendedor_ven',
      title: 'Vendedor Venezuela',
      subtitle: 'María Rodríguez • Tienda Caracas Dropship (Caracas)',
      flag: VenezuelaFlag,
      country: 'VE' as CountryCode,
      role: 'vendedor' as UserRole,
      badge: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: ShoppingBag,
      user: {
        id: 'seller-ven-01',
        nombre: 'María Rodríguez (Vendedora VE)',
        correo: 'maria.rodriguez@vendedorvenezuela.com',
        telefono: '+58 412 901 2345',
        rol: 'vendedor' as UserRole,
        pais: 'VE' as CountryCode,
        nombre_negocio: 'Tienda Caracas Dropship',
        ciudad: 'Caracas, Distrito Capital',
        estado: 'activo' as const,
        fecha_creacion: '2025-01-20T00:00:00Z',
      },
    },
    {
      id: 'proveedor_col',
      title: 'Proveedor Mayorista Colombia',
      subtitle: 'Carlos Mario Henao • TecnoAndina SAS (Bodega Bogotá)',
      flag: ColombiaFlag,
      country: 'CO' as CountryCode,
      role: 'proveedor' as UserRole,
      badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      icon: Truck,
      user: {
        id: 'prov-col-01',
        nombre: 'Carlos Mario Henao (Proveedor CO)',
        correo: 'ventas@tecnoandina.co',
        telefono: '+57 312 458 9201',
        rol: 'proveedor' as UserRole,
        pais: 'CO' as CountryCode,
        nombre_negocio: 'TecnoAndina Mayorista SAS',
        ciudad: 'Bogotá D.C.',
        estado: 'activo' as const,
        fecha_creacion: '2025-01-10T08:00:00Z',
      },
    },
    {
      id: 'proveedor_ven',
      title: 'Proveedor Mayorista Venezuela',
      subtitle: 'Alejandro Ávila • Mayorista El Ávila C.A. (Caracas)',
      flag: VenezuelaFlag,
      country: 'VE' as CountryCode,
      role: 'proveedor' as UserRole,
      badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      icon: Truck,
      user: {
        id: 'prov-ven-01',
        nombre: 'Alejandro Ávila (Proveedor VE)',
        correo: 'distribucion@avila.com.ve',
        telefono: '+58 412 890 1234',
        rol: 'proveedor' as UserRole,
        pais: 'VE' as CountryCode,
        nombre_negocio: 'Mayorista El Ávila C.A.',
        ciudad: 'Caracas (La Yaguara)',
        estado: 'activo' as const,
        fecha_creacion: '2025-01-20T08:00:00Z',
      },
    },
    {
      id: 'admin',
      title: 'Administrador General',
      subtitle: 'José G. Urdaneta • NexoDrop HQ (Auditoría & Control)',
      flag: null,
      country: 'CO' as CountryCode,
      role: 'admin' as UserRole,
      badge: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: ShieldCheck,
      user: {
        id: 'admin-01',
        nombre: 'Admin Principal (José G.)',
        correo: 'josegregoriourdanetaguadama@gmail.com',
        telefono: '+57 310 111 2233',
        rol: 'admin' as UserRole,
        pais: 'CO' as CountryCode,
        nombre_negocio: 'NexoDrop Andina HQ',
        ciudad: 'Bogotá D.C.',
        estado: 'activo' as const,
        fecha_creacion: '2025-01-01T00:00:00Z',
      },
    },
  ];

  const handleSelectDemoAccount = async (demo: typeof demoAccounts[0]) => {
    setLoading(true);
    try {
      await registerNewUser(demo.user);
      onLoginSuccess();
      onClose();
    } catch (e: any) {
      setErrorMsg(e.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      setErrorMsg('Ingresa un correo electrónico.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      // Find matching demo account or create session
      const matched = demoAccounts.find((d) => d.user.correo.toLowerCase() === emailInput.trim().toLowerCase());
      if (matched) {
        await registerNewUser(matched.user);
      } else {
        const isVenezuela = emailInput.includes('.ve') || emailInput.includes('ven');
        await registerNewUser({
          nombre: emailInput.split('@')[0],
          correo: emailInput.trim().toLowerCase(),
          rol: 'vendedor',
          pais: isVenezuela ? 'VE' : 'CO',
          nombre_negocio: `Comercio de ${emailInput.split('@')[0]}`,
          ciudad: isVenezuela ? 'Caracas' : 'Bogotá D.C.',
        });
      }
      onLoginSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      onLoginSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-zinc-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white flex items-center justify-center font-bold shadow-md">
              <LogIn className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-zinc-900">Iniciar Sesión en NexoDrop</h3>
              <p className="text-xs text-zinc-500">
                Acceso exclusivo para usuarios registrados (Vendedores y Proveedores)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl">
              {errorMsg}
            </div>
          )}

          {/* Quick Demo Accounts Multi-User */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block">
                Acceso Rápido por Rol y País (Multi-Usuario):
              </label>
              <span className="text-[11px] text-emerald-700 font-semibold">1-clic para evaluar</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {demoAccounts.map((demo) => {
                const Icon = demo.icon;
                const Flag = demo.flag;
                return (
                  <button
                    key={demo.id}
                    onClick={() => handleSelectDemoAccount(demo)}
                    disabled={loading}
                    className="w-full p-3 bg-zinc-50 hover:bg-zinc-100/90 border border-zinc-200 hover:border-zinc-300 rounded-2xl text-left flex items-center justify-between gap-3 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white border border-zinc-200 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-zinc-700" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-zinc-900 group-hover:text-emerald-700">
                            {demo.title}
                          </span>
                          {Flag && <Flag className="w-4 h-3 inline rounded-xs" />}
                        </div>
                        <p className="text-[11px] text-zinc-500">{demo.subtitle}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-0.5" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-zinc-200 w-full"></div>
            <span className="bg-white px-3 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              o ingresa con tu cuenta
            </span>
          </div>

          {/* Email form */}
          <form onSubmit={handleEmailLogin} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Correo Electrónico:</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  placeholder="tuemail@comercio.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
            >
              Continuar con este correo
            </button>
          </form>

          {/* Google Sign-in */}
          <div>
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-zinc-300 hover:bg-zinc-50 text-zinc-800 font-semibold text-xs rounded-xl transition-colors shadow-2xs"
            >
              <LogIn className="w-4 h-4 text-emerald-600" />
              <span>Ingresar con Google (Firebase Auth)</span>
            </button>
          </div>

          {/* Not registered footer prompt */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-center space-y-2">
            <p className="text-xs font-bold text-emerald-950">¿Aún no tienes cuenta en NexoDrop?</p>
            <p className="text-[11px] text-emerald-800 leading-tight">
              Regístrate gratis como Vendedor o Proveedor para acceder al catálogo, pedidos e inventario en Colombia o
              Venezuela.
            </p>
            <div className="flex gap-2 justify-center pt-1">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenRegister('CO');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                <ColombiaFlag className="w-3.5 h-2.5" />
                <span>Registro Colombia</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenRegister('VE');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                <VenezuelaFlag className="w-3.5 h-2.5" />
                <span>Registro Venezuela</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
