import { memo, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/auth.store';
import { useThemeStore } from '../store/theme.store';
import { ThemeLanguageControls } from '../components/layout/ThemeLanguageControls';

const REDIRECT_DURATION_MS = 3000;
const TIMER_TICK_MS = 50;

const NotFoundComponent = memo(function NotFound() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const theme = useThemeStore((state) => state.theme);
  const [remainingMs, setRemainingMs] = useState(REDIRECT_DURATION_MS);

  const redirectTarget = useMemo(
    () => (isAuthenticated ? '/dashboard' : '/login'),
    [isAuthenticated],
  );

  useEffect(() => {
    const startedAt = Date.now();

    const timer = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const nextRemaining = Math.max(REDIRECT_DURATION_MS - elapsed, 0);
      setRemainingMs(nextRemaining);

      if (nextRemaining <= 0) {
        clearInterval(timer);
        navigate(redirectTarget, { replace: true });
      }
    }, TIMER_TICK_MS);

    return () => clearInterval(timer);
  }, [navigate, redirectTarget]);

  const isDark = theme === 'dark';
  const secondsLeft = Math.max(Math.ceil(remainingMs / 1000), 0);
  const progress = ((REDIRECT_DURATION_MS - remainingMs) / REDIRECT_DURATION_MS) * 100;
  const redirectTextKey =
    redirectTarget === '/dashboard'
      ? 'notFound.redirectDashboard'
      : 'notFound.redirectLogin';

  return (
    <div
      className={`relative min-h-screen overflow-hidden ${isDark ? 'bg-[#09090F] text-[#EDE8FA]' : 'bg-[#ECECEF] text-[#2C2440]'}`}
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute left-1/2 top-1/2 z-0 h-[120vmax] w-[120vmax] -translate-x-1/2 -translate-y-1/2 rounded-full ${
          isDark
            ? 'bg-[radial-gradient(circle,_rgba(122,102,199,0.68)_0%,_rgba(122,102,199,0.32)_34%,_rgba(122,102,199,0.13)_50%,_rgba(122,102,199,0)_72%)]'
            : 'bg-[radial-gradient(circle,_rgba(201,179,255,0.56)_0%,_rgba(201,179,255,0.24)_34%,_rgba(201,179,255,0.1)_50%,_rgba(201,179,255,0)_72%)]'
        }`}
      />

      <ThemeLanguageControls />

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1920px] items-center justify-center px-3 pt-16 sm:px-6 sm:pt-0">
        <section className="relative text-center">
          <h1 className="text-[clamp(88px,22vw,176px)] font-semibold leading-none tracking-tight">
            404
          </h1>

          <p className="mt-3 text-[clamp(24px,8vw,44px)] font-medium leading-tight sm:mt-4">
            {t('notFound.pageNotFound')}
          </p>

          <p
            className={`mx-auto mt-3 max-w-[22rem] text-[clamp(14px,4.5vw,20px)] ${
              isDark ? 'text-[#B9B0D3]' : 'text-[#6A627F]'
            }`}
          >
            {t(redirectTextKey, { seconds: secondsLeft })}
          </p>

          <div
            className="mx-auto mt-3 h-2.5 w-[min(300px,86vw)] overflow-hidden rounded-full border"
            style={{
              backgroundColor: isDark ? '#1B1630' : '#CFC4EB',
              borderColor: isDark ? '#5A4A87' : '#9A84CB',
              boxShadow: isDark
                ? 'inset 0 0 0 1px rgba(237,232,250,0.08)'
                : 'inset 0 0 0 1px rgba(44,36,64,0.08)',
            }}
            aria-hidden="true"
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                background: isDark
                  ? 'linear-gradient(90deg, #D8C8FF 0%, #9A83E3 100%)'
                  : 'linear-gradient(90deg, #7A66C7 0%, #B89BFF 100%)',
                boxShadow: isDark
                  ? '0 0 10px rgba(184,155,255,0.45)'
                  : '0 0 8px rgba(122,102,199,0.35)',
                transition: `width ${TIMER_TICK_MS}ms linear`,
              }}
            />
          </div>
        </section>
      </main>
    </div>
  );
});

NotFoundComponent.displayName = 'NotFound';

export const NotFound = NotFoundComponent;
