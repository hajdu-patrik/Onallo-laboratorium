# AutoService.WebUI — Frontend Rules

## Auth Flow

- Mechanics-only authentication using backend-managed HttpOnly cookie session.
- Loading page (~3s) shows once per browser profile (`localStorage` key: `loading-page-seen`).
- No valid session → redirect to `/login`. Successful login → redirect to `/`.
- Login identifier input is normalized before submit:
  - email: trim + lowercase
  - phone: accept Hungarian forms (`+36`, `36`, `06`, spaced/punctuated) and normalize to canonical backend-compatible format
- Axios client uses `withCredentials: true` and automatic `POST /api/auth/refresh` retry on `401` for non-auth endpoints.
- Logout calls `POST /api/auth/logout`, clears auth store state, then redirects to `/login`.
- Use `<PrivateRoute>` to guard authenticated pages.

## State & Services

- `src/store/auth.store.ts` — Zustand: `isAuthenticated`, `user`, `isLoading`, `error`
- `src/store/theme.store.ts` — Zustand: dark/light preference (saved as `preferred-theme`)
- `src/services/auth.service.ts` — login/logout/session restore via `/api/auth/login`, `/api/auth/logout`, `/api/auth/validate`
- `src/services/api.client.ts` — Axios instance with credentialed cookie requests and refresh retry; reads `VITE_API_URL` from env, **no hardcoded fallback**
- `src/types/types.ts` — `LoginRequest`, `LoginResponse`, `AuthUser`
- `src/utils/i18n.ts` — i18next config with EN/HU translations

## Component Map

- `src/pages/Login/page.tsx` — login form
- `src/pages/Dashboard/page.tsx` — main authenticated page at `/`
- `src/pages/LoadingPage.tsx` — initial animation, once per session
- `src/pages/NotFound.tsx` — 404
- `src/components/layout/Layout.tsx` — authenticated wrapper (header, footer, controls, logout)
- `src/components/layout/ThemeLanguageControls.tsx` — fixed top-right EN/HU + dark/light toggle
- `src/router/PrivateRoute.tsx` — route guard

## Routing

- `/login` — public
- `/` and `/dashboard` — protected (requires valid server-validated auth session)
- `/*` — 404
- Keep `future` flags on BrowserRouter (`v7_startTransition`, `v7_relativeSplatPath`).

## Styling

- Tailwind utility classes only. Avoid custom CSS unless unavoidable.
- Primary accent: pastel purple (`bg-purple-500`, `text-purple-600`).
- Global font: `Inter` from `src/index.css` — do not reset to system fonts.
- Both dark and light modes must be visually complete.
- Layouts must be responsive (desktop + mobile).

## i18n & Dark Mode

- Language toggle: EN/HU via `react-i18next`. Preference saved as `preferred-language`.
- Dark mode: `dark` class on `document.documentElement`. Preference saved as `preferred-theme`.
- All new UI strings must be added to both EN and HU in `src/utils/i18n.ts`.

## Vite Config

- Dev server port read from `PORT` env var with `strictPort: true`.
- `VITE_API_URL` is required and must come from env (injected by AppHost or `.env.development`).

## Key Dependencies

`react-router-dom`, `axios`, `zustand`, `i18next`, `react-i18next`, `tailwindcss`

## Security

- Never log auth cookies, tokens, or sensitive user data to console.
- Keep auth state server-authoritative via `/api/auth/validate` restore flow.
