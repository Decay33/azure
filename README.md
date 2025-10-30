# The AI Democracy (Azure Static Web App)

This repo hosts the static front-end and Azure Functions backend that replaced the original PHP site. The layout matches the legacy experience while moving authentication, contact, and likes into Azure Static Web Apps (SWA) and managed Functions.

## Project Structure

```
/
  index.html                # Main landing page (games, tools, contact)
  members/index.html        # Auth-only members hub\n  chromaticrunner/\n    index.html              # Standalone game page with SWA nav/auth\n    script.js               # Game logic + score submission\n    styles.css              # Page-specific styling
  privacy.html              # Public privacy policy
  style.css                 # Shared styling from the legacy site
  sitemap.xml               # Updated sitemap URLs
  staticwebapp.config.json  # SWA auth + routing rules
  .github/workflows/azure-static-web-apps.yml
  api/
    package.json
    _shared/
      auth.js   # EasyAuth helpers
      cosmos.js # Cosmos client factory
      id.js     # Durable identifier helpers
    GetMe/
    contact/
    likes/
```

## Authentication & Routing

Azure Static Web Apps EasyAuth (custom Google OIDC) protects everything under `/api/*` and `/members/*`. Guests can browse the home page and privacy policy. Sign in/out links use the SWA endpoints (`/.auth/login/google` and `/.auth/logout`).

`staticwebapp.config.json` enforces:

- `/members/*` → authenticated users only
- `/api/*` → authenticated users only
- 401s redirect to the Google login page

## Functions

| Function     | Description |
|--------------|-------------|
| **GetMe**    | Returns `{ userId, userDetails, identityProvider, userRoles }` from the EasyAuth principal. Useful for debugging the auth context.
| **contact**  | Accepts `POST` JSON `{ name, email, subject, message }`. Validates input, logs every submission, and (optionally) relays through SendGrid if the email env vars are set.
| **likes**    | `GET /api/likes?slug=<id>` reads the current like count. `POST /api/likes` with `{ slug }` increments it. Stores data in Cosmos DB when configured, otherwise falls back to an in-memory map (for local dev/demo).
| **scores**   | `GET /api/scores?gameId=<id>` returns the leaderboard (top 10 by default). `POST /api/scores` with `{ gameId, score }` upserts the caller's personal best. Uses Cosmos DB when configured (same container as likes) and falls back to in-memory storage for local dev.

### Environment Variables

Configure these under **Static Web App → Configuration** (or a local `local.settings.json` when running Functions locally).

| Name | Purpose |
|------|---------|
| `GOOGLE_CLIENT_ID` | Client ID for the custom Google OIDC provider.
| `COSMOS_CONNECTION_STRING` | Cosmos DB connection string (AccountEndpoint + Key).
| `COSMOS_DB` | Cosmos DB database that contains the likes container (e.g. `site`).
| `COSMOS_PLAYERDATA_CONTAINER` | Cosmos container for like and score documents (partition key `/slug`).
| `SENDGRID_API_KEY` | *(Optional)* API key for SendGrid email delivery.
| `CONTACT_TO` | *(Optional)* Destination email for contact messages (required if SendGrid is used).
| `CONTACT_FROM` | *(Optional)* Verified sender address. Defaults to `CONTACT_TO` if omitted.
> Likes and score documents share the same container. Each item carries a docType field ("likes" or "score") and uses the slug/game id as the partition key.

## GitHub Actions Deployment

The workflow at `.github/workflows/azure-static-web-apps.yml` deploys on:

- every push to `main`
- every PR targeting `main` (preview environments)

Add the deployment token from the SWA resource as the repository secret `AZURE_STATIC_WEB_APPS_API_TOKEN` and enable GitHub Actions for the repo.

## Local Development

1. Install function dependencies:
   ```bash
   cd api
   npm install
   ```
2. Use the Azure Functions Core Tools to run the API locally (requires EasyAuth forwarding or mock headers for testing):
   ```bash
   func start
   ```
3. Serve the static site (any static server will do) and point requests to the local Functions host if needed.

> Note: Because EasyAuth runs on the platform, local testing of protected endpoints needs mock `x-ms-client-principal` headers or the SWA CLI (`swa start`).

## Credits

- Original design/content from the PHP site preserved in `index.html`, `style.css`, and `privacy.html`.
- Azure Static Web Apps for auth and hosting, Cosmos DB for persistent likes, and SendGrid for email relay (optional).







