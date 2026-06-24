import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { IconType } from 'react-icons';
import {
  FaBars,
  FaChevronRight,
  FaFilm,
  FaSignOutAlt,
  FaStar,
  FaTimes,
  FaTicketAlt,
} from 'react-icons/fa';
import { authService } from '../../../services/auth.service';
import type { User } from '../../../types/auth.types';

export interface UserNavigationItem<T extends string> {
  id: T;
  label: string;
  description: string;
  icon: IconType;
}

interface UserLayoutProps<T extends string> {
  activeSection: T;
  children: React.ReactNode;
  navigationItems: UserNavigationItem<T>[];
  onSectionChange: (section: T) => void;
  pageTitle?: string;
  user: User | null;
}

const getInitials = (name?: string) => {
  if (!name?.trim()) return 'FS';

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
};

const UserLayout = <T extends string,>({
  activeSection,
  children,
  navigationItems,
  onSectionChange,
  pageTitle,
  user,
}: UserLayoutProps<T>) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const activeItem = navigationItems.find((item) => item.id === activeSection) ?? navigationItems[0];
  const currentTitle = pageTitle || activeItem?.label;

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
              Mi espacio
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
          Navegación
        </p>
        <nav className="space-y-1" aria-label="Navegación del usuario">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSectionChange(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-200 ${
                  isActive
                    ? 'bg-cinema-red-500 text-white shadow-lg shadow-cinema-red-500/15'
                    : 'text-gray-400 hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  isActive ? 'bg-white/15' : 'bg-white/[0.04] text-gray-500 group-hover:text-cinema-gold-500'
                }`}>
                  <Icon />
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

        <div className="mt-auto rounded-xl border border-cinema-gold-500/15 bg-cinema-gold-500/[0.04] p-4">
          <FaTicketAlt className="mb-3 text-xl text-cinema-gold-500" />
          <p className="text-sm font-semibold text-white">Tu próxima función</p>
          <p className="mt-1 text-xs leading-relaxed text-gray-500">
            Explora la cartelera, elige un horario y reserva tus asientos.
          </p>
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
                <p className="text-xs text-gray-500">Mi panel / <span className="text-gray-400">{currentTitle}</span></p>
                <h1 className="truncate font-display text-lg font-bold text-white sm:text-xl">{currentTitle}</h1>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden text-right sm:block">
                <p className="max-w-[10rem] truncate text-sm font-semibold text-white">{user?.nombre || 'Usuario'}</p>
                <p className="max-w-[10rem] truncate text-[11px] text-gray-500">{user?.correo || 'Cuenta de cliente'}</p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cinema-red-500 to-cinema-gold-600 text-sm font-bold text-white shadow-lg shadow-cinema-red-500/10">
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

export default UserLayout;
