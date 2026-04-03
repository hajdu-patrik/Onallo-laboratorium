---
applyTo: "AutoServiceApp/AutoService.WebUI/**"
description: "Use when editing React frontend, API integration, routing, and UI state in AutoService.WebUI."
---
# AutoService.WebUI Instructions

## Authentication & Authorization

- **Cookie-based authentication**: Users (mechanics only) log in with email/phone + password.
- **Token storage**: Access/refresh tokens are managed by backend HttpOnly cookies (`autoservice_at`, `autoservice_rt`).
- **Token lifespan**: Backend access token lifetime is 10 minutes, refresh token lifetime is 7 days.
- **Login flow**:
  1. User sees Loading page (~2.5 seconds) only once on first browser load (`localStorage` key: `loading-page-seen`).
  2. If no valid server session exists, redirect to `/login`.
  3. After successful login, redirect to `/` (dashboard).
  4. Axios client sends credentialed requests (`withCredentials`) and retries once through `/api/auth/refresh` after `401` (except auth endpoints).
- **Logout**: Call backend `POST /api/auth/logout`, clear auth store state, then redirect to `/login`.
- **Protected routes**: Use `<PrivateRoute>` wrapper to guard dashboard and other authenticated pages.
- **Auth store**: Use Zustand (`useAuthStore`) to manage `isAuthenticated`, `user`, `error`, `isLoading`.
- **Auth service**: Use `authService` from `src/services/auth.service.ts` for login/logout/validate-based restore.
- **Identifier parsing** (login UI):
  - emails are trimmed and lowercased before submit,
  - Hungarian phone formats (`+36`, `36`, `06`, spaced/punctuated forms) are normalized before submit,
  - invalid identifier format should be rejected client-side with explicit error.

## UI/UX & Theme

- **Dark/Light mode**: Implement with Zustand store (`useThemeStore`). 
  - Shared top-right control toggles theme.
  - Preference saved to `localStorage` as `preferred-theme`.
  - Apply class `dark` to `document.documentElement` when theme is 'dark'.
- **Internationalization (i18n)**:
  - Use `react-i18next` for EN/HU language support.
  - Shared top-right control switches between `en` and `hu`.
  - Control `title` text should follow active language (EN: switch labels in English, HU: switch labels in Hungarian).
  - Preference saved to `localStorage` as `preferred-language`.
  - Add all UI strings to translation resources in `src/i18n.ts`.

## Component Structure

- **`src/pages/Login/page.tsx`**: Login form (email/phone selector, password field, status-based error display).
- **`src/pages/Dashboard/page.tsx`**: Main authenticated dashboard (home page at `/`).
- **`src/pages/LoadingPage.tsx`**: Initial loading animation (~2.5 seconds, shows only once per browser profile).
- **`src/pages/NotFound.tsx`**: 404 error page (catches all undefined routes).
- **`src/components/layout/Layout.tsx`**: Wrapper for authenticated pages (header, footer, shared controls, logout button).
- **`src/components/layout/ThemeLanguageControls.tsx`**: Reusable fixed top-right EN/HU + dark/light controls.
- **`src/router/PrivateRoute.tsx`**: Route guard that redirects to `/login` if not authenticated.

## Services & State

- **`src/services/auth.service.ts`**: Login, logout, and auth-state restore via `/api/auth/validate`.
- **`src/store/auth.store.ts`**: Zustand store for `user`, `isAuthenticated`, `isLoading`, `error`.
- **`src/store/theme.store.ts`**: Zustand store for dark/light mode preference.
- **`src/services/api.client.ts`**: Axios instance with credentialed cookie requests and refresh retry; requires `VITE_API_URL` from environment (no hardcoded URL fallback).
- **`src/types/types.ts`**: TypeScript interfaces for API contracts (LoginRequest, LoginResponse, AuthUser).
- **`src/utils/i18n.ts`**: i18next configuration and EN/HU translation resources.
- **`vite.config.ts`**: In serve mode, dev server port is read from environment `PORT` and must be valid (`strictPort: true`).

## Routing

- `/login` → Login page (public).
- `/` → Dashboard (protected, requires valid auth session).
- `/dashboard` → Dashboard alias (protected, requires valid auth session).
- `/*` → 404 Not Found page.
- BrowserRouter should keep `future` flags enabled (`v7_startTransition`, `v7_relativeSplatPath`) to avoid React Router v7 deprecation warnings.

## API Integration

- **Backend endpoints**:
  - `POST /api/auth/login` – (email or phoneNumber) + password → cookie session + profile.
  - `POST /api/auth/refresh` – refresh token rotation + access cookie reissue.
  - `POST /api/auth/logout` – refresh revoke + cookie clear.
  - `GET /api/auth/validate` – validate active authenticated session.
  - `POST /api/auth/login` failure semantics: generic `401 invalid_credentials`, `429` lockout/rate-limit, `500` linked domain-record issues.
- **VITE_API_URL**: AppHost injects the API base URL as an environment variable.
- **No URL hardcode fallback**: `VITE_API_URL` must come from env (AppHost or `.env.development`).
- **Error handling**: Axios interceptor handles refresh-on-401 flow and login page maps `401/429/500` and network/database availability failures to dedicated EN/HU messages.

## Styling & Responsive Design

- Use React function components with strict TypeScript.
- Keep API calling logic in `src/services` and keep components focused on UI/state.
- Keep styles in Tailwind utility classes; avoid unnecessary custom CSS.
- Keep global typography default as `Inter` from `src/index.css`; avoid resetting components back to system fonts.
- Keep layouts responsive for desktop and mobile.
- Use pastel purple as the primary accent color (`bg-purple-500`, `text-purple-600`).
- Form validation messages should be explicit and user-friendly.
- Login form inputs should include proper `autocomplete` attributes (for example password uses `current-password`).
- Both dark and light modes must be visually appealing.

## Key Dependencies

- `react-router-dom` – Client-side routing.
- `axios` – HTTP client (credentialed requests + refresh retry).
- `zustand` – State management (auth, theme).
- `i18next` + `react-i18next` – Internationalization.
- `tailwindcss` – Styling (with dark mode support via `darkMode: 'class'`).

## Security Notes

- Never log tokens/cookies or sensitive user data to console.
- Keep auth trust server-side via `/api/auth/validate` and backend cookie/session controls.
- Only mechanics can log in; customers are managed server-side.
- Use HTTPS in production.

