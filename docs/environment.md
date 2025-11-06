## Environment Variables Overview

### Frontend (`.env.local`)

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_APP_URL` | Base URL of the Static Web App (e.g., `https://yoursociallinks.azurestaticapps.net`). Used for canonical metadata and API requests. |
| `NEXT_PUBLIC_API_BASE_URL` | Base URL that resolves to the Azure Functions API. In Azure Static Web Apps this can be left blank (defaults to the same host), but set to `http://localhost:7071` when calling the local emulator. |
| `NEXT_PUBLIC_USE_MOCK_DATA` | Set to `true` to use local mock content before Cosmos DB is configured. Set to `false` once the API is wired to Cosmos. |
| `NEXT_PUBLIC_B2C_CLIENT_ID` | Public client ID for MSAL (same as backend). |
| `NEXT_PUBLIC_B2C_AUTHORITY` | Authority URL with policy for the CIAM tenant. |
| `NEXT_PUBLIC_B2C_SCOPE` | API scope to request alongside `openid profile offline_access`. |
| `NEXT_PUBLIC_B2C_POLICY` | Policy name (e.g., `SignUpSignIn1`). |

### Backend (`api/local.settings.json`)

| Variable | Description |
| --- | --- |
| `AzureWebJobsStorage` | Required for local development; `UseDevelopmentStorage=true` when using Azurite. |
| `FUNCTIONS_WORKER_RUNTIME` | Always `node`. |
| `COSMOS_DB_CONNECTION_STRING` | Primary connection string for Cosmos DB (API for NoSQL). |
| `COSMOS_DB_DATABASE_ID` | Defaults to `YSLData`. Override if you choose a different database name. |
| `COSMOS_DB_PROFILES_CONTAINER` | Defaults to `Profiles`. |
| `COSMOS_DB_LINKS_CONTAINER` | Defaults to `Links`. |
| `STORAGE_CONNECTION_STRING` | Connection string for the storage account that holds background videos. Required for SAS token generation. |
| `STORAGE_CONTAINER_NAME` | Container that stores user-uploaded assets (default `user-media`). |
| `STRIPE_SECRET_KEY` | Stripe API key (`sk_test_` for development). |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for the Stripe webhook endpoint. |
| `NEXT_PUBLIC_APP_URL` | Used when constructing absolute URLs in backend e-mails/webhooks. Match the frontend value. |
| `NEXT_PUBLIC_B2C_CLIENT_ID` | Application (client) ID for the SPA registration in Microsoft Entra External ID. |
| `NEXT_PUBLIC_B2C_SCOPE` | API scope exposed by `ysl-api` (e.g., `https://yslinks.onmicrosoft.com/ysl-api/user_impersonation`). |
| `NEXT_PUBLIC_B2C_AUTHORITY` | Authority URL including policy (e.g., `https://yslinks.ciamlogin.com/yslinks.onmicrosoft.com/SignUpSignIn1/v2.0`). |
| `NEXT_PUBLIC_B2C_POLICY` | User flow/policy name (e.g., `SignUpSignIn1`). |
| `B2C_API_AUDIENCE` | API audience URI (`https://yslinks.onmicrosoft.com/ysl-api`). |
| `USE_MOCK_DATA` | Keep `true` until Cosmos DB is populated. Switch to `false` to run against production data. |

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

> Tip: Mirror the same names inside the Azure Functions application settings once the API is deployed so production and CI stay in sync.



