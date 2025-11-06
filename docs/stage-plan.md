## Stage 3 - Configure Authentication (Azure AD B2C)

1. In the Azure portal, search for `Azure AD B2C` -> `+ Create a new Azure AD B2C Tenant`.
2. Tenant details:
   - Organization name: `YSL B2C`
   - Initial domain name: something globally unique such as `yslb2c`
   - Country/Region: United States (keep consistent with other resources).
3. After the tenant is created, click `Manage tenant` to switch into it, then use `Link an Azure subscription` so the tenant appears alongside your YSL-rg resources.
4. Under `App registrations` -> `+ New registration` create the Static Web App auth application:
   - Name: `yoursociallinks-web`
   - Supported account types: `Accounts in this organizational directory only`.
   - Redirect URI: `https://<your-static-web-app-name>.azurestaticapps.net/.auth/login/aadb2c/callback`
   - Check `ID tokens`.
5. From the new registration, capture the `Application (client) ID`.
6. Under `Certificates & secrets`, create a client secret. Copy the secret value immediately; you will never see it again.
7. Under `User flows`, create a `Sign up and sign in` flow (`B2C_1_signupsignin`). Configure:
   - Identity providers: Email sign-up (disable phone unless you want it).
   - User attributes to collect: Display Name, Email Address. Enable `Use custom policy to capture desired username`.
   - Under `Page layouts`, customize branding later (optional).
8. Back in the Azure portal, open your `yoursociallinks` Static Web App -> `Settings` -> `Authentication`.
9. Add a new identity provider -> `Azure Active Directory B2C` and fill in:
   - Metadata endpoint: `https://<tenant>.b2clogin.com/<tenant>.onmicrosoft.com/<user-flow>/v2.0/.well-known/openid-configuration`
   - Client ID: from step 5.
   - Client secret: from step 6.
   - Allowed token audiences: `https://<your-static-web-app-name>.azurestaticapps.net`
10. Save. When the site is deployed the default `/login` route will redirect to this B2C flow. The `.auth/me` endpoint will surface user info to the API layer.

## Stage 4 - Provision Cosmos DB (API for NoSQL)

1. Search `Cosmos DB` -> `+ Create`.
2. Basics tab:
   - API option: `Core (SQL) - recommended`.
   - Resource group: `YSL-rg`.
   - Account name: `ysl-cosmos` (must be globally unique).
   - Location: `Central US`.
   - Capacity mode: Start with `Serverless` (cost optimized) unless you expect heavy load immediately.
3. Review + Create -> Create. Wait for the deployment to finish.
4. Once provisioned, open `Data Explorer` and create:
   - Database: `YSLData`.
   - Container: `Profiles`
     - Partition key: `/tenantId`
     - Unique keys: `/username`
   - Container: `Links`
     - Partition key: `/tenantId`
5. Collect connection details under `Keys` -> `Primary connection string`. This is needed for the API environment variables.
6. Security best practices:
   - Disable public network access if you will connect only through Azure Functions with a VNet or private endpoint. (For development, you can leave it on and restrict with firewall rules to your static web app and office IP.)
   - Do not check the `Primary key` into source control. Store it in Azure Function app settings or GitHub secrets.

## Stage 5 - Create Storage Account for Media Assets

1. Search `Storage accounts` -> `+ Create`.
2. Basics:
   - Resource group: `YSL-rg`
   - Storage account name: `yslmediastore` (unique)
   - Region: `Central US`
   - Performance: `Standard`
   - Redundancy: `Locally-redundant storage (LRS)` (upgrade later if needed).
3. On the `Advanced` tab, enable `Blob public access` (users need to stream videos). Keep `Secure transfer required`.
4. After creation, open the storage account:
   - `Containers` -> `+ Container` -> name `user-media`. Access level: `Blob` (anonymous read for blobs).
   - `CORS` (Settings -> Resource sharing (CORS)): add origin `https://<your-static-web-app-name>.azurestaticapps.net`, allow GET/HEAD/OPTIONS.
5. Generate an upload SAS policy with limited permissions for your backend to issue per-user SAS tokens (we will cover the API later).
6. Record the storage connection string; store it as a secret.

## Stage 6 - Stripe Subscription Setup

1. Log in to Stripe Dashboard -> Developers -> API keys. Keep the Secret key handy (starts with `sk_live_` for production, `sk_test_` for testing).
2. Create a Customer Portal configuration with the `YSL Base Subscription` product for self-service changes.
3. Developers -> Webhooks -> `+ Add endpoint`.
   - Endpoint URL (test): `https://<your-static-web-app-name>.azurestaticapps.net/api/stripe-webhook`.
   - Events to send: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`.
4. Save the `Signing secret`; this will be an environment variable for the webhook Azure Function (`STRIPE_WEBHOOK_SECRET`).
5. Create a Stripe Connect restricted key if you want users to collect payments directly (optional).

## Stage 7 - Repository Secrets and Environment Variables

Once the GitHub Actions workflow exists, set repo-level secrets (`Settings -> Secrets and variables -> Actions`):

- `AZURE_STATIC_WEB_APPS_API_TOKEN`: Provided by Azure Static Web App (Deployment token).
- `NEXT_PUBLIC_AAD_B2C_AUTHORITY`: `https://<tenant>.b2clogin.com/<tenant>.onmicrosoft.com/<user_flow>`
- `NEXT_PUBLIC_AAD_B2C_CLIENT_ID`: Client ID from Stage 3.
- `AAD_B2C_CLIENT_SECRET`: Client secret from Stage 3.
- `COSMOS_DB_CONNECTION_STRING`: From Stage 4.
- `STORAGE_CONNECTION_STRING`: From Stage 5.
- `STORAGE_CONTAINER_NAME`: `user-media`.
- `STRIPE_SECRET_KEY`: From Stage 6.
- `STRIPE_WEBHOOK_SECRET`: From Stage 6.
- `APP_URL`: `https://<your-static-web-app-name>.azurestaticapps.net`

Locally (we will create an `.env.local` template), replicate these values with development/test credentials.

## Stage 8 - Custom Domain (yoursociallinks.com)

1. Purchase `yoursociallinks.com` through your preferred registrar (Bluehost is fine).
2. In Azure Static Web App -> `Custom domains` -> `+ Add`.
3. Choose `Bring your own domain`, enter `yoursociallinks.com`.
4. Azure provides a TXT record for validation. Add it in your DNS host.
5. Once validated, add an A record (root) and CNAME for `www` pointing to the target provided by Azure. Azure issues and renews the SSL cert automatically.

## Stage 9 - Monitoring and Observability

1. For Azure Functions, enable Application Insights:
   - In the Static Web App resource -> `Functions` -> `Application Insights` -> `Turn on`.
2. In GitHub Actions, enable deployment logs as artifacts (default).
3. Set up Azure Monitor alerts on billing thresholds or failure spikes.

Proceed to Stage 10 (development) once resources above exist. We will scaffold the repo so you can clone it locally and start wiring the environment variables.



