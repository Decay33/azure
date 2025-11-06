## Environment Variables Overview

### Frontend (`.env.local`)

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_APP_URL` | Base URL of the Static Web App (e.g., `https://yoursociallinks.azurestaticapps.net`). Used for canonical metadata and API requests. |
| `NEXT_PUBLIC_API_BASE_URL` | Optional override for API calls. Leave blank to use relative `/api/*` routes; set to a full URL only when calling a remote environment from localhost. |
| `NEXT_PUBLIC_USE_MOCK_DATA` | Set to `true` to use local mock content before Cosmos DB is configured. Set to `false` once the API is wired to Cosmos. |
| `NEXT_PUBLIC_B2C_CLIENT_ID` | Public client ID for MSAL (same as backend). |
| `NEXT_PUBLIC_B2C_AUTHORITY` | Authority URL with policy for the CIAM tenant. |
| `NEXT_PUBLIC_B2C_SCOPE` | API scope to request alongside `openid profile offline_access`. |
| `NEXT_PUBLIC_B2C_POLICY` | Policy name (e.g., `SignUpSignIn1`). |

### Server-side (Next.js Route Handlers)

| Variable | Description |
| --- | --- |
| `COSMOS_DB_CONNECTION_STRING` / `COSMOS_CONN_STRING` | Primary connection string for Cosmos DB (API for NoSQL). |
| `COSMOS_DB_DATABASE_ID` | Cosmos database name (`ysldb`). |
| `COSMOS_DB_USERS_CONTAINER` | Users container (default `users`). |
| `COSMOS_DB_PROFILES_CONTAINER` | Profiles container (default `profiles`). |
| `COSMOS_DB_LINKS_CONTAINER` | Links container (default `links`). |
| `STORAGE_CONNECTION_STRING` / `STORAGE_CONN_STRING` | Storage account connection string used for SAS generation. |
| `STORAGE_CONTAINER_NAME` / `AZURE_STORAGE_CONTAINER` | Blob container holding user backdrops (default `backdrops`). |
| `AZURE_STORAGE_ACCOUNT` | Optional explicit account name (falls back to the connection string). |
| `B2C_API_AUDIENCE` | API audience URI (`https://yslinks.onmicrosoft.com/ysl-api`). |
| `USE_MOCK_DATA` | Keep `true` until Cosmos DB is ready. Switch to `false` for production data. |
| `STRIPE_SECRET_KEY` | Stripe API key (`sk_test_` for development). |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for the Stripe webhook endpoint. |

### GitHub Actions Secrets

Configure these under **Settings -> Secrets and variables -> Actions** in your GitHub repo:

- `AZURE_STATIC_WEB_APPS_API_TOKEN`
- `NEXT_PUBLIC_B2C_AUTHORITY`
- `NEXT_PUBLIC_B2C_CLIENT_ID`
- `NEXT_PUBLIC_B2C_SCOPE`
- `NEXT_PUBLIC_B2C_POLICY`
- `B2C_API_AUDIENCE`
- `COSMOS_DB_CONNECTION_STRING`
- `STORAGE_CONNECTION_STRING`
- `STORAGE_CONTAINER_NAME`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `APP_URL`

> Tip: Keep environment names consistent between local `.env`, SWA configuration, and Key Vault references so the Next.js server routes behave the same everywhere.



