## Stage 3 - Configure Authentication (Microsoft Entra External ID - Customers)

1. In the Azure portal, search for `External Identities` -> `External identities (Azure AD B2C)` -> `+ Create a tenant`.
2. Tenant details:
   - Organization name: `YourSocialLinks`
   - Initial domain name: e.g., `yslinks`
   - Country/Region: United States (keep consistent with other resources).
3. After the tenant is created, use `Manage tenant` to switch into it, then `Link an Azure subscription` so it appears with `YSL-rg`.
4. Under `App registrations` create:
   - **Client** (SPA): `ysl-spa`
     - Redirect URIs:
       - `https://<static-app>.azurestaticapps.net/auth/callback`
       - `https://<static-app>.azurestaticapps.net`
       - `http://localhost:3000/auth/callback`
       - `http://localhost:3000`
     - Expose permissions: none (public client).
   - **API**: `ysl-api`
     - Application ID URI: `https://<tenant>.onmicrosoft.com/ysl-api`
     - Expose scope: `user_impersonation` (display “Access YourSocialLinks API”).
5. Under `User flows`, create `SignUpSignIn1` with Email sign-up + password, collecting Email (required) and Display Name (optional).
6. Attach the SPA application to the flow (`User flows` -> `Applications` -> add `ysl-spa`).
7. Grant the SPA application API permissions: `ysl-api/user_impersonation`, then click `Grant admin consent`.
8. In Static Web App Settings -> `Authentication` -> `Identity providers` -> `Azure Active Directory` (Custom):
   - Authority: `https://<tenant>.ciamlogin.com/<tenant>.onmicrosoft.com/SignUpSignIn1/v2.0`
   - Client ID: SPA client ID.
   - Client Secret: not required for SPA.
   - Allowed token audiences: `https://<tenant>.onmicrosoft.com/ysl-api`
9. Populate SWA / GitHub secrets using the names listed in `docs/environment.md`.

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
   - Database: `ysldb`.
   - Container: `users` (partition key `/id`)
   - Container: `profiles` (partition key `/userId`, unique key `/username`)
   - Container: `links` (partition key `/profileId`)
5. Collect connection details under `Keys` -> `Primary connection string`. This is needed for the API environment variables.
6. Security best practices:
   - Disable public network access if you will connect only through a VNet/private endpoint. (During development you can leave it on and restrict with firewall rules to your office IP or the SWA outbound range.)
   - Do not check the `Primary key` into source control. Store it in SWA app settings or Azure Key Vault.

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
4. Save the `Signing secret`; this will be consumed by the Next.js `/api/stripe/webhook` route (`STRIPE_WEBHOOK_SECRET`).
5. Create a Stripe Connect restricted key if you want users to collect payments directly (optional).

## Stage 7 - Repository Secrets and Environment Variables

Once the GitHub Actions workflow exists, set repo-level secrets (`Settings -> Secrets and variables -> Actions`):

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

Mirror these settings locally via `.env.local` and, in production, back them with Key Vault references.

## Stage 8 - Custom Domain (yoursociallinks.com)

1. Purchase `yoursociallinks.com` through your preferred registrar (Bluehost is fine).
2. In Azure Static Web App -> `Custom domains` -> `+ Add`.
3. Choose `Bring your own domain`, enter `yoursociallinks.com`.
4. Azure provides a TXT record for validation. Add it in your DNS host.
5. Once validated, add an A record (root) and CNAME for `www` pointing to the target provided by Azure. Azure issues and renews the SSL cert automatically.

## Stage 9 - Monitoring and Observability

1. In the Static Web App resource enable Application Insights (`Monitoring` -> `Application Insights`) and keep GitHub Actions logs for traceability.
2. In GitHub Actions, enable deployment logs as artifacts (default).
3. Set up Azure Monitor alerts on billing thresholds or failure spikes.

Proceed to Stage 10 (development) once resources above exist. We will scaffold the repo so you can clone it locally and start wiring the environment variables.



