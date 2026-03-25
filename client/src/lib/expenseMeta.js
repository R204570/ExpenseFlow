import {
  BookOpen,
  CarFront,
  HeartPulse,
  Lightbulb,
  Package,
  Plane,
  ShoppingBag,
  ShoppingCart,
  Ticket,
  UtensilsCrossed,
} from 'lucide-react';

const FALLBACK_CATEGORY = 'Other';

export const CATEGORY_META = {
  'Food & Dining': {
    icon: UtensilsCrossed,
    chip: 'bg-rose-100 text-rose-700',
    soft: 'from-rose-500/18 via-white to-white',
    iconWrap: 'bg-rose-100 text-rose-600',
  },
  Groceries: {
    icon: ShoppingCart,
    chip: 'bg-lime-100 text-lime-700',
    soft: 'from-lime-500/16 via-white to-white',
    iconWrap: 'bg-lime-100 text-lime-600',
  },
  Transportation: {
    icon: CarFront,
    chip: 'bg-sky-100 text-sky-700',
    soft: 'from-sky-500/16 via-white to-white',
    iconWrap: 'bg-sky-100 text-sky-600',
  },
  Shopping: {
    icon: ShoppingBag,
    chip: 'bg-fuchsia-100 text-fuchsia-700',
    soft: 'from-fuchsia-500/16 via-white to-white',
    iconWrap: 'bg-fuchsia-100 text-fuchsia-600',
  },
  Entertainment: {
    icon: Ticket,
    chip: 'bg-violet-100 text-violet-700',
    soft: 'from-violet-500/16 via-white to-white',
    iconWrap: 'bg-violet-100 text-violet-600',
  },
  Healthcare: {
    icon: HeartPulse,
    chip: 'bg-red-100 text-red-700',
    soft: 'from-red-500/16 via-white to-white',
    iconWrap: 'bg-red-100 text-red-600',
  },
  Utilities: {
    icon: Lightbulb,
    chip: 'bg-amber-100 text-amber-700',
    soft: 'from-amber-500/16 via-white to-white',
    iconWrap: 'bg-amber-100 text-amber-600',
  },
  Education: {
    icon: BookOpen,
    chip: 'bg-indigo-100 text-indigo-700',
    soft: 'from-indigo-500/16 via-white to-white',
    iconWrap: 'bg-indigo-100 text-indigo-600',
  },
  Travel: {
    icon: Plane,
    chip: 'bg-cyan-100 text-cyan-700',
    soft: 'from-cyan-500/16 via-white to-white',
    iconWrap: 'bg-cyan-100 text-cyan-600',
  },
  Other: {
    icon: Package,
    chip: 'bg-slate-200 text-slate-700',
    soft: 'from-slate-500/16 via-white to-white',
    iconWrap: 'bg-slate-200 text-slate-700',
  },
};

export const EXPENSE_CATEGORIES = Object.keys(CATEGORY_META);

export function getCategoryMeta(category) {
  return CATEGORY_META[category] || CATEGORY_META[FALLBACK_CATEGORY];
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

export function formatDate(value, options) {
  if (!value) return '--';

  return new Intl.DateTimeFormat('en-US', options || {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}
