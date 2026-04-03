import type { AxiosError } from 'axios';

interface ApiErrorPayload {
  readonly code?: string;
  readonly title?: string;
  readonly detail?: string;
  readonly message?: string;
  readonly error?: string;
  readonly retryAfterSeconds?: number;
}

export type LoginError =
  | { key: 'login.invalidCredentials' }
  | { key: 'login.identifierNotFound' }
  | { key: 'login.serverError500' }
  | { key: 'login.databaseUnavailable' }
  | { key: 'login.attemptsExceededWithDuration'; minutes: number }
  | { key: 'login.attemptsExceeded' }
  | { key: 'login.error' };

export type ParsedIdentifier =
  | { kind: 'email'; email: string }
  | { kind: 'phone'; phoneNumber: string }
  | { kind: 'invalid' };

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_MOBILE_PREFIXES = new Set(['20', '21', '30', '31', '50', '70']);
const ALLOWED_GEOGRAPHIC_PREFIXES = new Set([
  '22', '23', '24', '25', '26', '27', '28', '29',
  '32', '33', '34', '35', '36', '37',
  '42', '44', '45', '46', '47', '48', '49',
  '52', '53', '54', '56', '57', '59',
  '62', '63', '66', '68', '69',
  '72', '73', '74', '75', '76', '77', '78', '79',
  '82', '83', '84', '85', '87', '88', '89',
  '92', '93', '94', '95', '96', '99',
]);

function isValidHungarianNationalNumber(nationalDigits: string): boolean {
  if (!/^\d+$/.test(nationalDigits)) {
    return false;
  }

  // Budapest landline: 1 + 7 digits.
  if (nationalDigits.startsWith('1')) {
    return nationalDigits.length === 8;
  }

  if (nationalDigits.length < 8) {
    return false;
  }

  const twoDigitPrefix = nationalDigits.slice(0, 2);

  // Mobile/nomadic ranges: 2-digit prefix + 7 digits.
  if (ALLOWED_MOBILE_PREFIXES.has(twoDigitPrefix)) {
    return nationalDigits.length === 9;
  }

  // Geographic ranges: 2-digit area code + 6 digits.
  if (ALLOWED_GEOGRAPHIC_PREFIXES.has(twoDigitPrefix)) {
    return nationalDigits.length === 8;
  }

  return false;
}

export function parseIdentifier(value: string): ParsedIdentifier {
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
  if (!isValidHungarianNationalNumber(nationalDigits)) {
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

export function resolveLoginError(err: unknown): LoginError {
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
