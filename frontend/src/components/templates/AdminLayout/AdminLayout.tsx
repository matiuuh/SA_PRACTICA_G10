import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { IconType } from 'react-icons';
import {
  FaBars,
  FaChevronRight,
  FaFilm,
  FaQrcode,
  FaShieldAlt,
  FaSignOutAlt,
  FaStar,
  FaTimes,
} from 'react-icons/fa';
import { authService } from '../../../services/auth.service';
import type { User } from '../../../types/auth.types';

export interface AdminNavigationItem<T extends string> {
  id: T;
  label: string;
  description: string;
  icon: IconType;
}

interface AdminLayoutProps<T extends string> {
  activeSection: T;
  children: React.ReactNode;
  navigationItems: AdminNavigationItem<T>[];
  onSectionChange: (section: T) => void;
  user: User | null;
}

const getInitials = (name?: string) => {
  if (!name?.trim()) return 'AD';

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
};

const AdminLayout = <T extends string,>({
  activeSection,
  children,
  navigationItems,
  onSectionChange,
  user,
}: AdminLayoutProps<T>) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const activeItem = useMemo(
    () => navigationItems.find((item) => item.id === activeSection) ?? navigationItems[0],
    [activeSection, navigationItems],
  );

  useEffect(() => {
    if (!isSidebarOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsSidebarOpen(false);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSidebarOpen]);

  const handleSectionChange = (section: T) => {
    onSectionChange(section);
    setIsSidebarOpen(false);
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <>
      <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-cinema-red-500/15 ring-1 ring-cinema-red-500/30">
            <FaFilm className="text-xl text-cinema-red-500" />
            <FaStar className="absolute -right-1 -top-1 text-[10px] text-cinema-gold-500" />
          </div>
          <div>
            <p className="font-display text-lg font-bold leading-none text-white">
              Film<span className="text-cinema-red-500">Stars</span>
            </p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500">
              Administración
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsSidebarOpen(false)}
          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/5 hover:text-white lg:hidden"
          aria-label="Cerrar menú"
        >
          <FaTimes />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-4 py-6">
        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
          Gestión
        </p>

        <nav className="space-y-1" aria-label="Navegación administrativa">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSectionChange(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-200 ${
                  isActive
                    ? 'bg-cinema-red-500 text-white shadow-lg shadow-cinema-red-500/15'
                    : 'text-gray-400 hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                    isActive ? 'bg-white/15' : 'bg-white/[0.04] text-gray-500 group-hover:text-cinema-gold-500'
                  }`}
                >
                  <Icon className="text-base" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{item.label}</span>
                  <span className={`block truncate text-[11px] ${isActive ? 'text-white/65' : 'text-gray-600'}`}>
                    {item.description}
                  </span>
                </span>
                <FaChevronRight className={`text-[10px] ${isActive ? 'text-white/70' : 'text-gray-700'}`} />
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-6">
          <div className="mb-4 h-px bg-white/[0.07]" />
          <button
            type="button"
            onClick={() => navigate('/servicios/escaner-boletos')}
            className="group flex w-full items-center gap-3 rounded-xl border border-cinema-gold-500/15 bg-cinema-gold-500/[0.04] px-3 py-3 text-left text-gray-300 transition-all hover:border-cinema-gold-500/35 hover:bg-cinema-gold-500/[0.08] hover:text-white"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cinema-gold-500/10 text-cinema-gold-500">
              <FaQrcode />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">Escáner de boletos</span>
              <span className="block text-[11px] text-gray-600">Control de acceso</span>
            </span>
            <FaChevronRight className="text-[10px] text-gray-600 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#120c09] text-white">
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-72 flex-col border-r border-white/[0.08] bg-[#17100d] lg:flex">
        <SidebarContent />
      </aside>

      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Cerrar menú"
          />
          <aside className="relative flex h-full w-[min(18rem,86vw)] flex-col border-r border-white/10 bg-[#17100d] shadow-2xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="min-h-screen lg:pl-72">
        <header className="sticky top-0 z-40 h-20 border-b border-white/[0.08] bg-[#120c09]/90 backdrop-blur-xl">
          <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-gray-300 transition-colors hover:bg-white/[0.08] hover:text-white lg:hidden"
                aria-label="Abrir menú"
              >
                <FaBars />
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <FaShieldAlt className="text-cinema-red-500" />
                  <span>Panel administrativo</span>
                  <span className="hidden text-gray-700 sm:inline">/</span>
                  <span className="hidden text-gray-400 sm:inline">{activeItem?.label}</span>
                </div>
                <h1 className="truncate font-display text-lg font-bold text-white sm:text-xl">{activeItem?.label}</h1>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden text-right sm:block">
                <p className="max-w-40 truncate text-sm font-semibold text-white">{user?.nombre || 'Administrador'}</p>
                <p className="max-w-40 truncate text-[11px] text-gray-500">{user?.correo || 'Cuenta administrativa'}</p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cinema-red-500 to-cinema-red-700 text-sm font-bold text-white shadow-lg shadow-cinema-red-500/10">
                {getInitials(user?.nombre)}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="flex h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-sm font-semibold text-gray-300 transition-all hover:border-cinema-red-500/40 hover:bg-cinema-red-500/10 hover:text-white"
                title="Cerrar sesión"
              >
                <FaSignOutAlt />
                <span className="hidden md:inline">Cerrar sesión</span>
              </button>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mx-auto max-w-[1600px]">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
