import React from 'react';
import { UserRole } from '../types';
import { ShieldCheck, ShoppingBag, Truck, HeadphonesIcon } from 'lucide-react';

interface Props {
  role: UserRole;
  size?: 'sm' | 'md';
}

export const RoleBadge: React.FC<Props> = ({ role, size = 'sm' }) => {
  const config = {
    admin: {
      label: 'Administrador',
      icon: ShieldCheck,
      color: 'bg-purple-100 text-purple-800 border-purple-200',
    },
    vendedor: {
      label: 'Vendedor',
      icon: ShoppingBag,
      color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    proveedor: {
      label: 'Proveedor',
      icon: Truck,
      color: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    soporte: {
      label: 'Soporte',
      icon: HeadphonesIcon,
      color: 'bg-amber-100 text-amber-800 border-amber-200',
    },
  }[role];

  const Icon = config.icon;
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${config.color} ${sizeClasses}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      {config.label}
    </span>
  );
};
