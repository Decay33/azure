# YourSocialLinks (YSL)

Premium link-in-bio platform with cinematic video backdrops, Stripe-powered subscriptions, and Azure-first infrastructure.

## Tech Stack

- **Frontend**: Next.js 16 (App Router, Tailwind CSS v4)
- **Server routes**: Next.js Route Handlers (Node runtime) with Cosmos/Blob/Stripe access
- **Database**: Azure Cosmos DB (API for NoSQL)
- **Storage**: Azure Blob Storage for background video loops
- **Auth**: Microsoft Entra External ID (CIAM) via MSAL.js
- **Billing**: Stripe subscriptions (YSL Base Subscription - `prod_TN0iLZlXlOo8iH`)

## Stage Checklist

Azure provisioning continues in `docs/stage-plan.md`.

- Stage 1 - [done] Resource group (`YSL-rg`)
- Stage 2 - [done] Static Web App (`yoursociallinks`)
- Stage 3 - [pending] Azure AD B2C (email + username sign-up)
- Stage 4 - [pending] Cosmos DB account + containers
- Stage 5 - [pending] Storage account for video assets
- Stage 6 - [pending] Stripe webhooks & secrets
- Stage 7 - [pending] GitHub secrets & CI configuration
- Stage 8 - [pending] Custom domain (`yoursociallinks.com`)
- Stage 9 - [pending] Monitoring (Application Insights, alerts)

Complete the infrastructure stages before moving to the dashboard/user management features.

## Local Development

### Prerequisites

- Node.js 20.9+ (use `.nvmrc`)
- npm 9+

### Install

```bash
npm install
cp .env.example .env.local
```

Fill in Cosmos/Storage/Stripe settings (use `"USE_MOCK_DATA": "true"` until Cosmos DB is ready).

### Run

```bash
npm run dev
```

- App + API routes: `http://localhost:3000`

### Build

```bash
npm run build
```

## Stripe Configuration

- Product: **YSL Base Subscription** (`prod_TN0iLZlXlOo8iH`)
- Create a recurring price in Stripe (monthly, $8.00) and link it to the product.
- Configure a webhook endpoint for `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`.
- Store `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` in GitHub Actions & Azure Function app settings.

## Authentication Notes

MSAL React handles the client-side flow against the Entra External ID tenant. Server routes validate the resulting JWT with `jose`, so any request to `/api/profile`, `/api/links`, or `/api/videos/sign-upload` must include `Authorization: Bearer <token>` from MSAL.

## Repository Structure

```
.
|- docs/
|  \- stage-plan.md
|- public/
\- src/
   |- app/                # Next.js App Router + API routes
   |- components/         # UI components
   |- lib/                # Shared client utilities
   \- server/             # Cosmos/Blob/auth helpers for API routes
```

## Next Steps

1. Finish Stage 3-7 provisioning (see `docs/stage-plan.md`) and populate local/GitHub secrets.
2. Wire Microsoft Entra External ID JWT claims into the dashboard API to create user records in Cosmos DB.
3. Finalize link CRUD, video upload SAS tokens, and Stripe checkout/session creation flows.
4. Add automated testing (Playwright for frontend smoke, Vitest for shared logic) once APIs are stable.

Refer to `docs/stage-plan.md` for full Azure portal click-through guidance.
