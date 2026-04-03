import { memo, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { AxiosError } from 'axios';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../store/auth.store';
import { ThemeLanguageControls } from '../../components/layout/ThemeLanguageControls';
import { Image } from '../../components/common/Image';

interface ApiErrorPayload {
  readonly code?: string;
  readonly title?: string;
  readonly detail?: string;
  readonly message?: string;
  readonly error?: string;
  readonly retryAfterSeconds?: number;
}

type LoginError =
  | { key: 'login.invalidCredentials' }
  | { key: 'login.identifierNotFound' }
  | { key: 'login.serverError500' }
  | { key: 'login.databaseUnavailable' }
  | { key: 'login.attemptsExceededWithDuration'; minutes: number }
  | { key: 'login.attemptsExceeded' }
  | { key: 'login.error' };

type ParsedIdentifier =
  | { kind: 'email'; email: string }
  | { kind: 'phone'; phoneNumber: string }
  | { kind: 'invalid' };

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseIdentifier(value: string): ParsedIdentifier {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return { kind: 'invalid' };
  }

  if (trimmedValue.includes('@')) {
    if (!EMAIL_REGEX.test(trimmedValue)) {
      return { kind: 'invalid' };
    }

    return {
      kind: 'email',
      email: trimmedValue.toLowerCase(),
    };
  }

  const compactValue = trimmedValue.replaceAll(/\D/g, '');

  if (!compactValue) {
    return { kind: 'invalid' };
  }

  let normalizedValue = compactValue;

  if (normalizedValue.startsWith('00')) {
    normalizedValue = normalizedValue.slice(2);
  }

  if (normalizedValue.startsWith('06')) {
    normalizedValue = `36${normalizedValue.slice(2)}`;
  }

  if (!normalizedValue.startsWith('36')) {
    return { kind: 'invalid' };
  }

  const nationalDigits = normalizedValue.slice(2);
  const hasOnlyDigits = /^\d+$/.test(nationalDigits);

  if (!hasOnlyDigits || nationalDigits.length !== 9) {
    return { kind: 'invalid' };
  }

  return {
    kind: 'phone',
    phoneNumber: `36${nationalDigits}`,
  };
}

function parseRetryAfterSeconds(err: AxiosError<ApiErrorPayload>): number | null {
  const payloadRetryAfter = err.response?.data?.retryAfterSeconds;
  if (typeof payloadRetryAfter === 'number' && Number.isFinite(payloadRetryAfter) && payloadRetryAfter > 0) {
    return Math.floor(payloadRetryAfter);
  }

  const retryAfterHeader = err.response?.headers?.['retry-after'];

  if (typeof retryAfterHeader === 'string') {
    const parsedSeconds = Number.parseInt(retryAfterHeader, 10);
    if (!Number.isNaN(parsedSeconds) && parsedSeconds > 0) {
      return parsedSeconds;
    }

    const parsedDate = Date.parse(retryAfterHeader);
    if (!Number.isNaN(parsedDate)) {
      const deltaSeconds = Math.ceil((parsedDate - Date.now()) / 1000);
      if (deltaSeconds > 0) {
        return deltaSeconds;
      }
    }
  }

  return null;
}

function toAttemptsExceededError(retryAfterSeconds: number | null): LoginError {
  if (retryAfterSeconds === null) {
    return { key: 'login.attemptsExceeded' };
  }

  const minutes = Math.max(1, Math.ceil(retryAfterSeconds / 60));

  return {
    key: 'login.attemptsExceededWithDuration',
    minutes,
  };
}

function resolveLoginError(err: unknown): LoginError {
  const axiosError = err as AxiosError<ApiErrorPayload>;
  const status = axiosError?.response?.status;
  const responseData = axiosError?.response?.data;

  const normalizedErrorText = [
    responseData?.code,
    responseData?.title,
    responseData?.detail,
    responseData?.message,
    responseData?.error,
    axiosError?.message,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (
    status === 429 ||
    normalizedErrorText.includes('lockout') ||
    normalizedErrorText.includes('too many attempts') ||
    normalizedErrorText.includes('rate limit')
  ) {
    return toAttemptsExceededError(parseRetryAfterSeconds(axiosError));
  }

  if (status === 500 || normalizedErrorText.includes('500')) {
    return { key: 'login.serverError500' };
  }

  if (
    normalizedErrorText.includes('database') ||
    normalizedErrorText.includes('db') ||
    normalizedErrorText.includes('npgsql') ||
    normalizedErrorText.includes('connection') ||
    normalizedErrorText.includes('socket') ||
    normalizedErrorText.includes('econnrefused') ||
    normalizedErrorText.includes('network error') ||
    normalizedErrorText.includes('failed to fetch')
  ) {
    return { key: 'login.databaseUnavailable' };
  }

  if (
    status === 404 ||
    normalizedErrorText.includes('identifier_not_found') ||
    normalizedErrorText.includes('does not exist') ||
    normalizedErrorText.includes('not found')
  ) {
    return { key: 'login.identifierNotFound' };
  }

  if (status === 401) {
    return { key: 'login.invalidCredentials' };
  }

  return { key: 'login.error' };
}

const LoginComponent = memo(function Login() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const setAuthError = useAuthStore((state) => state.setError);

  const handleSubmit = useCallback(async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const parsedIdentifier = parseIdentifier(identifier);

    if (parsedIdentifier.kind === 'invalid') {
      const formatError = t('login.invalidFormat');
      setError(formatError);
      setAuthError(formatError);
      return;
    }

    setIsLoading(true);

    try {
      const loginRequest = {
        email: parsedIdentifier.kind === 'email' ? parsedIdentifier.email : undefined,
        phoneNumber: parsedIdentifier.kind === 'phone' ? parsedIdentifier.phoneNumber : undefined,
        password,
      };

      await authService.login(loginRequest);
      navigate('/');
    } catch (err) {
      const resolvedError = resolveLoginError(err);
      const errorMessage = resolvedError.key === 'login.attemptsExceededWithDuration'
        ? t(resolvedError.key, { minutes: resolvedError.minutes })
        : t(resolvedError.key);

      setError(errorMessage);
      setAuthError(errorMessage);
    } finally {
      setPassword('');
      setIsLoading(false);
    }
  }, [identifier, password, navigate, t, setAuthError]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#ECECEF] px-3 pb-3 pt-16 text-[#2C2440] dark:bg-[#09090F] dark:text-[#EDE8FA] sm:p-4 sm:pt-4">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[120vmax] w-[120vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(201,179,255,0.58)_0%,_rgba(201,179,255,0.26)_32%,_rgba(201,179,255,0.1)_48%,_rgba(201,179,255,0)_72%)] dark:bg-[radial-gradient(circle,_rgba(122,102,199,0.7)_0%,_rgba(122,102,199,0.34)_34%,_rgba(122,102,199,0.14)_50%,_rgba(122,102,199,0)_72%)]"
      />

      <ThemeLanguageControls />

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-2xl border border-[#D8D2E9] bg-white p-4 shadow-[0_12px_34px_rgba(44,36,64,0.14)] dark:border-[#2C2440] dark:bg-[#13131B] dark:shadow-[0_16px_36px_rgba(0,0,0,0.45)] sm:p-8">
          <div className="relative mb-5 flex flex-col sm:mb-7">
            <div className="mt-1 flex items-center justify-center">
              <Image
                src="/AppLogoFrameBlack.webp"
                alt="AutoService logo"
                className="block h-24 w-auto dark:hidden opacity-70 select-none"
              />
              <Image
                src="/AppLogoFrameWhite.webp"
                alt="AutoService logo"
                className="hidden h-24 w-auto dark:block opacity-70 select-none"
              />
            </div>
                 <p className="mt-2 text-sm text-[#6A627F] dark:text-[#B9B0D3]">{t('login.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
            <div>
              <label htmlFor="identifier" className="mb-2 block text-sm font-medium text-[#5E5672] dark:text-[#CFC5EA]">
                {t('login.identifierLabel')}
              </label>
              <input
                id="identifier"
                type="text"
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={t('login.identifierPlaceholder')}
                className="w-full rounded-xl border border-[#D8D2E9] bg-[#F6F4FB] px-3.5 py-2.5 text-[14px] text-[#2C2440] placeholder-[#8A829F] outline-none transition focus:border-[#C9B3FF] focus:ring-2 focus:ring-[#C9B3FF66] dark:border-[#3A3154] dark:bg-[#1A1A25] dark:text-[#EDE8FA] dark:placeholder-[#8C83A8] dark:focus:border-[#C9B3FF] dark:focus:ring-[#C9B3FF3D] sm:px-4 sm:py-3 sm:text-[15px]"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-[#5E5672] dark:text-[#CFC5EA]">
                {t('login.password')}
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('login.password')}
                className="w-full rounded-xl border border-[#D8D2E9] bg-[#F6F4FB] px-3.5 py-2.5 text-[14px] text-[#2C2440] placeholder-[#8A829F] outline-none transition focus:border-[#C9B3FF] focus:ring-2 focus:ring-[#C9B3FF66] dark:border-[#3A3154] dark:bg-[#1A1A25] dark:text-[#EDE8FA] dark:placeholder-[#8C83A8] dark:focus:border-[#C9B3FF] dark:focus:ring-[#C9B3FF3D] sm:px-4 sm:py-3 sm:text-[15px]"
                required
                disabled={isLoading}
              />
            </div>

            {error && (
              <p className="text-sm font-medium text-[#E25B63] dark:text-[#FF7A80]">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-1.5 w-full rounded-xl bg-[#C9B3FF] py-2.5 text-sm font-semibold text-[#2C2440] shadow-[0_8px_20px_rgba(111,84,173,0.28)] transition hover:bg-[#BFA6F7] disabled:cursor-not-allowed disabled:bg-[#DCCDFA] dark:bg-[#7A66C7] dark:text-[#F5F2FF] dark:hover:bg-[#8A75D6] dark:disabled:bg-[#4B406E] sm:mt-2 sm:py-3 sm:text-base"
            >
              {isLoading ? t('login.loading') : t('login.submit')}
            </button>
          </form>

          <p className="mt-4 text-xs text-[#6A627F] dark:text-[#B9B0D3] sm:mt-5 sm:text-sm">
            {t('login.helpText')}
          </p>
        </div>
      </div>
    </div>
  );
});

LoginComponent.displayName = 'Login';

export const Login = LoginComponent;
