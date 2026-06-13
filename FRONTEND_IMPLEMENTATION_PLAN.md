# ImmoCM Frontend — Implementation Plan

> Built with Next.js 15 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui, TanStack Query,
> and React Hook Form + Zod. Communicates with the Express backend via the REST API defined
> in `IMPLEMENTATION_PLAN.md`. Bilingual (French + English) via `next-intl`, with locale-prefixed
> routes (`/fr/...`, `/en/...`, default locale `fr`). Route path segments remain in French for
> both locales — only the locale prefix and UI text vary.

---

## Guiding Principles

- **Server Components by default.** Use `"use client"` only for interactive UI (forms, filters, galleries, TanStack Query hooks).
- **ISR for public listing pages.** Listing detail pages are statically generated and revalidated on approval/rejection — fast loads, good SEO.
- **Shared Zod schemas.** Validation schemas live in `src/schemas/` and mirror the backend DTOs exactly, so form errors and API errors speak the same language.
- **API client, not Server Actions.** All data mutations go through the Express REST API. Next.js Server Actions are not used — the backend is the source of truth.
- **Mobile-first.** All public pages must work at 360px width (FR spec). Touch targets ≥ 44×44px.
- **FCFA everywhere.** All prices formatted as `150 000 FCFA` with thousands separator.

---

## Testing Strategy

> Every phase below has a **Tests** subsection. Write tests alongside the phase's implementation —
> a phase isn't considered done until `npm run test:run` and `npm run test:e2e` pass for it.

**Unit / component tests** — Vitest + React Testing Library.
- Config: `vitest.config.mts`, setup: `vitest.setup.ts`.
- Test files are co-located with source as `*.test.ts` / `*.test.tsx`.
- Pure functions (`src/lib/`, `src/schemas/`) get full input/output coverage including edge cases.
- Hooks (`src/hooks/`) are tested with `renderHook`, mocking `src/lib/api.ts`.
- Components are rendered with RTL and asserted on via accessible roles/text, not implementation details.
- Async Server Components are tested by calling them directly and rendering the result:
  `render(await Component())`, mocking `src/lib/auth-server.ts` / `src/lib/api.ts` as needed.
- Components using `useTranslations`/`useLocale` (or async Server Components using
  `getTranslations`/`getLocale`) are rendered with `renderWithIntl` from `src/test/i18n.tsx`,
  which provides `NextIntlClientProvider`. `vitest.setup.ts` mocks `next-intl/server` against
  the real `messages/fr.json` and stubs `next/navigation`'s `useRouter`/`usePathname` for
  `@/i18n/navigation`.

**E2E tests** — Playwright.
- Config: `playwright.config.ts`, specs in `e2e/*.spec.ts`, one spec file per phase
  (e.g. `e2e/phase-1.1-public.spec.ts`).
- The dev server is started automatically on port 3001 (`webServer` in `playwright.config.ts`).
- Cover full user flows: navigation, forms, auth redirects, role-based access.

---

## Phase 0 — Foundation

> Project scaffolding, tooling, and shared infrastructure. No user-visible pages yet.
> Everything built here is reused across all later phases.

### 0.1 Project Setup

Scaffold a new Next.js 15 app inside `apps/web/` (monorepo) or as a standalone project:

```bash
npx create-next-app@latest immo-cm-web \
  --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

Install core dependencies:
```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
npm install react-hook-form @hookform/resolvers zod
npm install axios
npm install lucide-react
npm install clsx tailwind-merge
npm install next-themes
npm install sonner                   # toast notifications
npm install embla-carousel-react     # listing photo gallery
npm install @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-checkbox
npm install date-fns
```

Install shadcn/ui and initialise:
```bash
npx shadcn@latest init
```

Add the shadcn/ui components used across the app:
```bash
npx shadcn@latest add button input label textarea select checkbox badge
npx shadcn@latest add card dialog sheet dropdown-menu separator skeleton
npx shadcn@latest add alert avatar progress tabs pagination
npx shadcn@latest add form table tooltip popover
```

### 0.2 Environment Variables

**`.env.local`:**
```
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

**`.env.example`** — same keys with placeholder values.

### 0.3 API Client (`src/lib/api.ts`)

A typed `fetch` wrapper that:
- Prepends `NEXT_PUBLIC_API_URL` to all paths
- Sends `credentials: 'include'` on every request (JWT lives in HttpOnly cookie)
- Parses the standard `{ data, message }` envelope
- Throws a typed `ApiError` with `status` and `message` on non-2xx
- Provides `api.get()`, `api.post()`, `api.patch()`, `api.delete()` helpers

```ts
// Usage
const listings = await api.get<Listing[]>('/listings', { params: filters });
const listing  = await api.post<Listing>('/agent/listings', formData);
```

### 0.4 TanStack Query Setup (`src/providers/query-provider.tsx`)

```tsx
"use client";
export function QueryProvider({ children }) {
  const [client] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 60_000, retry: 1 } }
  }));
  return (
    <QueryClientProvider client={client}>
      {children}
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}
```

Wrap `app/layout.tsx` with `<QueryProvider>`.

### 0.5 Auth State (`src/hooks/use-auth.ts`)

```ts
// Fetches /auth/me — returns null if not authenticated
export function useAuth() {
  return useQuery({ queryKey: ['me'], queryFn: () => api.get('/auth/me'), retry: false });
}
```

A separate `src/lib/auth-server.ts` reads the JWT cookie in Server Components via `cookies()` for server-side auth checks.

### 0.6 Route Protection (`middleware.ts`)

Next.js middleware runs on the Edge. It reads the JWT cookie and redirects:
- Unauthenticated requests to `/agent/*` or `/admin/*` → `/login`
- Authenticated agents visiting `/admin/*` → `/dashboard`
- Authenticated admins visiting `/agent/*` → `/admin/dashboard`
- Authenticated users visiting `/login` or `/register` → their respective dashboard

### 0.7 Folder Structure

```
src/
  app/
    [locale]/          — fr | en, root segment for all routes
      (public)/          — public pages, no auth required
      (auth)/            — login/register/verify, redirects if already logged in
      (agent)/           — agent dashboard, requireAgent
      (admin)/           — admin dashboard, requireAdmin
      layout.tsx         — root layout: NextIntlClientProvider, QueryProvider, Toaster
      not-found.tsx
      error.tsx

  i18n/                — routing.ts, request.ts, navigation.ts (next-intl config)

  components/
    ui/                — shadcn/ui base components (auto-generated)
    layout/            — Header, Footer, Sidebar, MobileNav
    listings/          — ListingCard, ListingGrid, ListingFilters, ListingGallery,
                         ContactSection, AmenitiesList, StatusBadge
    forms/             — ListingForm, AuthForm field groups
    shared/            — ConfirmModal, RejectModal, Pagination, EmptyState,
                         LoadingSkeleton, NotificationBell, PriceDisplay

  hooks/
    use-auth.ts
    use-listings.ts
    use-notifications.ts
    use-cities.ts

  lib/
    api.ts             — typed fetch wrapper
    auth-server.ts     — server-side cookie read
    utils.ts           — cn(), formatFCFA(), formatPhone(), formatDate()
    slug.ts            — listing URL builder

  providers/
    query-provider.tsx

  schemas/             — Zod schemas mirroring backend DTOs
    auth.schema.ts
    listing.schema.ts
    user.schema.ts

  types/
    api.ts             — response envelope types
    listing.ts         — Listing, ListingImage, ListingStatus, etc.
    user.ts            — User, UserRole, UserStatus
    filters.ts         — ListingFilters, AdminListingFilters
```

### 0.8 Shared Utilities

**`src/lib/utils.ts`**
```ts
formatFCFA(amount: number): string   // 150000 → "150 000 FCFA"
formatPhone(phone: string): string   // "+2376XXXXXXXX" → "+237 6XX XXX XXX"
formatDate(date: string): string     // ISO → "03 juin 2025"
cn(...classes): string               // tailwind-merge + clsx
```

**`src/components/shared/PriceDisplay.tsx`** — renders a price with FCFA and optional period label (Mensuel / Annuel / Négociable).

### 0.9 Global Layout (`src/components/layout/`)

**`Header`** — logo, nav links (Accueil, Annonces, Mettre une annonce), notification bell (if logged in), user menu / login button.

**`Footer`** — links to About, Contact, Terms & Privacy, platform name + tagline.

Both are Server Components. The notification bell is a Client Component that calls `useNotifications()`.

### 0.10 TypeScript Types & Enums

All types mirror the backend exactly. These are the canonical type definitions for every API response shape the frontend will consume. Place them in the `src/types/` directory.

#### `src/types/enums.ts`

```ts
export enum UserRole        { PUBLIC_USER = 'PUBLIC_USER', AGENT = 'AGENT', ADMIN = 'ADMIN' }
export enum UserAccountType { AGENT = 'AGENT', LANDLORD = 'LANDLORD' }
export enum UserStatus      { ACTIVE = 'ACTIVE', SUSPENDED = 'SUSPENDED', BANNED = 'BANNED' }

export enum ListingType   { RENT = 'RENT', SALE = 'SALE' }
export enum PropertyType  { APARTMENT = 'APARTMENT', HOUSE = 'HOUSE', STUDIO = 'STUDIO', VILLA = 'VILLA', LAND = 'LAND', COMMERCIAL = 'COMMERCIAL' }
export enum ListingStatus { PENDING_PAYMENT = 'PENDING_PAYMENT', PENDING = 'PENDING', APPROVED = 'APPROVED', REJECTED = 'REJECTED', DELETED = 'DELETED' }
export enum PaymentPeriod { MONTHLY = 'MONTHLY', YEARLY = 'YEARLY', NEGOTIABLE = 'NEGOTIABLE' }

export enum PaymentMethod  { MTN_MOMO = 'MTN_MOMO', ORANGE_MONEY = 'ORANGE_MONEY' }
export enum PaymentStatus  { PENDING = 'PENDING', COMPLETED = 'COMPLETED', FAILED = 'FAILED', EXPIRED = 'EXPIRED' }
export enum RevealMethod   { MTN_MOMO = 'MTN_MOMO', ORANGE_MONEY = 'ORANGE_MONEY', FREE = 'FREE' }

export enum NotificationType {
  LISTING_APPROVED    = 'LISTING_APPROVED',
  LISTING_REJECTED    = 'LISTING_REJECTED',
  NEW_PENDING_LISTING = 'NEW_PENDING_LISTING',
  PAYMENT_RECEIVED    = 'PAYMENT_RECEIVED',
  PAYMENT_EXPIRED     = 'PAYMENT_EXPIRED',
  CONTACT_REVEALED    = 'CONTACT_REVEALED',
}

export enum SubscriptionType   { AGENT_PRO = 'AGENT_PRO', USER_UNLIMITED_REVEALS = 'USER_UNLIMITED_REVEALS' }
export enum SubscriptionStatus { ACTIVE = 'ACTIVE', CANCELLED = 'CANCELLED', EXPIRED = 'EXPIRED' }
```

#### `src/types/user.ts`

Mirrors `User.toResponse()` in `src/entities/user.entity.ts`. Password fields are never sent to the client.

```ts
import type { UserRole, UserAccountType, UserStatus } from './enums';

export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  fullName: string;
  phone: string;
  whatsapp: string | null;
  role: UserRole;
  accountType: UserAccountType | null;
  status: UserStatus;
  profilePhoto: string | null;
  createdAt: string;   // ISO date string (Date serialised to JSON)
  updatedAt: string;
}
```

#### `src/types/listing.ts`

Mirrors `Listing.toResponse()` in `src/entities/listing.entity.ts`.

```ts
import type { ListingType, PropertyType, ListingStatus, PaymentPeriod } from './enums';

export interface ListingImage {
  id: string;
  url: string;
  storageKey: string;
  order: number;
}

export interface ListingAmenity {
  id: string;
  label: string;
  slug: string;
}

export interface Listing {
  id: string;
  referenceId: string;             // format: "IMM-YYYY-NNNNN"
  slug: string;
  title: string;
  description: string;
  listingType: ListingType;
  propertyType: PropertyType;
  status: ListingStatus;
  price: number;                   // integer, FCFA
  paymentPeriod: PaymentPeriod | null;
  bedrooms: number | null;
  bathrooms: number | null;
  areaM2: number | null;
  address: string | null;
  agentPhone?: string;             // only present when contact is revealed / free phase
  agentWhatsapp?: string | null;   // only present when contact is revealed / free phase
  rejectionReason: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  cityId: string;
  neighborhoodId: string;
  cityName?: string;
  neighborhoodName?: string;
  images: ListingImage[];
  amenities: ListingAmenity[];
}

export interface PaginatedListings {
  data: Listing[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

#### `src/types/filters.ts`

```ts
import type { ListingType, PropertyType, ListingStatus } from './enums';

export interface ListingFilters {
  cityId?: string;
  neighborhoodId?: string;
  listingType?: ListingType;
  propertyType?: PropertyType;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  search?: string;
  sort?: 'price_asc' | 'price_desc' | 'oldest';   // default: newest
  page?: number;
  limit?: number;
}

export interface AgentListingFilters {
  status?: ListingStatus;
  page?: number;
  limit?: number;
}

export interface AdminListingFilters {
  status?: ListingStatus;
  cityId?: string;
  agentId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}
```

#### `src/types/reference.ts`

Mirrors `CityWithNeighborhoods` and `AmenityRow` from `src/interfaces/cities.interface.ts`.

```ts
export interface Neighborhood {
  id: string;
  name: string;
}

export interface City {
  id: string;
  name: string;
  slug: string;
  neighborhoods: Neighborhood[];
}

export interface Amenity {
  id: string;
  label: string;
  slug: string;
}
```

#### `src/types/notification.ts`

Mirrors `NotificationRow` from `src/interfaces/notifications.interface.ts`.

```ts
import type { NotificationType } from './enums';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: string;
  userId: string;
  listingId: string | null;
}
```

#### `src/types/payment.ts`

Mirrors `ListingPaymentRow`, `ContactRevealRow`, and `SubscriptionRow` from their respective interfaces.

```ts
import type { PaymentMethod, PaymentStatus, RevealMethod, SubscriptionType, SubscriptionStatus } from './enums';

export interface ListingPayment {
  id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  externalRef: string | null;
  initiatedAt: string;
  completedAt: string | null;
  listingId: string;
  agentId: string;
}

export interface ContactReveal {
  id: string;
  amount: number;
  method: RevealMethod;
  externalRef: string | null;
  createdAt: string;
  listingId: string;
  userId: string;
}

export interface UserSubscription {
  id: string;
  type: SubscriptionType;
  status: SubscriptionStatus;
  amount: number;
  method: PaymentMethod;
  startDate: string;
  endDate: string;
  renewedAt: string | null;
  externalRef: string | null;
  createdAt: string;
  userId: string;
}

// Shapes returned by the payment initiation endpoints
export interface InitiatePaymentResponse {
  externalRef: string;
  amount: number;
  method: PaymentMethod;
}

export interface InitiateSubscriptionResponse {
  externalRef: string;
  amount: number;
  method: PaymentMethod;
  type: SubscriptionType;
}
```

#### `src/types/api.ts`

```ts
// Standard backend response envelope: { data, message }
export interface ApiResponse<T> {
  data: T;
  message: string;
}

export interface ApiError {
  message: string;
  status: number;
}

// GET /admin/revenue response shape
export interface RevenueData {
  totalRevenue: number;
  listingFeeRevenue: number;
  contactRevealRevenue: number;
  contactRevealsThisMonth: number;
  paidListingsThisMonth: number;
  activeAgentSubscriptions: number;
  activeUserSubscriptions: number;
}
```

#### `src/types/config.ts` (Phase 2)

Mirrors the `PlatformConfig` model (key–value pairs).

```ts
export interface PlatformConfig {
  key: string;
  value: string;
}

export type PlatformConfigKey =
  | 'monetization_enabled'        // 'true' | 'false'
  | 'contact_reveal_fee'          // integer string, e.g. '500'
  | 'listing_fee_type'            // 'per_listing' | 'subscription'
  | 'listing_fee_amount'          // integer string
  | 'listing_subscription_price'  // integer string
  | 'contact_subscription_price'  // integer string
  | 'agent_pro_fee'               // integer string
  | 'user_unlimited_reveals_fee'; // integer string

export interface ParsedPlatformConfig {
  monetizationEnabled: boolean;
  contactRevealFee: number;
  listingFeeType: 'per_listing' | 'subscription';
  listingFeeAmount: number;
  listingSubscriptionPrice: number;
  contactSubscriptionPrice: number;
  agentProFee: number;
  userUnlimitedRevealsFee: number;
}
```

### Phase 0 — Tests ✅

- `src/lib/utils.test.ts` — `formatFCFA`, `formatPhone`, `formatDate`, `cn`
- `src/lib/api.test.ts` — request URL/query building, JSON vs `FormData` bodies, `ApiError` on non-2xx responses
- `src/proxy.test.ts` — `decodeRole`, `dashboardFor`, and the full `proxy()` redirect matrix (unauthenticated, agent, admin, auth pages)
- `src/components/layout/Header.test.tsx` — nav links, login link vs. user menu, role-based dashboard link (mocks `@/lib/auth-server`)
- `src/components/layout/Footer.test.tsx` — static page links
- `src/components/shared/PriceDisplay.test.tsx` — price formatting with and without a payment period
- `e2e/phase-0-layout.spec.ts` — header/footer render on the home page; unauthenticated users are redirected away from `/agent/*` and `/admin/*`

---

## Phase 1 — MVP (Free Phase)

> Every user-facing feature for the free launch. Agent contacts are always visible.
> Monetization UI is not rendered when `monetization_enabled = false`.

---

### Phase 1.1 — Public Website

#### Home Page (`app/[locale]/(public)/page.tsx`)

Sections:
1. **Hero** — full-width background image, headline, and the search bar
2. **Search Bar** — city `<Select>`, property type `<Select>`, listing type toggle (Louer / Acheter), "Rechercher" button. Submits to `/annonces?city=...&propertyType=...&listingType=...`
3. **Featured Listings** — grid of the 6 most recently approved listings (fetched server-side via `fetch('/listings?limit=6')` with `next: { revalidate: 300 }`)
4. **Agent CTA** — banner: "Vous avez un bien à louer ou à vendre ? Publiez votre annonce gratuitement."

The search bar is a `"use client"` component; the rest of the page is a Server Component.

#### Listings Browse Page (`app/[locale]/(public)/annonces/page.tsx`)

Layout: filter sidebar (desktop) / filter sheet (mobile) + listing grid.

**Filters (left sidebar / bottom sheet on mobile):**
- Ville: Douala / Yaoundé (radio)
- Quartier: dropdown populated from `GET /cities` (updates when city changes)
- Type d'annonce: Louer / Acheter (toggle)
- Type de bien: Appartement / Maison / Studio / Villa / Terrain / Commercial (checkboxes)
- Prix: min/max FCFA inputs
- Chambres: 1 / 2 / 3 / 4+ (radio)

**Sort bar:** "Trier par" — Plus récent / Prix croissant / Prix décroissant.

**Listing grid:** 20 cards per page (FR21). Standard `<Pagination>` component at the bottom.

**Data fetching:** Initial load is a Server Component (`searchParams` → `fetch('/listings?...')`). Filter/sort changes update URL search params and trigger a navigation — no client-side state needed.

**`ListingCard` component:**
- Primary photo (Next.js `<Image>`, WebP, lazy)
- Property type badge + listing type badge (Louer / Vendre)
- Price (formatted FCFA + period if rent)
- City & neighborhood
- Bedrooms count
- Date posted
- Hover state with subtle elevation

#### Listing Detail Page (`app/[locale]/(public)/annonces/[slug]/page.tsx`)

Rendered with ISR: `revalidate: 60`. Revalidated on-demand when admin approves or rejects.

Sections:
1. **Photo Gallery** — Embla Carousel with thumbnail strip; touch swipe on mobile; lightbox on click
2. **Header** — title, listing type badge, reference ID (`IMM-YYYY-NNNNN`), date posted
3. **Price block** — price in FCFA, payment period if rent
4. **Key details grid** — property type, bedrooms, bathrooms, area m², city, neighborhood
5. **Address** — textual landmark (e.g. "Près du Total Bonamoussadi")
6. **Description** — full text, expanded by default
7. **Amenities** — icon + label chips (Parking, Groupe électrogène, etc.)
8. **Agent Contact Section** — see `ContactSection` component below
9. **Related Listings** — 3–4 cards from the same neighborhood or similar price

**`ContactSection` component** (`"use client"`):

Free phase behaviour (always visible in Phase 1):
```
📞  +237 6XX XXX XXX   [Appeler]
💬  WhatsApp           [Écrire sur WhatsApp]  → deep link
```

Phase 2 behaviour (hidden behind payment gate) is built as a separate variant but not rendered until `monetization_enabled = true` (Phase 2.3).

#### Search Results Page (`app/[locale]/(public)/annonces/recherche/page.tsx`)

Identical layout to the browse page but driven by `?q=` full-text search param plus any active filters. The search input in the header populates this page.

#### Static Pages

- `app/[locale]/(public)/a-propos/page.tsx` — About / mission
- `app/[locale]/(public)/contact/page.tsx` — contact form + WhatsApp support link
- `app/[locale]/(public)/mentions-legales/page.tsx` — Terms & Privacy

### Phase 1.1 — Tests

- `src/components/listings/ListingCard.test.tsx` — renders photo, status/type badges, price, neighborhood/city, bedroom count, formatted date; rendered with `renderWithIntl` (`src/test/i18n.tsx`) and asserts locale-prefixed (`/fr/...`) hrefs
- `src/components/listings/ListingFilters.test.tsx` — changing a filter updates the URL search params (locale-prefixed, e.g. `/fr/annonces?...`); active filters reflect the current URL
- `src/components/shared/ContactSection.test.tsx` (free-phase variant) — renders formatted phone, `tel:` link, and WhatsApp deep link
- Home page search bar component — submitting navigates to `/fr/annonces/recherche?q=...`
- Async Server Components (`Header`, `Footer`, `ListingResultsPage`, static pages) — `next-intl/server` is mocked via `createTranslator` against `messages/fr.json` in `vitest.setup.ts`; rendered with `renderWithIntl(await Component())`
- `e2e/phase-1.1-public.spec.ts` (all routes locale-prefixed, default locale `fr`):
  - `/` redirects to `/fr`
  - Home page (`/fr`) renders hero, search bar, and featured listings
  - Search bar submission navigates to `/fr/annonces/recherche?q=...` with the correct query
  - Browse page (`/fr/annonces`): applying a filter updates the URL and the listed results; pagination changes the page
  - Listing detail page: gallery, price, and contact section are visible; related listings render
  - Static pages (`/fr/a-propos`, `/fr/contact`, `/fr/mentions-legales`) render with the expected title and content

---

### Phase 1.2 — Auth Pages

All auth pages live in the `(auth)` route group. Middleware redirects authenticated users away from these pages.

#### Register (`app/(auth)/inscription/page.tsx`)

Form fields (React Hook Form + `registerSchema`):
- Nom complet (required)
- Email (required)
- Téléphone — validated against Cameroon format `+237 6XX XXX XXX`
- WhatsApp (optional, pre-fills from phone)
- Type de compte: Agent / Propriétaire (radio)
- Mot de passe (min 8 chars, at least one letter + one digit)
- Confirmer le mot de passe

On success: show "Vérifiez votre email" message; do not auto-login until verified.

#### Login (`app/(auth)/connexion/page.tsx`)

Email + password form. On success: redirect to `/tableau-de-bord` (agent) or `/admin/tableau-de-bord` (admin) based on the `role` returned in `/auth/me`.

#### Email Verification (`app/(auth)/verify-email/[token]/page.tsx`)

Server Component. Calls `GET /auth/verify-email/:token` on render.
- Success → "Email vérifié ! Vous pouvez maintenant vous connecter." + link to login
- Expired/invalid → "Lien invalide ou expiré." + button to resend

#### Forgot Password (`app/(auth)/mot-de-passe-oublie/page.tsx`)

Single email input. On submit: shows "Si un compte existe, un lien de réinitialisation a été envoyé." (never reveal whether email exists).

#### Reset Password (`app/(auth)/reinitialiser-mot-de-passe/page.tsx`)

Reads `?token=` from URL. New password + confirm password form. On success → redirect to login with success toast.

### Phase 1.2 — Tests

- `src/schemas/auth.schema.test.ts` — `registerSchema`, `loginSchema`, `resetPasswordSchema`: valid payloads pass; invalid email, weak password, mismatched confirm-password, and bad phone format are rejected with the expected messages
- Component tests for each form: required-field errors render on blur/submit; password mismatch shows an error; submit button disables while pending
- `e2e/phase-1.2-auth.spec.ts`:
  - Register flow: fill form, submit, see "Vérifiez votre email"
  - Login flow: invalid credentials show an error toast; valid credentials redirect based on role (agent → `/agent/tableau-de-bord`, admin → `/admin/tableau-de-bord`)
  - Email verification: valid token shows success message + login link; invalid/expired token shows resend option
  - Forgot password: shows the generic confirmation message regardless of whether the email exists
  - Reset password: token-based form submits and redirects to login with a success toast
  - An authenticated user visiting `/connexion` or `/inscription` is redirected to their dashboard (extends the proxy coverage from Phase 0)

---

### Phase 1.3 — Agent Dashboard

Route group: `(agent)`. All pages in this group require `role = AGENT`.

Layout (`app/(agent)/layout.tsx`):
- Left sidebar with nav: Tableau de bord / Mes annonces / Nouvelle annonce / Notifications / Profil
- Collapsed to bottom tab bar on mobile
- User avatar + name at top of sidebar

#### Dashboard Home (`app/(agent)/tableau-de-bord/page.tsx`)

Four stat cards (fetched server-side):
- Total annonces
- En attente
- Approuvées
- Rejetées

Quick action button: "Publier une nouvelle annonce"

Recent activity feed: last 5 status changes on the agent's listings (from notifications).

#### My Listings (`app/(agent)/mes-annonces/page.tsx`)

Table / card list (client component, TanStack Query) of all the agent's listings.

Columns: Photo thumbnail, Title, Neighbourhood, Price, Status badge, Date, Actions.

**Status badges:**
- `PENDING` → yellow "En attente"
- `APPROVED` → green "Approuvée"
- `REJECTED` → red "Rejetée"
- `PENDING_PAYMENT` → orange "Paiement requis" (Phase 2 only)

**Filter tabs:** Toutes / En attente / Approuvées / Rejetées.

**Per-row action buttons:**
- Voir (always)
- Modifier (if PENDING or REJECTED)
- Supprimer (always) → confirmation modal
- Soumettre à nouveau (if REJECTED) → confirmation modal

#### Create Listing (`app/(agent)/annonces/nouvelle/page.tsx`)

Multi-section form (single page, not multi-step wizard) with sticky section headers.

Sections and fields:

**1 — Type d'annonce**
- Titre (text, required)
- Type d'annonce: Louer / Vendre (toggle)
- Type de bien: Appartement / Maison / Studio / Villa / Terrain / Commercial (radio group)

**2 — Localisation**
- Ville (select: Douala / Yaoundé)
- Quartier (select, populated from `/cities` based on chosen city)
- Adresse / Repère (text, optional)

**3 — Prix**
- Prix en FCFA (number input with thousands formatting)
- Période de paiement (if Louer): Mensuel / Annuel / Négociable

**4 — Détails**
- Chambres (number, optional)
- Salles de bain (number, optional)
- Surface m² (number, optional)

**5 — Description**
- Textarea (min 50 characters, live character count)

**6 — Équipements**
- Multi-select checkbox grid from `/amenities`

**7 — Photos**
- Drag-and-drop upload area (min 1, max 10; JPEG/PNG; max 5 MB each)
- Preview grid with reorder (drag) and remove button per photo
- First photo is marked as cover photo
- Client-side size/type validation before submit

**8 — Contact**
- Téléphone (pre-filled from profile, editable)
- WhatsApp (pre-filled, optional)

**Submit behaviour (free phase):** POST to `/agent/listings` as `multipart/form-data`. On success → redirect to `/mes-annonces` with toast: "Annonce soumise avec succès — en attente de validation."

Validation: React Hook Form + `createListingSchema` (Zod). Inline field errors as user types.

#### Edit Listing (`app/(agent)/annonces/[id]/modifier/page.tsx`)

Same form as Create, pre-filled with existing listing data. Only accessible when `status = PENDING` or `status = REJECTED`.

If editing an `APPROVED` listing, show a warning banner before the form: "Modifier cette annonce approuvée la retirera du site jusqu'à une nouvelle validation."

#### Agent Profile (`app/(agent)/profil/page.tsx`)

Two cards side by side (stacked on mobile):
- **Informations personnelles** — full name, phone, WhatsApp, account type; save button
- **Sécurité** — change password form (current + new + confirm)

### Phase 1.3 — Tests

- `src/schemas/listing.schema.test.ts` — `createListingSchema`: required fields, min description length, price/area must be positive numbers, photo count limits
- `src/components/listings/PhotoUploader.test.tsx` — accepted file types, max file count/size validation, preview grid renders, reorder updates order
- Dashboard stat cards render counts from the API response
- "Mes annonces" table: status filter tabs, status badges, per-row actions shown/hidden based on `status` (e.g. resubmit only for `REJECTED`)
- `e2e/phase-1.3-agent.spec.ts`:
  - Agent logs in and sees dashboard stats
  - Create listing: fill every section, upload photos, submit → redirected to `/agent/mes-annonces` with a success toast and the new listing in `PENDING` status
  - Edit a `PENDING`/`REJECTED` listing: form is pre-filled; editing an `APPROVED` listing shows the warning banner
  - Delete and resubmit flows require confirmation
  - Profile: update personal info and change password

---

### Phase 1.4 — Admin Dashboard

Route group: `(admin)`. All pages require `role = ADMIN`.

Layout (`app/(admin)/layout.tsx`):
- Left sidebar: Tableau de bord / Annonces en attente / Toutes les annonces / Utilisateurs / Contenu / [Paramètres (Phase 2)]
- Desktop-optimised (sidebar always visible); responsive for mobile

#### Dashboard Overview (`app/(admin)/tableau-de-bord/page.tsx`)

Stat cards:
- Annonces en attente (highlighted, with badge)
- Total annonces approuvées
- Total annonces rejetées
- Agents inscrits
- Nouveaux agents cette semaine

CTA: "Voir les annonces en attente" button linking to the review queue.

#### Pending Review Queue (`app/(admin)/annonces/en-attente/page.tsx`)

Table of all `PENDING` listings sorted by oldest first (FR12).

Columns: Reference ID, Title, Agent, Neighbourhood, Price, Submitted date, Actions.

Actions: Voir / Approuver (inline quick action) / Rejeter (opens modal).

#### All Listings (`app/(admin)/annonces/page.tsx`)

Full listings table with all statuses.

**Filters (top bar):**
- Status (dropdown: all / pending / approved / rejected / deleted)
- Ville (select)
- Type d'annonce (select)
- Type de bien (select)
- Date range (from / to)
- Agent name (text search)
- Reference ID / title search

**Bulk actions** (when rows selected): Approve all / Reject all / Delete all (with confirmation modals).

**Per-row actions:** Voir / Modifier / Approuver / Rejeter / Supprimer.

#### Listing Detail & Review (`app/(admin)/annonces/[id]/page.tsx`)

Split layout: left = full listing preview (exactly as it appears publicly, inside a device frame), right = admin action panel.

**Action panel:**
- "Approuver" button → confirmation modal ("Êtes-vous sûr ? L'annonce sera publiée immédiatement.")
- "Rejeter" button → modal with mandatory textarea (min 10 chars) for rejection reason (FR14)
- "Modifier" button → opens listing edit form (admin can fix before approving)
- "Supprimer" button → confirmation modal with reason

Status history timeline at the bottom of the action panel (from `ListingStatusLog`).

#### User Management (`app/(admin)/utilisateurs/page.tsx`)

Table of all agents/landlords.

Columns: Name, Email, Phone, Account type, Listings count, Status badge, Joined date, Actions.

**Actions per user:** Voir profil / Suspendre / Réactiver / Supprimer.

**`Suspendre` flow:** confirmation modal explaining that approved listings will be hidden.

#### Content Management

**Quartiers (`app/(admin)/contenu/quartiers/page.tsx`):**
- Two-column layout: Douala | Yaoundé
- List of neighborhoods per city with edit (inline rename) and delete buttons
- "Ajouter un quartier" input at the bottom of each list

**Équipements (`app/(admin)/contenu/equipements/page.tsx`):**
- Table of amenity labels + slugs
- Inline edit + delete
- "Ajouter un équipement" form

### Phase 1.4 — Tests

- `src/schemas/moderation.schema.test.ts` — rejection reason validation (required, min length ~10 chars)
- Pending review queue: rows render sorted oldest-first; approve/reject actions are present
- All-listings table: status/type/city filters narrow the result set
- User management table: action buttons present per row; suspend opens a confirmation modal
- Content management: add/edit/delete neighborhood and amenity rows update the list optimistically
- `e2e/phase-1.4-admin.spec.ts`:
  - Admin logs in and sees dashboard stats
  - Approve a pending listing → status becomes `APPROVED`, listing visible publicly
  - Reject a listing with a reason → status becomes `REJECTED`, reason is shown to the agent
  - Suspend and reactivate a user
  - Content management: add and delete a neighborhood and an amenity

---

### Phase 1.5 — Notifications

**`NotificationBell` component** (`src/components/shared/NotificationBell.tsx`) — `"use client"`:
- Bell icon in the header with unread count badge
- Polling: TanStack Query `refetchInterval: 30_000`
- Opens a dropdown showing the last 5 notifications on click
- Each item: icon by type, message, time ago, listing link
- "Voir tout" link at the bottom, "Tout marquer comme lu" button

**Notifications Page (`app/(agent)/notifications/page.tsx`):**
- Full list of all notifications, unread first
- Mark all as read button at the top
- Each row: notification icon + message + date + "marquer comme lu" button

### Phase 1.5 — Tests

- `NotificationBell.test.tsx` — unread badge count renders correctly; dropdown lists the latest notifications; polling triggers a refetch (use fake timers with `vi.useFakeTimers()`)
- Notifications page: "marquer comme lu" updates a single row; "tout marquer comme lu" clears the unread badge
- `e2e/phase-1.5-notifications.spec.ts` — after an admin approves/rejects a listing, the agent's notification bell shows an unread badge and the notification appears in the list

---

### Phase 1.6 — Shared Components

These are used across multiple phases and routes:

**`ConfirmModal`** — generic confirm/cancel dialog. Props: `title`, `description`, `onConfirm`, `danger?`.

**`RejectModal`** — extends `ConfirmModal` with a required textarea for the rejection reason. Enforces min 10 chars before enabling confirm.

**`StatusBadge`** — maps `ListingStatus` to colour + French label.

**`EmptyState`** — full-width placeholder for empty tables/grids. Props: `icon`, `title`, `description`, `action?`.

**`LoadingSkeleton`** — card-shaped and row-shaped skeletons for listing grids and tables.

**`Pagination`** — controlled component using URL search params. Works with server-side pagination.

**`PhotoUploader`** — drag-and-drop zone, preview grid, reorder support, client-side validation. Used in listing create/edit forms.

### Phase 1.6 — Tests

- `ConfirmModal.test.tsx` / `RejectModal.test.tsx` — opens/closes via props; confirm button is disabled until the rejection reason reaches the min length; `danger` styling applied when set
- `StatusBadge.test.tsx` — every `ListingStatus` value maps to the expected label and color class
- `EmptyState.test.tsx` — renders icon, title, description, and optional action
- `LoadingSkeleton.test.tsx` — renders the expected number/shape of skeleton placeholders for card vs. row variants
- `Pagination.test.tsx` — clicking next/previous/page-number updates the `page` URL search param; disables prev/next at the bounds
- `PhotoUploader.test.tsx` — covered under Phase 1.3 — Tests

---

### Phase 1.7 — SEO & Performance

**Metadata (`generateMetadata`) on key pages:**
- Home — title: "ImmoCM — Trouvez votre maison à Douala et Yaoundé"
- Listings browse — dynamic: city + property type in title
- Listing detail — title from listing, description from first 160 chars of listing description, `og:image` from cover photo

**`next/image` everywhere** — all listing photos use `<Image>` with `sizes` attribute for responsive loading. Cover photo uses `priority` on the detail page.

**Sitemap (`app/sitemap.ts`)** — generates entries for all approved listing slugs + static pages. Fetches slugs from the API.

**Robots (`app/robots.ts`)** — disallow `/admin/*`, `/tableau-de-bord/*`, `/connexion`, `/inscription`.

### Phase 1.7 — Tests

- `generateMetadata` for home, browse, and detail pages — call the function directly with mock params/data and assert on the returned `title`, `description`, and `openGraph.images`
- `app/sitemap.ts` — mocks the API and asserts entries are generated for approved listing slugs plus all static pages
- `app/robots.ts` — asserts `/admin`, `/tableau-de-bord`, `/connexion`, `/inscription` are disallowed
- Component test confirms listing images render via `next/image` with a non-empty `sizes` attribute, and the detail page's cover photo has `priority`

---

## Phase 2 — Growth (Paid Phase)

> All UI here is gated behind `monetization_enabled = true`. The public and agent UIs
> detect this from a `/admin/config` endpoint (cached in TanStack Query). No code changes
> are needed to toggle the phase — the backend flag drives which UI variants render.

---

### Phase 2.1 — Monetization Detection

Create a `usePlatformConfig()` hook that fetches `/admin/config` (public read) and returns
`{ monetizationEnabled, contactRevealFee, listingFeeAmount, ... }`.

Cache with `staleTime: 5 * 60 * 1000` — revalidates every 5 minutes.

### Phase 2.1 — Tests

- `usePlatformConfig.test.ts` — mocks `/admin/config`, asserts the parsed shape (`monetizationEnabled`, `contactRevealFee`, `listingFeeAmount`, etc.) and `staleTime: 5 * 60 * 1000`
- Component tests for any UI that conditionally renders based on `monetizationEnabled` — mock the hook to return `true`/`false` and assert the correct variant renders

---

### Phase 2.2 — Listing Fee Payment Flow (Agents)

When `monetizationEnabled = true`, listing creation redirects to a payment page instead of directly to "en attente".

**Payment Page (`app/(agent)/annonces/[id]/paiement/page.tsx`):**
- Shows: listing title, fee amount in FCFA
- Payment method selection: MTN Mobile Money / Orange Money (radio + icon)
- Phone number input (pre-filled from profile)
- "Payer [amount] FCFA" button → calls `POST /payments/listing/:id/initiate`

**Polling (`app/(agent)/annonces/[id]/paiement/statut/page.tsx`):**
- Polls `GET /payments/listing/:id/status` every 5 seconds
- States: waiting → processing → success (redirect to dashboard) / failed / expired (retry button)

If agent revisits a `PENDING_PAYMENT` listing from their dashboard, the "Finaliser le paiement" CTA links directly to the payment page.

### Phase 2.2 — Tests

- Payment page: renders the listing title and fee amount in FCFA; selecting a payment method and entering a phone number enables the submit button; submit calls `POST /payments/listing/:id/initiate` with the correct payload
- Status polling page: starting from `waiting`, mocked responses drive transitions to `processing` → `success` (redirects to dashboard), `failed`, and `expired` (shows retry button) — use `vi.useFakeTimers()` to advance the 5s poll interval
- `e2e/phase-2.2-listing-payment.spec.ts` — full create-listing → payment → status flow with a mocked payment API, covering both the success and failed/retry paths
- A `PENDING_PAYMENT` listing on the agent dashboard shows a "Finaliser le paiement" CTA linking to the payment page

---

### Phase 2.3 — Contact Reveal Flow (Public Users)

**`ContactSection` phase-2 variant:**

Replaces the always-visible phone/WhatsApp display with:
```
[📞 Numéro masqué]  [💬 WhatsApp masqué]
[Voir le contact — 500 FCFA]
```

On "Voir le contact" click:
1. If not logged in → open `AuthModal` (lightweight email + password form; create account or login)
2. If logged in, no reveal yet → open `RevealPaymentModal`
3. If logged in, already revealed → contact is shown directly (checked via `hasRevealed`)

**`RevealPaymentModal`:**
- Fee amount + payment method selection + phone input
- "Payer [fee] FCFA" → calls `POST /payments/reveal/:listingId/initiate`
- Polls status; on confirmation → contact section updates in place without page reload

**`AuthModal`** — lightweight modal for public user registration/login (email + password only).

### Phase 2.3 — Tests

- `ContactSection.test.tsx` (phase-2 variant) — masked contact + "Voir le contact" CTA render; clicking it opens `AuthModal` when logged out, `RevealPaymentModal` when logged in without a reveal, and shows the contact directly when `hasRevealed` is true
- `AuthModal.test.tsx` — switching between login/register tabs; submitting calls the correct endpoint
- `RevealPaymentModal.test.tsx` — fee amount and payment method/phone inputs render; submit calls `POST /payments/reveal/:listingId/initiate`; on confirmed status the modal closes and the contact section updates without a page reload
- `e2e/phase-2.3-contact-reveal.spec.ts` — covers the reveal flow for each auth state: logged out (auth modal), logged in without reveal (payment modal + mocked payment success), and already revealed (contact shown immediately)

---

### Phase 2.4 — Admin Monetization Settings

**Settings Page (`app/(admin)/parametres/monetisation/page.tsx`):**

- Toggle switch: "Mode de monétisation" (Gratuit ↔ Payant) with a warning banner: "Activer le mode payant affecte immédiatement tous les utilisateurs."
- Confirmation modal on toggle with typed confirmation ("ACTIVER")
- Fee configuration form:
  - Frais de révélation de contact (FCFA)
  - Modèle de frais d'annonce: Par annonce / Abonnement (radio)
  - Montant par annonce (FCFA)
  - Prix abonnement agent mensuel (FCFA)
  - Prix abonnement utilisateur mensuel (FCFA)
- Save button → PATCH `/admin/config`

### Phase 2.4 — Tests

- `src/schemas/platform-config.schema.test.ts` — fee fields must be positive integers and required; subscription model radio constrains which fee fields are required
- Settings page: toggling monetization opens the confirmation modal; the save/confirm action is disabled until "ACTIVER" is typed exactly
- Saving the form calls `PATCH /admin/config` with the updated values; success shows a confirmation toast
- `e2e/phase-2.4-monetization-settings.spec.ts` — toggle monetization on, verify the change is persisted (mocked `/admin/config`) and reflected in `usePlatformConfig()` elsewhere in the app

---

### Phase 2.5 — Revenue Dashboard

**`app/(admin)/revenus/page.tsx`:**

Date range picker (from / to) + type filter (Tout / Frais d'annonces / Révélations).

Stat cards:
- Revenu total (FCFA)
- Frais d'annonces ce mois
- Révélations de contacts ce mois
- Abonnements agents actifs
- Abonnements utilisateurs actifs

Bar chart: monthly revenue (frais d'annonces vs révélations) using a lightweight chart library (Recharts or Chart.js).

### Phase 2.5 — Tests

- Stat cards render each `RevenueData` field formatted with `formatFCFA`
- Date range picker and type filter update the query params passed to the revenue API and trigger a refetch
- Bar chart component receives the expected dataset shape for a given mocked API response (assert on props/data, not pixel output)
- `e2e/phase-2.5-revenue-dashboard.spec.ts` — admin opens the revenue dashboard, changes the date range and type filter, and sees the stat cards and chart update

---

## Delivery Order

| Phase | Work | Deliverable |
|-------|------|-------------|
| **0** | Project setup, API client, auth hook, route protection, shared utilities, layouts | Skeleton app boots; Header/Footer rendered; auth redirect works |
| **1.1** | Home, listings browse, listing detail, search, static pages | Full public browsing experience |
| **1.2** | Register, login, verify email, forgot/reset password | Agents can create accounts and log in |
| **1.3** | Agent dashboard, my listings, create/edit form, profile | Agents can submit and manage listings |
| **1.4** | Admin dashboard, review queue, all listings, user management, content management | Admins can moderate the platform |
| **1.5** | Notification bell, notifications page | Status-change notifications visible in-app |
| **1.6** | Shared components, loading states, error boundaries | Polished, consistent UI |
| **1.7** | Metadata, sitemap, robots, image optimisation | SEO-ready public pages |
| **2.1** | Platform config hook, monetization detection | Frontend reads the monetization flag |
| **2.2** | Listing fee payment flow | Agents pay before submitting |
| **2.3** | Contact reveal flow, AuthModal | Public users pay to reveal contacts |
| **2.4** | Admin monetization settings | Admin can toggle and configure fees |
| **2.5** | Revenue dashboard | Admin sees earnings breakdown |

---

## New Files (Summary)

```
src/
  i18n/
    routing.ts
    request.ts
    navigation.ts
  app/
    [locale]/
      layout.tsx
      not-found.tsx
      error.tsx

      (public)/
        page.tsx                        — home
        annonces/
          page.tsx                      — browse
          recherche/page.tsx            — search results
          [slug]/page.tsx               — listing detail
        a-propos/page.tsx
        contact/page.tsx
        mentions-legales/page.tsx

      (auth)/
        inscription/page.tsx
        connexion/page.tsx
        verify-email/[token]/page.tsx
        mot-de-passe-oublie/page.tsx
        reinitialiser-mot-de-passe/page.tsx

      (agent)/
        layout.tsx
        tableau-de-bord/page.tsx
        mes-annonces/page.tsx
        annonces/
          nouvelle/page.tsx
          [id]/
            modifier/page.tsx
            paiement/page.tsx           (Phase 2)
            paiement/statut/page.tsx    (Phase 2)
        notifications/page.tsx
        profil/page.tsx

      (admin)/
        layout.tsx
        tableau-de-bord/page.tsx
        annonces/
          page.tsx
          en-attente/page.tsx
          [id]/page.tsx
        utilisateurs/
          page.tsx
          [id]/page.tsx
        contenu/
          quartiers/page.tsx
          equipements/page.tsx
        parametres/
          monetisation/page.tsx         (Phase 2)
        revenus/page.tsx                (Phase 2)
    sitemap.ts
    robots.ts

  components/
    layout/
      Header.tsx
      Footer.tsx
      AgentSidebar.tsx
      AdminSidebar.tsx
      MobileNav.tsx
    listings/
      ListingCard.tsx
      ListingGrid.tsx
      ListingFilters.tsx
      ListingGallery.tsx
      ContactSection.tsx
      AmenitiesList.tsx
      StatusBadge.tsx
      RelatedListings.tsx
    forms/
      ListingForm.tsx
      PhotoUploader.tsx
      AuthForm.tsx
    shared/
      ConfirmModal.tsx
      RejectModal.tsx
      AuthModal.tsx                   (Phase 2)
      RevealPaymentModal.tsx          (Phase 2)
      NotificationBell.tsx
      Pagination.tsx
      EmptyState.tsx
      LoadingSkeleton.tsx
      PriceDisplay.tsx

  hooks/
    use-auth.ts
    use-listings.ts
    use-agent-listings.ts
    use-notifications.ts
    use-cities.ts
    use-amenities.ts
    use-platform-config.ts            (Phase 2)

  lib/
    api.ts
    auth-server.ts
    utils.ts
    slug.ts

  providers/
    query-provider.tsx

  schemas/
    auth.schema.ts
    listing.schema.ts
    user.schema.ts

  types/
    enums.ts        — all string enums (UserRole, ListingStatus, PaymentMethod, etc.)
    user.ts         — User interface (toResponse() shape)
    listing.ts      — Listing, ListingImage, ListingAmenity, PaginatedListings
    filters.ts      — ListingFilters, AgentListingFilters, AdminListingFilters
    reference.ts    — City, Neighborhood, Amenity
    notification.ts — Notification interface
    payment.ts      — ListingPayment, ContactReveal, UserSubscription, initiation response shapes
    api.ts          — ApiResponse<T>, ApiError, RevenueData
    config.ts       — PlatformConfig, PlatformConfigKey, ParsedPlatformConfig  (Phase 2)

middleware.ts
.env.local
.env.example
```
