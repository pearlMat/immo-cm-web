# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start development server (port 3001)
npm run build     # Production build
npm run start     # Start production server (port 3001)
npm run lint      # Run ESLint
npm run test      # Run Vitest in watch mode
npm run test:run  # Run Vitest once (CI)
npm run test:e2e  # Run Playwright E2E tests
```

## Project Overview

**ImmoCM** — a real estate listing platform for Cameroon. Built with Next.js 16 App Router, TypeScript, and Tailwind CSS v4. The project is in early scaffolding stage; the full architecture is specified in `FRONTEND_IMPLEMENTATION_PLAN.md`.

The UI is **bilingual (French + English)** via `next-intl`, with locale-prefixed routes (`/fr/...`, `/en/...`, default locale `fr`). Route path segments stay in French for both locales (e.g. `/fr/annonces`, `/en/annonces`) — only the locale prefix changes; only UI text is translated. Currency is **FCFA** throughout.

## Architecture

### Tech Stack

- Next.js 16 (App Router, Server Components by default)
- TypeScript 5 (strict mode)
- Tailwind CSS v4 via PostCSS
- React Query (TanStack) for client-side data fetching
- React Hook Form + Zod for forms and validation
- shadcn/ui for base components

### Folder Structure (target state per implementation plan)

```
src/
  app/
    [locale]/        # fr | en — root segment for all routes (layout, generateStaticParams)
      (public)/       # Public pages — no auth required
      (auth)/         # Login, register, verify
      (agent)/        # Agent dashboard — requireAgent
      (admin)/        # Admin dashboard — requireAdmin
  components/
    ui/             # shadcn/ui base components
    layout/         # Header, Footer, Sidebars, LocaleSwitcher
    listings/       # Listing-specific components
    forms/          # Form components
    shared/         # Reusable utilities
  hooks/            # Custom React hooks
  i18n/             # routing.ts, request.ts, navigation.ts (next-intl config)
  lib/              # api.ts, auth-server.ts, utils.ts, slug.ts
  providers/        # QueryProvider and other React context
  schemas/          # Zod validation schemas (mirror backend DTOs)
  types/            # TypeScript type definitions
messages/           # fr.json, en.json — next-intl translation catalogs
src/proxy.ts        # next-intl locale middleware + JWT cookie read + role-based route protection (Next.js 16 "proxy" convention)
```

### Data Fetching

- All API calls go through a typed `fetch` wrapper in `src/lib/api.ts`
- Prepends `NEXT_PUBLIC_API_URL`; sends `credentials: 'include'` (HttpOnly JWT cookie)
- Standard response envelope: `{ data: T, message: string }`
- Throws typed `ApiError` on non-2xx
- Client components use `useQuery()` with `staleTime: 60_000`, `retry: 1`
- Server components read auth via `src/lib/auth-server.ts` (reads JWT cookie)

### Authentication

- `useAuth()` hook fetches `/auth/me`, returns `null` when unauthenticated
- Proxy (`src/proxy.ts`) reads JWT cookie, redirects unauthenticated users and enforces role access
- Three roles: `PUBLIC_USER`, `AGENT`, `ADMIN`

### Internationalization (next-intl)

- Locales: `fr` (default), `en`. Routing config in `src/i18n/routing.ts` (`localePrefix: "always"`).
- `messages/fr.json` and `messages/en.json` hold namespaced translation strings (e.g. `Nav`, `Home`, `ListingCard`, `PropertyType`, `ListingType`).
- Use `@/i18n/navigation`'s `Link`, `useRouter`, `usePathname`, `redirect`, `getPathname` instead of `next/link` / `next/navigation` — these auto-prefix `/fr` or `/en`.
- Server Components: `await getTranslations("Namespace")` / `getLocale()` from `next-intl/server`.
- Client Components: `useTranslations("Namespace")` / `useLocale()` from `next-intl`.
- `LocaleSwitcher` (`src/components/layout/LocaleSwitcher.tsx`) lets users swap locale while preserving the current path.

### Key Types / Enums

```typescript
UserRole:        PUBLIC_USER | AGENT | ADMIN
ListingStatus:   PENDING_PAYMENT | PENDING | APPROVED | REJECTED | DELETED
PropertyType:    APARTMENT | HOUSE | STUDIO | VILLA | LAND | COMMERCIAL
ListingType:     RENT | SALE
PaymentMethod:   MTN_MOMO | ORANGE_MONEY
```

### Utility Functions (implement in `src/lib/utils.ts`)

- `formatFCFA(amount)` → `"150 000 FCFA"`
- `formatPhone(phone)` → `"+237 6XX XXX XXX"`
- `formatDate(date, locale)` → `"03 juin 2025"` / `"June 3, 2025"` depending on locale (`fr` or `en`, defaults to `fr`)
- `cn(...classes)` — tailwind-merge + clsx

### Performance Conventions

- `next/image` for all listing photos with explicit `sizes` attribute
- ISR on listing detail pages: `export const revalidate = 60`
- `generateMetadata()` on home, browse, and detail pages
- `app/sitemap.ts` — generated from approved listing slugs
- `app/robots.ts` — disallows `/admin` and `/auth` routes

## Environment Variables

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

## Path Alias

`@/*` resolves to `src/` (configured in `tsconfig.json`).

## Testing

- **Unit / component tests**: Vitest + React Testing Library. Config in `vitest.config.mts`, setup in `vitest.setup.ts`. Test files are co-located with source as `*.test.ts` / `*.test.tsx`.
- **E2E tests**: Playwright. Config in `playwright.config.ts`, specs in `e2e/*.spec.ts`. The dev server is started automatically on port 3001.
- Every phase in `FRONTEND_IMPLEMENTATION_PLAN.md` has a **Tests** subsection listing what to cover — write these alongside the phase's implementation, not after.
- Async Server Components are tested by calling them directly and rendering the resolved JSX: `render(await Header())`. Mock `@/lib/auth-server` for auth-dependent components.
- `src/test/i18n.tsx` exports `renderWithIntl(ui)`, which wraps `render` in `<NextIntlClientProvider locale="fr" messages={...}>` — use it for any component that calls `useTranslations`/`useLocale`. `vitest.setup.ts` mocks `next-intl/server` (via `createTranslator` against `messages/fr.json`) and `next/navigation` (`useRouter`/`usePathname` stubs, preserving `redirect`/`permanentRedirect` for `@/i18n/navigation`).
