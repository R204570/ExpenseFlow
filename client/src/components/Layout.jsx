import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import {
  ChevronRight,
  CircleUserRound,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  Receipt,
  Sparkles,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  {
    path: '/dashboard',
    icon: LayoutDashboard,
    label: 'Dashboard',
    description: 'Live spending overview',
  },
  {
    path: '/add-expense',
    icon: PlusCircle,
    label: 'Capture',
    description: 'Scan or add a receipt',
  },
  {
    path: '/expenses',
    icon: Receipt,
    label: 'History',
    description: 'Search every expense',
  },
];

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const activeItem = navItems.find(({ path }) => location.pathname.startsWith(path)) || navItems[0];
  const firstName = user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'there';

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const renderNavItem = (item, mobile = false) => {
    const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);

    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={() => setSidebarOpen(false)}
        className={`group flex items-center gap-3 rounded-[1.2rem] border px-4 py-3 transition-all duration-200 ${
          isActive
            ? 'border-white/70 bg-white text-slate-900 shadow-[0_18px_35px_rgba(26,34,48,0.12)]'
            : 'border-transparent text-slate-600 hover:border-white/60 hover:bg-white/70 hover:text-slate-900'
        } ${mobile ? 'w-full' : ''}`}
      >
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
          isActive ? 'bg-slate-900 text-white' : 'bg-white/80 text-slate-500 group-hover:bg-slate-900 group-hover:text-white'
        }`}>
          <item.icon size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold">{item.label}</p>
          <p className="truncate text-xs text-slate-500">{item.description}</p>
        </div>
        <ChevronRight size={16} className={isActive ? 'text-slate-400' : 'text-transparent group-hover:text-slate-300'} />
      </Link>
    );
  };

  return (
    <div className="app-shell">
      <div className="orb orb-warm left-8 top-14 h-44 w-44" />
      <div className="orb orb-cool right-0 top-44 h-56 w-56" />
      <div className="orb orb-ink bottom-8 left-1/3 h-40 w-40" />

      <AnimatePresence>
        {sidebarOpen && (
          <Motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-slate-900/35 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <div className="relative mx-auto flex min-h-screen max-w-[1600px] items-start">
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-[308px] border-r border-white/40 bg-[#f7f2e8]/95 px-5 py-5 backdrop-blur-2xl transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:overflow-y-auto ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex h-full flex-col gap-5">
            <div className="flex items-center justify-between">
              <Link to="/dashboard" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
                <div className="flex h-12 w-12 items-center justify-center rounded-[1.4rem] bg-slate-900 text-white shadow-[0_20px_40px_rgba(17,24,39,0.18)]">
                  <Sparkles size={20} />
                </div>
                <div>
                  <p className="font-['Sora'] text-lg font-bold text-slate-900">ExpenseFlow</p>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Personal finance OS</p>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="rounded-full border border-white/60 bg-white/80 p-2 text-slate-500 lg:hidden"
              >
                <X size={16} />
              </button>
            </div>

            <div className="card overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 p-5 text-white">
              <div className="mb-5 flex items-center justify-between">
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white/80">
                  Today
                </span>
                <Sparkles size={16} className="text-amber-300" />
              </div>
              <h2 className="font-['Sora'] text-2xl font-bold leading-tight">
                Build calmer money habits with a dashboard that feels premium.
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Capture receipts fast, review trends clearly, and keep every expense one tap away.
              </p>
            </div>

            <nav className="space-y-2">{navItems.map((item) => renderNavItem(item, true))}</nav>

            <div className="mt-auto space-y-4">
              <div className="card-flat rounded-[1.4rem] p-4">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-100 text-primary-700">
                    <CircleUserRound size={19} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">{user?.name || 'ExpenseFlow user'}</p>
                    <p className="truncate text-xs text-slate-500">{user?.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="btn-secondary w-full justify-center !rounded-2xl !px-4 !py-3 text-sm"
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 px-4 pt-4 sm:px-6 lg:px-8">
            <div className="card-flat flex items-center justify-between gap-4 rounded-[1.6rem] border-white/60 px-4 py-3 sm:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/60 bg-white/80 text-slate-700 lg:hidden"
                >
                  <Menu size={18} />
                </button>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Workspace</p>
                  <h1 className="truncate text-lg font-bold text-slate-900 sm:text-xl">{activeItem.label}</h1>
                </div>
              </div>

              <div className="hidden items-center gap-3 sm:flex">
                <div className="rounded-full border border-white/60 bg-white/75 px-4 py-2 text-sm text-slate-600">
                  Welcome back, <span className="font-bold text-slate-900">{firstName}</span>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                  {(user?.name?.[0] || user?.email?.[0] || 'E').toUpperCase()}
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 pb-28 pt-5 sm:px-6 lg:px-8 lg:pb-10">
            {children}
          </main>

          <nav className="fixed inset-x-0 bottom-4 z-30 px-4 lg:hidden">
            <div className="mx-auto flex max-w-md items-center justify-between rounded-[1.6rem] border border-white/50 bg-[#f8f4ec]/92 p-2 shadow-[0_18px_45px_rgba(31,41,55,0.14)] backdrop-blur-xl">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-[1.2rem] px-3 py-2 text-xs font-bold ${
                      isActive ? 'bg-slate-900 text-white' : 'text-slate-500'
                    }`}
                  >
                    <item.icon size={18} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}
