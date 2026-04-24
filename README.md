<div align="center">

<br/>

# 🎧 HearHouse

### Premium headphone e-commerce — full-stack portfolio project

<br/>

![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS_11-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Turborepo](https://img.shields.io/badge/Turborepo-EF4444?style=for-the-badge&logo=turborepo&logoColor=white)

<br/>

> A production-grade audio gear store built as a portfolio piece.  
> Features a battle-tested custom auth system, full e-commerce flow, and an admin panel.

<br/>

</div>

---

## ✨ Features at a glance

| Area | What's inside |
|---|---|
| **Authentication** | JWT + refresh tokens · Google OAuth · email verification · argon2 hashing · session tracking · CSRF protection |
| **Store** | Product catalog · variants · image gallery · reviews & ratings · wishlist |
| **Cart & Checkout** | Persisted Zustand cart · Stripe payment intents · shipping options · webhooks |
| **Account** | Profiles · multiple addresses · order history · settings · linked providers |
| **Admin** | Product CRUD · image uploads (Cloudinary) · order management · role-based access |
| **Email** | Verification · password reset · change notifications via Nodemailer |

---

## 🗂 Monorepo structure

```
hear-house/
├── apps/
│   ├── api/          ← NestJS REST API
│   └── web/          ← Next.js storefront
├── turbo.json
└── pnpm-workspace.yaml
```

---

## 🖥 Frontend — `apps/web`

**Next.js 16 · React 19 · Tailwind CSS 4 · shadcn/ui**

```
src/
├── app/
│   ├── (root)/       ← marketing pages (home, hero, featured products)
│   ├── (auth)/       ← sign-in, sign-up, verify-email, reset-password
│   ├── (shop)/       ← catalog, product detail, cart, checkout
│   ├── (protected)/  ← profile, addresses, orders, wishlist, settings
│   └── (admin)/      ← product & order management
├── components/
│   ├── auth/         ← form components for every auth flow
│   ├── products/     ← gallery, variant selector, specs, reviews
│   ├── cart/         ← cart button with live badge
│   ├── layout/       ← navbar, footer, account sidebar
│   └── ui/           ← shadcn design system components
├── stores/           ← Zustand cart (persisted to localStorage)
├── lib/api/          ← typed API clients (auth, products, orders…)
└── providers/        ← React Query + auth context
```

### Key tech choices

| Concern | Library |
|---|---|
| Data fetching | TanStack Query 5 |
| Forms | React Hook Form 7 + Zod 4 |
| Global state | Zustand 5 |
| Payments | Stripe.js 9 |
| Icons | Iconify / mingcute |
| Linting | Biome 2 |

---

## ⚙️ Backend — `apps/api`

**NestJS 11 · TypeORM · PostgreSQL**

```
src/
├── auth/             ← JWT, OAuth, guards, strategies, session mgmt
├── users/            ← user entity, roles
├── customers/        ← profiles, addresses
├── products/         ← catalog, variants, images
├── orders/           ← order lifecycle
├── payments/         ← Stripe intents & webhooks
├── wishlist/
├── reviews/
├── upload/           ← Cloudinary integration
├── mail/             ← Nodemailer templates
└── database/         ← TypeORM config, 13 entities
```

### API surface — 50+ endpoints across 11 modules

<details>
<summary><strong>Auth</strong> (18 endpoints)</summary>

| Method | Path | Description |
|---|---|---|
| `GET` | `/auth/csrf-token` | CSRF token |
| `POST` | `/auth/register` | Email registration |
| `POST` | `/auth/login` | Credentials login |
| `POST` | `/auth/refresh` | Rotate refresh token |
| `POST` | `/auth/logout` | Revoke session |
| `POST` | `/auth/logout-all` | Revoke all sessions |
| `GET` | `/auth/session` | Current session info |
| `POST` | `/auth/forgot-password` | Request reset link |
| `POST` | `/auth/reset-password` | Reset with token |
| `POST` | `/auth/verify-email` | Confirm email |
| `POST` | `/auth/resend-verification` | Resend verification |
| `GET` | `/auth/google` | Initiate Google OAuth |
| `GET` | `/auth/google/callback` | OAuth callback |
| `POST` | `/auth/link/confirm` | Link Google to existing account |
| `POST` | `/auth/add-password` | Add credentials to OAuth account |
| `DELETE` | `/auth/unlink/:provider` | Unlink OAuth provider |
| `GET` | `/auth/linked-accounts` | List connected providers |

</details>

<details>
<summary><strong>Products, Orders, Payments, Reviews, Wishlist, Upload</strong></summary>

| Module | Endpoints |
|---|---|
| Products (public) | `GET /products` · `GET /products/featured` · `GET /products/:slug` |
| Products (admin) | Full CRUD + variants + images (reorder, delete) |
| Orders (customer) | Create · list · get by ID |
| Orders (admin) | List all · get · update status |
| Payments | Shipping options · create intent · webhook |
| Reviews | CRUD per product · own review lookup |
| Wishlist | Toggle · list · list IDs · remove |
| Upload (admin) | Product images · avatars · delete from Cloudinary |

</details>

---

## 🔐 Authentication deep-dive

The auth system is built from scratch — no NextAuth, no third-party session management.

```
Registration
 └─ argon2 hash (+ pepper) → DB
 └─ email verification token sent
 └─ status: PENDING until verified

Login (local)
 └─ LocalAuthGuard → validate credentials
 └─ JWT Access Token  (15 min, httpOnly cookie)
 └─ JWT Refresh Token (14 days, httpOnly cookie)
    └─ JTI stored as SHA-256 hash in DB
    └─ IP + User-Agent logged per session

Token refresh
 └─ JwtRefreshGuard validates JTI hash
 └─ Old token revoked, new pair issued (rotation)

Logout
 └─ Single session: revoke by JTI
 └─ All sessions: bulk revoke (on password change / reset)

Google OAuth
 └─ passport-google-oauth20
 └─ If email matches existing account → link flow
 └─ If new → create account, skip email verification
 └─ Can unlink provider (unless it's the only sign-in method)

Guards
 └─ JwtAuthGuard         — access token required
 └─ OptionalJwtAuthGuard — token optional
 └─ LocalAuthGuard       — email + password
 └─ RolesGuard           — ADMIN / SUPER_ADMIN / USER
```

---

## 🗄 Data model — 13 TypeORM entities

```
User ─┬─ Account (OAuth providers)
      ├─ Session (refresh token JTIs)
      ├─ Verification (email / password-reset tokens)
      └─ CustomerProfile ─┬─ Address[]
                           ├─ Order[] ─── OrderItem[]
                           ├─ Review[]
                           └─ WishlistItem[]

Product ─┬─ ProductVariant[]
          └─ ProductImage[]
```

---

## 🚀 Getting started

### Prerequisites

- Node.js ≥ 18
- pnpm 9
- PostgreSQL
- Stripe account (for payments)
- Cloudinary account (for image uploads)
- Google OAuth credentials (optional)

### Install

```bash
git clone https://github.com/YOUR_USERNAME/hear-house.git
cd hear-house
pnpm install
```

### Environment variables

**`apps/api/.env`**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/hearhouse

JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
ACCESS_TOKEN_TTL_MIN=15
REFRESH_TOKEN_TTL_DAYS=14

ARGON2_PEPPER=your-pepper

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=...
MAIL_PASS=...

FRONTEND_URL=http://localhost:3000
```

**`apps/web/.env.local`**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Run

```bash
# Start both apps in parallel (Turbo)
pnpm dev

# Or individually
pnpm --filter api dev     # NestJS  → http://localhost:3001
pnpm --filter web dev     # Next.js → http://localhost:3000
```

---

## 🛠 Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start all apps in dev mode |
| `pnpm build` | Build all apps (Turbo cache) |
| `pnpm lint` | Lint all workspaces |
| `pnpm --filter api test` | Run NestJS unit tests |

---

## 📦 Tech stack — full list

<details>
<summary>Frontend</summary>

| Package | Version | Role |
|---|---|---|
| next | 16.1.6 | Framework |
| react | 19.2.3 | UI runtime |
| tailwindcss | 4.x | Styling |
| @radix-ui | 1.4.3 | Headless components |
| react-hook-form | 7.71.2 | Form state |
| zod | 4.3.6 | Schema validation |
| @tanstack/react-query | 5.95.2 | Server state |
| zustand | 5.0.12 | Client state |
| @stripe/react-stripe-js | 6.0.0 | Payments |
| embla-carousel-react | 8.6.0 | Carousel |
| sonner | 2.0.7 | Toasts |
| next-themes | 0.4.6 | Dark mode |
| biome | 2.2.0 | Lint + format |

</details>

<details>
<summary>Backend</summary>

| Package | Version | Role |
|---|---|---|
| @nestjs/core | 11.0.1 | Framework |
| @nestjs/jwt | 11.0.2 | JWT handling |
| @nestjs/passport | 11.0.5 | Auth strategies |
| typeorm | 0.3.28 | ORM |
| pg | 8.18.0 | PostgreSQL driver |
| argon2 | 0.44.0 | Password hashing |
| passport-google-oauth20 | 2.0.0 | Google OAuth |
| stripe | 21.0.0 | Payments |
| cloudinary | 2.9.0 | Image hosting |
| nodemailer | 8.0.1 | Emails |
| class-validator | 0.14.3 | DTO validation |
| csrf-csrf | 4.0.3 | CSRF protection |
| helmet | 8.1.0 | HTTP security headers |

</details>

---

<div align="center">

Made with focus on clean architecture and real-world auth patterns.

</div>
