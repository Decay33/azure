# YourSocialLinks (YSL)

Premium link-in-bio platform with cinematic video backdrops, Stripe-powered subscriptions, and Azure-first infrastructure.

## Tech Stack

- **Frontend**: Next.js 16 (App Router, Tailwind CSS v4)
- **Backend API**: Azure Functions (TypeScript)
- **Database**: Azure Cosmos DB (API for NoSQL)
- **Storage**: Azure Blob Storage for background video loops
- **Auth**: Azure AD B2C via Azure Static Web Apps authentication
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

- Node.js 18.18+ or 20.x
- npm 9+
- [Azure Functions Core Tools v4](https://learn.microsoft.com/azure/azure-functions/functions-run-local#install-the-azure-functions-core-tools) (for local API emulator)

### Install

```bash
npm install
npm install --prefix api
```

Create environment files:

```bash
cp .env.example .env.local
cp api/local.settings.json.example api/local.settings.json
```

Fill in the placeholders with dev/test credentials (Stripe test key, local Cosmos emulator, etc.). Use `"USE_MOCK_DATA": "true"` until Cosmos DB is ready.

### Run

```bash
# Start Next.js frontend
npm run dev

# In another terminal, start Azure Functions (requires Core Tools)
npm run dev:api
```

- Frontend: `http://localhost:3000`
- Functions: `http://localhost:7071/api` (proxied through Static Web Apps emulator when running `swa start`, optional)

### Build

```bash
npm run build          # Next.js build
npm run build:api      # TypeScript -> dist/ for Azure Functions
npm run build:all      # Convenience to run both
```

## Stripe Configuration

- Product: **YSL Base Subscription** (`prod_TN0iLZlXlOo8iH`)
- Create a recurring price in Stripe (monthly, $8.00) and link it to the product.
- Configure a webhook endpoint for `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`.
- Store `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` in GitHub Actions & Azure Function app settings.

## Authentication Notes

Azure Static Web Apps handles the auth handshake. Once Stage 3 is complete:

- `/.auth/login/aadb2c` starts the sign-in flow.
- `/.auth/me` returns the authenticated principal. The frontend dashboard page redirects anonymous users to the login endpoint.
- Azure Functions can read `x-ms-client-principal` header using the helper in `api/src/utils/auth.ts`.

## Repository Structure

```
.
|- api/                  # Azure Functions (TypeScript)
|  |- src/
|  |  |- health/
|  |  |- profile-get/
|  |  \- ...shared libs
|  |- host.json
|  \- package.json
|- docs/
|  \- stage-plan.md     # Azure staging checklist
|- public/               # Static assets
\- src/
   |- app/              # Next.js App Router
   |- components/       # UI components
   \- lib/              # Shared client utilities
```

## Next Steps

1. Finish Stage 3-7 provisioning (see `docs/stage-plan.md`) and populate local/GitHub secrets.
2. Wire Azure AD B2C JWT claims into the dashboard API to create user records in Cosmos DB.
3. Implement link CRUD, video upload SAS tokens, and Stripe checkout/session creation flows.
4. Add automated testing (Playwright for frontend smoke, Vitest for shared logic) once APIs are stable.

Refer to `docs/stage-plan.md` for full Azure portal click-through guidance.
