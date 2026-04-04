# AutoService.ApiService — Domain & API Rules

## Domain Model Constraints

- `People` is abstract, TPH. Discriminator column on `people` table. Never change to TPT/TPC.
- `FullName` is an owned value object on `People`.
- Identity linkage only via `People.IdentityUserId`. No password/credential fields on `People`, `Customer`, or `Mechanic`.
- Mechanic expertise: 1–10 items, unique, never empty when persisted.
- Core relationships:
  - `Customer` 1..* `Vehicle`
  - `Vehicle` 1..* `Appointment`
  - `Appointment` *..*  `Mechanic` (join table)
- Never expose EF entities directly from API boundaries — use DTO contracts.

## EF Core

- Provider: `Npgsql.EntityFrameworkCore.PostgreSQL` — use `options.UseNpgsql(...)`.
- Model config centralized in `Data/AutoServiceDbContext.cs`.
- New migrations go in `Data/Migrations`.
- Current migrations: `InitialCreate`, `AddIdentityAndIdentityUserId`, `AddRefreshTokensAndCookieAuth`.
- `DemoDataInitializer.EnsureSeededAsync()` runs on startup: `MigrateAsync()` + seed mechanics (with Identity accounts) + customers (plain records) when tables are empty.
- Outside Development, seeding requires `DemoData:EnableSeeding=true` and `DemoData:MechanicPassword`.
- Prefer async EF methods (`SaveChangesAsync`, `ToListAsync`, etc.) with cancellation tokens.

## Auth Implementation

- Mechanic-only registration and login. Customers have no Identity account.
- Registration is transactional: `IdentityUser` + `Mechanic` domain record created together, linked by `IdentityUserId`.
- Login accepts email or phone number.
- Identifier normalization is mandatory across register/login:
  - emails are trimmed + lowercased,
  - Hungarian phone inputs (`+36`, `36`, `06`, spaced/punctuated forms) normalize to canonical national form with strict prefix/length rules:
    - `361xxxxxxx` (Budapest),
    - `36(20|21|30|31|50|70)xxxxxxx` (mobile/nomadic),
    - `36<approved 2-digit area>xxxxxx` (geographic).
- Register enforces duplicate phone detection on normalized values, including equivalent formats.
- Auth session model is cookie-based:
  - access token in HttpOnly cookie (`autoservice_at`),
  - refresh token in HttpOnly cookie (`autoservice_rt`),
  - persisted hashed refresh token rows in `refreshtokens`.
- Login failure semantics: generic `401 invalid_credentials` for unknown identifier and wrong password, `403 mechanic_only_login` when an existing customer email/phone identifier is used, `429` during lockout/rate-limit, `500` when linked domain record is missing.
- Lockout: 5 failed attempts, 15-minute lockout.
- Rate limit: 10 requests/min per client IP, policy `AuthLoginAttempts`. Temporary ban after rate-limit rejection: 3 minutes.
- JWT lifetime: 10 minutes. Refresh token lifetime: 7 days.
- JWT clock skew: 1 minute. Issuer + audience validation enabled. Minimum secret: 32 bytes.
- Logout revokes refresh token session and denylists current JWT `jti` until token expiry.
- JWT bearer handler reads access token from cookie and rejects denylised `jti` values.

## Auth Endpoints (Current)

- `POST /api/auth/register`
- `POST /api/auth/login` (rate-limited)
- `POST /api/auth/refresh`
- `POST /api/auth/logout` (authorized)
- `GET /api/auth/validate` (authorized)

## Appointment Endpoints (Current)

- `GET /api/appointments?year=&month=` (authorized) — list appointments for a month
- `GET /api/appointments/today` (authorized) — list today's appointments
- `PUT /api/appointments/{id}/claim` (authorized) — current mechanic claims an appointment
- `PUT /api/appointments/{id}/status` (authorized) — update appointment status (assigned mechanic only)

## API Documentation

- OpenAPI spec: `GET /openapi/v1.json` (Development only)
- Interactive docs: Scalar API Reference at `/scalar/v1` (Development only)
- Package: `Scalar.AspNetCore` — modern replacement for Swagger UI, works with built-in `Microsoft.AspNetCore.OpenApi`.

## Security Middleware (must preserve order)

`UseHttpsRedirection` → `UseHsts` (non-Dev) → login ban middleware → `UseRateLimiter` → `UseCors` → `UseAuthentication` → `UseAuthorization`

## Configuration

- Connection string key: `ConnectionStrings:AutoServiceDb`
- JWT keys: `JwtSettings:Secret` (min 32 bytes), `JwtSettings:Issuer`, `JwtSettings:Audience`
- CORS allowed origins key: `Cors:AllowedOrigins` (explicit origins, `AllowCredentials()` enabled)
- Local overrides: `appsettings.Local.json` (gitignored) or env vars (`ConnectionStrings__AutoServiceDb`, `JwtSettings__Secret`)
- Never commit secrets or credentials.

## Code Layout

- `Program.cs` — service registration, middleware, endpoint mapping only.
- `Auth/` — all auth endpoint files (map/register/login/helpers/contracts).
- `Appointments/` — appointment endpoint files (contracts/helpers/queries/mutations/registration), partial-class pattern mirroring `Auth/`.
- Cross-cutting logic in dedicated folders/files; keep `Program.cs` clean.
- Keep comments concise and only for non-obvious logic.
