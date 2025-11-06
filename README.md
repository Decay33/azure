# YourSocialLinks (YSL)

A modern link-in-bio platform that lets creators share all their social profiles, content, and important links in one beautiful, mobile-friendly page.

## 🌟 Features

- **Custom Profile URLs**: Claim your unique handle at `yoursociallinks.com/yourhandle`
- **Up to 25 Links**: Share all your important links (Free plan: 4 links)
- **8 Video Links**: Showcase TikTok, YouTube, and other videos (Free plan: 3 videos)
- **Custom Themes**: Personalize with colors and animated backgrounds
- **Analytics**: Track views and engagement (Creator plan)
- **Google & Email Login**: Multiple authentication options
- **Mobile Optimized**: Perfect experience on all devices
- **Subscription Plans**: Free and $8/month Creator plan with Stripe

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Azure account with:
  - Azure Static Web Apps
  - Cosmos DB (Serverless)
  - Azure Storage Account
- Stripe account (for subscriptions)
- Google OAuth credentials (already configured)

### Local Development

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd azure
```

2. **Install dependencies**
```bash
# Frontend
npm install

# API
cd api && npm install && cd ..
```

3. **Set up environment variables**

Copy `.env.example` and fill in your values:
```bash
cp .env.example .env
```

Required variables:
- `COSMOS_ENDPOINT`: Your Cosmos DB endpoint
- `COSMOS_KEY`: Your Cosmos DB primary key
- `STRIPE_SECRET_KEY`: Stripe secret key (test mode for dev)
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook signing secret
- `STRIPE_PRICE_CREATOR`: Stripe price ID for Creator plan
- `AAD_CLIENT_ID`: Azure AD B2C client ID
- `AAD_CLIENT_SECRET`: Azure AD B2C client secret

4. **Set up Cosmos DB**
```bash
npm install -g ts-node
export COSMOS_ENDPOINT="your-endpoint"
export COSMOS_KEY="your-key"
npx ts-node scripts/setup-cosmos.ts
```

5. **Run development servers**
```bash
# Frontend (runs on port 4280)
npm run dev

# API (runs on port 7071)
cd api
npm run start
```

6. **Access the application**
- Frontend: http://localhost:4280
- API: http://localhost:7071/api

## 📦 Project Structure

```
yoursociallinks/
├── src/                          # Frontend React application
│   ├── components/               # React components
│   │   └── ui/                  # shadcn/ui components
│   ├── contexts/                # React contexts (Auth)
│   ├── lib/                     # Utility functions
│   └── pages/                   # Page components
│       ├── Landing.tsx          # Marketing homepage
│       ├── Dashboard.tsx        # User dashboard (auth required)
│       └── PublicProfile.tsx    # Public profile view (/:handle)
├── api/                         # Azure Functions (TypeScript)
│   ├── shared/                  # Shared utilities
│   │   ├── auth.ts             # Authentication helpers
│   │   ├── cosmos.ts           # Cosmos DB client
│   │   └── validation.ts       # Input validation
│   ├── stripe/                  # Stripe integration
│   │   ├── createCheckoutSession.ts
│   │   ├── portal.ts
│   │   └── webhook.ts
│   ├── claimHandle.ts          # POST /api/claimHandle
│   ├── checkHandle.ts          # GET /api/check-handle/{handle}
│   ├── me.ts                   # GET /api/me
│   ├── profile.ts              # GET /api/profile/{handle}
│   ├── updateProfile.ts        # POST /api/profile/update
│   ├── subscriptionStatus.ts  # GET /api/subscription-status
│   └── trackView.ts            # POST /api/trackView
├── scripts/                     # Setup and utility scripts
│   ├── setup-cosmos.ts         # Cosmos DB initialization
│   └── seed-data.ts            # Demo data seeding
├── .github/workflows/           # CI/CD
│   └── azure-static-web-apps.yml
├── staticwebapp.config.json    # SWA routing and config
├── vite.config.ts              # Vite configuration
├── tailwind.config.js          # Tailwind CSS configuration
└── package.json                # Dependencies and scripts
```

## 🗄️ Data Model

### Profiles Container (partition key: `/handle`)

```typescript
{
  id: string;                    // "usr_<uuid>"
  userId: string;                // "google:<sub> | aad:<oid>"
  handle: string;                // "yourhandle"
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  theme: {
    style: string;               // "gradient" | "stripes"
    accent: string;              // "#8b5cf6"
  };
  links: Array<{
    id: string;
    label: string;
    url: string;
    icon?: string;
    order: number;
  }>;
  videoLinks: Array<{
    id: string;
    platform: string;            // "tiktok" | "youtube" | "other"
    url: string;
    thumb?: string;
    order: number;
  }>;
  status: string;                // "active" | "suspended" | "canceled"
  subscription?: {
    tier: string;                // "free" | "creator"
    status: string;              // "active" | "past_due" | "canceled"
    currentPeriodEnd?: string;
  };
  createdAt: string;
  updatedAt: string;
  ttl: number;                   // -1 (never expire) or seconds until deletion
}
```

### Events Container (partition key: `/handle`)

```typescript
{
  id: string;                    // "evt_<uuid>"
  handle: string;
  type: string;                  // "view"
  ts: string;                    // ISO timestamp
  ua?: string;                   // User agent
  ref?: string;                  // Referrer URL
}
```

## 🔐 Authentication

The application supports two authentication methods:

1. **Google OAuth** (already configured)
   - Sign in URL: `/.auth/login/google`
   
2. **Email/Password via Azure AD B2C**
   - Sign in URL: `/.auth/login/aad`
   - Requires Azure AD B2C tenant setup

User principals are accessed via the `x-ms-client-principal` header in API functions.

## 💳 Stripe Integration

### Setup

1. **Create Stripe Product**
   - Product ID: `prod_TN0iLZlXlOo8iH` (already created)
   - Price: $8/month recurring

2. **Configure Webhook**
   - URL: `https://yoursociallinks.com/api/stripe/webhook`
   - Events to listen for:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_failed`

3. **Set Environment Variables**
```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_CREATOR=price_...
STRIPE_PRODUCT_CREATOR=prod_TN0iLZlXlOo8iH
```

### Testing

Use Stripe test mode:
- Test card: 4242 4242 4242 4242
- Any future expiration date
- Any CVC

## 🚢 Deployment

### Azure Static Web Apps

1. **Connect GitHub Repository**
   - Go to Azure Portal → Static Web Apps
   - Connect your GitHub repository
   - Azure will create a workflow file automatically

2. **Configure App Settings**

Add these in Azure Portal → Configuration:
```
COSMOS_ENDPOINT=https://...
COSMOS_KEY=...
COSMOS_DB=ysl
COSMOS_PROFILES_CONTAINER=profiles
COSMOS_EVENTS_CONTAINER=events
STORAGE_ACCOUNT=...
STORAGE_KEY=...
STORAGE_CONTAINER=ysl-public
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_CREATOR=price_...
STRIPE_PRODUCT_CREATOR=prod_TN0iLZlXlOo8iH
AAD_CLIENT_ID=...
AAD_CLIENT_SECRET=...
FRONTEND_URL=https://yoursociallinks.com
```

3. **Configure Custom Domain**
   - Add custom domain in Azure Portal
   - Update DNS records
   - SSL certificate is automatically provisioned

4. **Deploy**
```bash
git push origin main
```

The GitHub Action will automatically build and deploy.

## 📱 API Endpoints

### Public Endpoints

- `GET /api/profile/{handle}` - Get public profile
- `POST /api/trackView` - Log profile view
- `GET /api/check-handle/{handle}` - Check handle availability
- `POST /api/stripe/webhook` - Stripe webhook handler

### Authenticated Endpoints

- `POST /api/claimHandle` - Claim a new handle
- `GET /api/me` - Get own profile
- `POST /api/profile/update` - Update profile
- `GET /api/subscription-status` - Get subscription info
- `POST /api/stripe/createCheckoutSession` - Start subscription
- `POST /api/stripe/portal` - Access billing portal

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run e2e tests (requires Playwright)
npm run test:e2e
```

## 📊 Monitoring

- Application Insights is configured automatically
- Monitor in Azure Portal → Application Insights
- Key metrics:
  - API response times
  - Error rates
  - User flows

## 🔒 Security

- HTTPS enforced
- Authentication required for sensitive endpoints
- Input validation on all user data
- URL sanitization
- Rate limiting on view tracking
- Bot filtering

## 📈 Performance

- Lighthouse score target: ≥90 (mobile and desktop)
- Page size: ≤500 KB (no hosted videos)
- CDN caching enabled
- Code splitting via Vite
- Optimized images

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📝 License

All rights reserved.

## 🆘 Support

For issues or questions:
- Open a GitHub issue
- Email: support@yoursociallinks.com

## 🎯 Roadmap

- [ ] Custom domains for profiles
- [ ] Advanced analytics dashboard
- [ ] Profile templates
- [ ] Social media scheduling
- [ ] Team collaboration features
- [ ] White-label option for agencies
