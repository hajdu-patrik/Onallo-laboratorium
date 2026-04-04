import { memo, useState, useCallback, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/auth.store';
import { useThemeStore } from '../../store/theme.store';
import { authService } from '../../services/auth.service';
import { ThemeLanguageControls } from './ThemeLanguageControls';

interface NavItem {
  key: string;
  labelKey: string;
  icon: React.ReactNode;
  path: string;
}

const WrenchIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75a4.5 4.5 0 01-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 11-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 016.336-4.486l-3.276 3.276a3.004 3.004 0 002.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);

const BoxIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
  </svg>
);

const GearIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const DEFAULT_NAV_ITEMS: NavItem[] = [
  { key: 'tools', labelKey: 'nav.tools', icon: <WrenchIcon />, path: '/tools' },
  { key: 'scheduler', labelKey: 'nav.scheduler', icon: <CalendarIcon />, path: '/scheduler' },
  { key: 'inventory', labelKey: 'nav.inventory', icon: <BoxIcon />, path: '/inventory' },
  { key: 'settings', labelKey: 'nav.settings', icon: <GearIcon />, path: '/settings' },
];

interface SidebarLayoutProps {
  readonly children: React.ReactNode;
  readonly navItems?: NavItem[];
}

const COLLAPSED_KEY = 'preferred-sidebar-collapsed';

const SidebarLayoutComponent = memo(function SidebarLayout({
  children,
  navItems = DEFAULT_NAV_ITEMS,
}: SidebarLayoutProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const theme = useThemeStore((state) => state.theme);

  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem(COLLAPSED_KEY) === 'true';
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(COLLAPSED_KEY, String(collapsed));
  }, [collapsed]);

  const handleLogout = useCallback(async () => {
    await authService.logout();
    navigate('/login');
  }, [navigate]);

  const toggleCollapse = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  const toggleMobile = useCallback(() => {
    setMobileOpen((prev) => !prev);
  }, []);

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
  }, []);

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? '??';
  const logoSrc = theme === 'dark' ? '/AppLogoFrameWhite.webp' : '/AppLogoFrameBlack.webp';

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-[#D8D2E9] dark:border-[#3A3154]">
        <img src={logoSrc} alt="AutoService" className="w-8 h-8 flex-shrink-0" />
        {!collapsed && (
          <span className="text-lg font-bold text-[#2C2440] dark:text-[#EDE8FA] whitespace-nowrap">
            AutoService
          </span>
        )}
      </div>

      {/* Nav label */}
      {!collapsed && (
        <p className="px-4 pt-4 pb-1 text-[10px] font-semibold tracking-widest text-[#6A627F] dark:text-[#B9B0D3] uppercase">
          {t('nav.list')}
        </p>
      )}

      {/* Nav items */}
      <nav className="flex-1 px-2 py-2 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.key}
            to={item.path}
            onClick={closeMobile}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#EFEBFA] dark:bg-[#241F33] text-[#2C2440] dark:text-[#F5F2FF]'
                  : 'text-[#5E5672] dark:text-[#CFC5EA] hover:bg-[#E6DCF8] dark:hover:bg-[#322B47]'
              } ${collapsed ? 'justify-center' : ''}`
            }
            title={collapsed ? t(item.labelKey) : undefined}
          >
            {item.icon}
            {!collapsed && <span>{t(item.labelKey)}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle (desktop only) */}
      <div className="hidden md:block px-2 py-2">
        <button
          onClick={toggleCollapse}
          title={collapsed ? t('sidebar.expand') : t('sidebar.collapse')}
          className="flex items-center justify-center w-full py-2 rounded-lg text-[#5E5672] dark:text-[#CFC5EA] hover:bg-[#E6DCF8] dark:hover:bg-[#322B47] transition-colors"
        >
          <svg className={`w-5 h-5 transition-transform ${collapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
          </svg>
        </button>
      </div>

      {/* User section */}
      <div className="border-t border-[#D8D2E9] dark:border-[#3A3154] px-3 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#C9B3FF] text-[#2C2440] dark:bg-[#7A66C7] dark:text-[#F5F2FF] text-xs flex items-center justify-center font-bold flex-shrink-0">
            {initials}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs text-[#5E5672] dark:text-[#CFC5EA] truncate">{user?.email}</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={() => { void handleLogout(); }}
            className="mt-2 w-full py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-medium transition-colors"
          >
            {t('layout.logout')}
          </button>
        )}
        {collapsed && (
          <button
            onClick={() => { void handleLogout(); }}
            title={t('layout.logout')}
            className="mt-2 w-full flex justify-center py-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#ECECEF] dark:bg-[#09090F]">
      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu overlay"
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar — mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#F6F4FB] dark:bg-[#13131B] border-r border-[#D8D2E9] dark:border-[#3A3154] transform transition-transform duration-200 ease-out md:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Sidebar ��� desktop */}
      <aside
        className={`hidden md:flex md:flex-col bg-[#F6F4FB] dark:bg-[#13131B] border-r border-[#D8D2E9] dark:border-[#3A3154] transition-[width] duration-200 ease-out overflow-hidden ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 py-3 bg-[#F6F4FB] dark:bg-[#13131B] border-b border-[#D8D2E9] dark:border-[#3A3154]">
          {/* Mobile hamburger */}
          <button
            onClick={toggleMobile}
            title={t('sidebar.openMenu')}
            className="md:hidden p-2 rounded-lg hover:bg-[#E6DCF8] dark:hover:bg-[#322B47] text-[#5E5672] dark:text-[#CFC5EA] min-w-[44px]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

          <div className="flex-1" />

          <ThemeLanguageControls className="flex items-center gap-1.5 sm:gap-3" />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
});

SidebarLayoutComponent.displayName = 'SidebarLayout';

export const SidebarLayout = SidebarLayoutComponent;
