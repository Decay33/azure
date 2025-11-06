# YourSocialLinks - Architecture Documentation

## System Overview

YourSocialLinks is a serverless, cloud-native link-in-bio platform built on Azure Static Web Apps with a React frontend and Azure Functions backend.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Internet/Users                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Azure Static Web Apps (SWA)                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  CDN + Edge Network                                    │  │
│  │  - SSL/TLS Termination                                │  │
│  │  - Global distribution                                │  │
│  │  - Custom domain: yoursociallinks.com                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────┐      ┌─────────────────────────┐  │
│  │  React Frontend    │      │  Azure Functions API    │  │
│  │  - Vite bundled    │      │  - Node.js/TypeScript   │  │
│  │  - Tailwind CSS    │◄────►│  - Serverless compute   │  │
│  │  - shadcn/ui       │      │  - Auto-scaling         │  │
│  │  - Framer Motion   │      └──────────┬──────────────┘  │
│  └────────────────────┘                 │                   │
│                                          │                   │
│  ┌──────────────────────────────────────┴────────────────┐ │
│  │  Built-in Authentication (/.auth)                      │ │
│  │  - Google OAuth                                        │ │
│  │  - Azure AD B2C (email/password)                       │ │
│  └─────────────────────────────────────────────────────────│
└─────────────────────────────────────────────────────────────┘
                         │
         ┌───────────────┴───────────────┬──────────────┐
         │                               │              │
         ▼                               ▼              ▼
┌──────────────────┐          ┌─────────────────┐  ┌──────────────┐
│  Cosmos DB       │          │ Azure Blob       │  │   Stripe     │
│  (Serverless)    │          │ Storage          │  │   API        │
│                  │          │                  │  │              │
│  • profiles      │          │  • Avatars       │  │  • Payments  │
│  • events        │          │  • Assets        │  │  • Webhooks  │
└──────────────────┘          └─────────────────┘  └──────────────┘
```

## Technology Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 3
- **Component Library**: shadcn/ui (Radix UI primitives)
- **Animation**: Framer Motion
- **Routing**: React Router 6
- **State Management**: React Context API

### Backend
- **Runtime**: Node.js 20
- **Language**: TypeScript 5
- **Serverless**: Azure Functions v4
- **API Framework**: @azure/functions

### Data Layer
- **Primary Database**: Azure Cosmos DB (NoSQL)
  - Serverless capacity mode
  - Auto-scaling
  - Multi-region replication (optional)
- **Storage**: Azure Blob Storage
  - For avatars and static assets
- **Caching**: Azure CDN (built into SWA)

### Authentication
- **Provider**: Azure Static Web Apps Built-in Auth
- **Methods**: 
  - Google OAuth 2.0
  - Azure AD B2C (email/password, social providers)

### Payments
- **Provider**: Stripe
- **Integration**: Checkout Sessions + Customer Portal
- **Webhooks**: Event-driven subscription management

## Data Flow

### 1. User Registration Flow

```
User clicks "Sign in with Google"
  ↓
Redirect to /.auth/login/google
  ↓
Google OAuth flow
  ↓
Redirect to /dashboard with auth cookie
  ↓
Frontend reads /.auth/me
  ↓
User principal available in x-ms-client-principal header
  ↓
User claims handle via POST /api/claimHandle
  ↓
API validates handle and creates profile in Cosmos DB
```

### 2. Public Profile View Flow

```
User visits yoursociallinks.com/username
  ↓
React Router matches /:handle route
  ↓
PublicProfile component fetches GET /api/profile/{handle}
  ↓
API queries Cosmos DB profiles container
  ↓
Returns public profile data (status must be "active")
  ↓
React renders profile with links and video links
  ↓
Background: POST /api/trackView logs view event to Cosmos DB events container
```

### 3. Subscription Upgrade Flow

```
User clicks "Upgrade to Creator"
  ↓
POST /api/stripe/createCheckoutSession
  ↓
API creates Stripe Checkout Session
  ↓
User redirected to Stripe hosted checkout
  ↓
User completes payment
  ↓
Stripe webhook fires: checkout.session.completed
  ↓
POST /api/stripe/webhook
  ↓
API updates profile.subscription in Cosmos DB
  ↓
User redirected to /dashboard?success=true
  ↓
Dashboard shows Creator plan features unlocked
```

## Security Model

### Authentication
- All authenticated endpoints check `x-ms-client-principal` header
- Header contains base64-encoded JWT with user info
- Azure SWA validates tokens before forwarding to functions

### Authorization
- Handle ownership: `userId` field in profile tied to auth principal
- Subscription limits enforced server-side
- Public endpoints validate `status === 'active'` before returning data

### Input Validation
- Handle regex: `^[a-z0-9_-]{3,20}$`
- Reserved handles blocked
- URLs must be HTTPS
- String sanitization (max lengths)
- Array limits (25 links, 8 videos)

### Data Protection
- Cosmos DB connection strings in Azure App Settings
- Stripe keys in environment variables
- No sensitive data in client-side code
- CORS configured via SWA config

## Performance Optimizations

### Frontend
- Code splitting (React.lazy)
- Vendor chunk separation
- Tree shaking
- Minification and compression
- Image optimization (external CDN for user content)

### Backend
- Cosmos DB partition key design (`/handle`)
- Efficient queries with partition key
- Connection pooling (Cosmos client singleton)
- Function cold start mitigation (keep-warm patterns)

### Caching
- SWA CDN caches static assets
- `Cache-Control` headers configured
- Public profiles cached at edge (configurable TTL)

## Scalability

### Horizontal Scaling
- Azure Functions: Auto-scales based on demand
- Cosmos DB: Serverless mode scales RU/s automatically
- SWA CDN: Global distribution

### Limits
- Free plan: 4 links, 3 videos
- Creator plan: 25 links, 8 videos
- Enforced both client-side (UX) and server-side (validation)

### Cost Management
- Cosmos DB serverless: Pay per request
- Functions: Pay per execution
- SWA: Free tier or Standard plan
- No video hosting (external URLs only)

## Monitoring & Observability

### Application Insights
- Automatic instrumentation via SWA
- Custom events logged via `context.log`
- Tracked metrics:
  - API response times
  - Error rates
  - Dependency calls (Cosmos DB, Stripe)
  
### Logs
- Function execution logs
- Authentication events
- Webhook processing

### Alerts (Recommended)
- API error rate > 5%
- Function execution duration > 5s
- Cosmos DB throttling

## Deployment Pipeline

### CI/CD (GitHub Actions)

```yaml
Trigger: Push to main branch
  ↓
Checkout code
  ↓
Install dependencies (frontend + API)
  ↓
Build frontend (npm run build)
  ↓
Build API (tsc)
  ↓
Deploy to Azure SWA
  ↓
Run post-deployment tests (optional)
```

### Environments
- **Production**: `yoursociallinks.com`
- **Staging**: Auto-created for PRs (SWA preview environments)
- **Local**: `localhost:4280` (frontend) + `localhost:7071` (API)

## Database Schema Design

### Profiles Container

**Partition Key**: `/handle`

- **Why**: Handle is unique and used in most queries
- **Benefits**: Hot partition avoidance, direct queries by handle
- **Trade-off**: Cross-partition queries for userId lookups (acceptable for low frequency)

**Indexes**:
- Automatic indexing on all fields
- Exclude `_etag` for write performance

**TTL**:
- Enabled on `ttl` field
- Set to 31536000 seconds (1 year) when user cancels
- Profiles auto-delete after 1 year of cancelation

### Events Container

**Partition Key**: `/handle`

- **Why**: Events are always queried by handle for analytics
- **Benefits**: Efficient range queries for date-based analytics

**TTL**:
- Default TTL: 2592000 seconds (30 days)
- Old events auto-purge to save costs

## Error Handling

### API Responses
- `200`: Success
- `201`: Created (new profile)
- `400`: Bad request (validation error)
- `401`: Unauthorized
- `404`: Not found
- `409`: Conflict (handle taken)
- `422`: Unprocessable (limit exceeded)
- `500`: Server error

### Frontend
- Toast notifications for errors
- Retry logic for transient failures
- Graceful degradation (analytics tracking fails silently)

## Future Enhancements

### Planned
- **Redis Cache**: For view throttling and hot profile caching
- **Blob Storage SAS Tokens**: Direct upload from client
- **WebSockets**: Real-time analytics updates
- **Elasticsearch**: Full-text search for profiles
- **Multi-language**: i18n support

### Considered
- **GraphQL API**: For flexible client queries
- **Edge Functions**: Move some logic closer to users
- **Worker Threads**: Parallel processing for bulk operations

## Cost Estimation

### Free Tier (per user/month)
- Cosmos DB: ~$0.01 (serverless, minimal usage)
- Functions: ~$0.00 (free tier sufficient)
- Storage: ~$0.00 (negligible)
- SWA: Free tier
- **Total**: ~$0.01/user/month

### Creator Tier (per user/month)
- Same infrastructure costs
- Revenue: $8.00
- Stripe fees: ~$0.50
- **Net**: ~$7.50/user/month

### Break-even
- With 100 active free users: ~$1/month
- With 10 Creator subscribers: ~$75/month revenue
- Infrastructure handles 10,000+ users on standard pricing

## Security Considerations

### OWASP Top 10
- ✅ **Injection**: Parameterized Cosmos queries
- ✅ **Broken Auth**: SWA managed auth
- ✅ **Sensitive Data**: HTTPS only, secrets in Key Vault
- ✅ **XXE**: No XML parsing
- ✅ **Broken Access Control**: Server-side validation
- ✅ **Security Misconfiguration**: Reviewed SWA config
- ✅ **XSS**: React auto-escapes, sanitize user input
- ✅ **Insecure Deserialization**: JSON only
- ✅ **Components with Known Vulnerabilities**: Dependabot enabled
- ✅ **Insufficient Logging**: Application Insights

### Additional
- CSP headers (report-only initially)
- Rate limiting on public endpoints
- Bot filtering
- DDoS protection via Azure

## Disaster Recovery

### Backup Strategy
- Cosmos DB: Point-in-time restore (up to 30 days)
- Blob Storage: Soft delete enabled
- Code: Git repository

### Recovery Procedures
1. Restore Cosmos DB to last good state
2. Redeploy from main branch
3. Verify auth configuration
4. Test critical paths

**RTO**: 1 hour
**RPO**: 15 minutes

## Compliance

### GDPR
- User data deletion: TTL + manual purge
- Data export: API endpoint (future)
- Cookie consent: Banner (future)

### CCPA
- Do Not Sell: Not applicable (no data selling)
- Opt-out: Account cancellation flow

### PCI DSS
- Not applicable: Stripe handles all payment data
- No card data stored

---

**Document Version**: 1.0
**Last Updated**: 2025-11-06
**Author**: YourSocialLinks Team


