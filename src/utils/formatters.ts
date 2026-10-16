import { CountryCode } from '../types';

export function formatCOP(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) {
    return 'Por confirmar';
  }
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatUSD(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) {
    return 'Por confirmar';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatMoney(amount: number | null | undefined, country: CountryCode = 'CO'): string {
  if (amount === null || amount === undefined) {
    return 'Por confirmar';
  }
  if (country === 'VE') {
    // In Venezuela dropshipping USD is the standard anchor currency ($ 18.50 USD / ref)
    return formatUSD(amount);
  }
  return formatCOP(amount);
}

export function formatDateCO(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function getStatusBadge(status: string): { label: string; bg: string; text: string; dot: string } {
  switch (status) {
    case 'pendiente_confirmacion':
      return {
        label: 'Pendiente confirmación',
        bg: 'bg-amber-50 border-amber-200',
        text: 'text-amber-800',
        dot: 'bg-amber-500',
      };
    case 'confirmado':
      return {
        label: 'Confirmado',
        bg: 'bg-blue-50 border-blue-200',
        text: 'text-blue-800',
        dot: 'bg-blue-500',
      };
    case 'en_preparacion':
      return {
        label: 'En preparación',
        bg: 'bg-indigo-50 border-indigo-200',
        text: 'text-indigo-800',
        dot: 'bg-indigo-500',
      };
    case 'despachado':
      return {
        label: 'Despachado',
        bg: 'bg-purple-50 border-purple-200',
        text: 'text-purple-800',
        dot: 'bg-purple-500',
      };
    case 'en_transito':
      return {
        label: 'En tránsito',
        bg: 'bg-cyan-50 border-cyan-200',
        text: 'text-cyan-800',
        dot: 'bg-cyan-500',
      };
    case 'entregado':
      return {
        label: 'Entregado',
        bg: 'bg-emerald-50 border-emerald-200',
        text: 'text-emerald-800',
        dot: 'bg-emerald-500',
      };
    case 'novedad':
      return {
        label: 'Con novedad',
        bg: 'bg-rose-50 border-rose-200',
        text: 'text-rose-800',
        dot: 'bg-rose-500',
      };
    case 'cancelado':
      return {
        label: 'Cancelado',
        bg: 'bg-zinc-100 border-zinc-200',
        text: 'text-zinc-600',
        dot: 'bg-zinc-400',
      };
    case 'devuelto':
      return {
        label: 'Devuelto',
        bg: 'bg-red-50 border-red-200',
        text: 'text-red-800',
        dot: 'bg-red-500',
      };
    default:
      return {
        label: status,
        bg: 'bg-zinc-100 border-zinc-200',
        text: 'text-zinc-700',
        dot: 'bg-zinc-400',
      };
  }
}
