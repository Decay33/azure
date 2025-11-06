# YourSocialLinks - Deployment Checklist

Use this checklist to ensure all components are properly configured before going live.

## Pre-Deployment

### 1. Azure Resources

- [ ] **Azure Static Web Apps**
  - [ ] Resource created in Azure Portal
  - [ ] GitHub repository connected
  - [ ] Deployment workflow file committed (`.github/workflows/azure-static-web-apps.yml`)

- [ ] **Cosmos DB**
  - [ ] Account created (Serverless mode recommended)
  - [ ] Database `ysl` created
  - [ ] Container `profiles` created (partition key: `/handle`)
  - [ ] Container `events` created (partition key: `/handle`, TTL: 30 days)
  - [ ] Connection string secured

- [ ] **Azure Storage**
  - [ ] Storage account created
  - [ ] Container `ysl-public` created
  - [ ] Public access set to Blob
  - [ ] Access keys secured

### 2. Authentication

- [ ] **Google OAuth**
  - [ ] Google Cloud Console project created
  - [ ] OAuth consent screen configured
  - [ ] Credentials created (Web application)
  - [ ] Authorized redirect URI added: `https://yoursociallinks.com/.auth/login/google/callback`
  - [ ] Client ID and Secret noted

- [ ] **Azure AD B2C** (for email/password)
  - [ ] B2C tenant created
  - [ ] User flow created (`B2C_1_signupsignin`)
  - [ ] Application registered
  - [ ] Redirect URI configured: `https://yoursociallinks.com/.auth/login/aad/callback`
  - [ ] Client ID and Secret noted

### 3. Stripe

- [ ] **Account Setup**
  - [ ] Stripe account created
  - [ ] Business details completed
  - [ ] Bank account connected (for payouts)

- [ ] **Product Configuration**
  - [ ] Product created: YourSocialLinks Creator
  - [ ] Product ID verified: `prod_TN0iLZlXlOo8iH`
  - [ ] Price created: $8.00/month recurring
  - [ ] Price ID noted

- [ ] **Webhook**
  - [ ] Endpoint added: `https://yoursociallinks.com/api/stripe/webhook`
  - [ ] Events selected:
    - [ ] `checkout.session.completed`
    - [ ] `customer.subscription.updated`
    - [ ] `customer.subscription.deleted`
    - [ ] `invoice.payment_failed`
  - [ ] Webhook signing secret noted

- [ ] **API Keys**
  - [ ] Test keys available for staging
  - [ ] Live keys available for production
  - [ ] Keys secured (never commit to Git)

## Azure Configuration

### Application Settings

Add these in Azure Portal → Static Web Apps → Configuration → Application Settings:

```bash
# Cosmos DB
COSMOS_ENDPOINT=https://your-account.documents.azure.com:443/
COSMOS_KEY=<primary-key>
COSMOS_DB=ysl
COSMOS_PROFILES_CONTAINER=profiles
COSMOS_EVENTS_CONTAINER=events

# Azure Storage
STORAGE_ACCOUNT=yoursociallinks
STORAGE_KEY=<storage-key>
STORAGE_CONTAINER=ysl-public

# Stripe
STRIPE_SECRET_KEY=sk_live_...   # Use sk_test_... for staging
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_CREATOR=price_...
STRIPE_PRODUCT_CREATOR=prod_TN0iLZlXlOo8iH

# Azure AD B2C
AAD_CLIENT_ID=<b2c-client-id>
AAD_CLIENT_SECRET=<b2c-client-secret>

# Application
FRONTEND_URL=https://yoursociallinks.com
```

Checklist:
- [ ] All settings added
- [ ] No typos in keys/URLs
- [ ] Secrets are secured
- [ ] Settings saved

## Domain Configuration

### Custom Domain

- [ ] **DNS Configuration**
  - [ ] CNAME record for `@` pointing to Azure SWA URL
  - [ ] CNAME record for `www` pointing to Azure SWA URL
  - [ ] DNS propagation verified (use `nslookup` or `dig`)

- [ ] **Azure SWA Custom Domain**
  - [ ] Domain added in Azure Portal
  - [ ] Domain validated
  - [ ] SSL certificate automatically provisioned
  - [ ] Certificate status: Ready

- [ ] **Redirects**
  - [ ] `www` redirects to apex domain (or vice versa)
  - [ ] HTTP redirects to HTTPS

## Code Deployment

### Repository

- [ ] **Code Ready**
  - [ ] All frontend code committed
  - [ ] All API functions committed
  - [ ] Configuration files committed (`staticwebapp.config.json`, `package.json`, etc.)
  - [ ] `.env.example` committed (without actual secrets)
  - [ ] Documentation committed (`README.md`, `ARCHITECTURE.md`, etc.)

- [ ] **GitHub Actions**
  - [ ] Workflow file exists: `.github/workflows/azure-static-web-apps.yml`
  - [ ] Secret `AZURE_STATIC_WEB_APPS_API_TOKEN` added to repository
  - [ ] Workflow has run successfully at least once

### Build Verification

- [ ] **Local Build**
  ```bash
  npm install
  npm run build
  # Verify no errors
  ```

- [ ] **Local API Build**
  ```bash
  cd api
  npm install
  npm run build
  # Verify no errors
  ```

- [ ] **Local Testing**
  ```bash
  npm run dev           # Frontend
  cd api && npm start   # API (in separate terminal)
  # Test locally before deploying
  ```

## Deployment

### Deploy to Production

- [ ] **Push to Main**
  ```bash
  git push origin main
  ```

- [ ] **Monitor Deployment**
  - [ ] GitHub Actions workflow running
  - [ ] Build successful
  - [ ] Deployment successful
  - [ ] No errors in logs

- [ ] **Verify Deployment**
  - [ ] Visit `https://yoursociallinks.com`
  - [ ] Frontend loads
  - [ ] No console errors
  - [ ] Assets loading from CDN

## Post-Deployment Testing

### Critical Paths

- [ ] **Landing Page**
  - [ ] Page loads
  - [ ] Navigation works
  - [ ] CTA buttons work

- [ ] **Authentication**
  - [ ] Google login works
  - [ ] Email/password login works
  - [ ] Logout works
  - [ ] Redirect to dashboard after login

- [ ] **Handle Claiming**
  - [ ] Can check handle availability
  - [ ] Can claim unique handle
  - [ ] Validation works (reserved words, length, etc.)

- [ ] **Profile Management**
  - [ ] Can update display name
  - [ ] Can add bio
  - [ ] Can add links
  - [ ] Can add video links
  - [ ] Changes save successfully

- [ ] **Public Profile**
  - [ ] Can visit `/:handle`
  - [ ] Profile renders correctly
  - [ ] Links work
  - [ ] Mobile responsive

- [ ] **Subscription**
  - [ ] "Upgrade" button works
  - [ ] Redirects to Stripe Checkout
  - [ ] Test payment with test card: `4242 4242 4242 4242`
  - [ ] Redirects back to dashboard
  - [ ] Subscription status updated
  - [ ] Limits increased (25 links, 8 videos)

- [ ] **Webhook**
  - [ ] Stripe webhook delivers successfully
  - [ ] Check Stripe Dashboard → Webhooks for delivery status
  - [ ] Subscription events update profile correctly

### Performance

- [ ] **Lighthouse Audit**
  - [ ] Performance: ≥90
  - [ ] Accessibility: ≥90
  - [ ] Best Practices: ≥90
  - [ ] SEO: ≥90

- [ ] **Page Load**
  - [ ] Landing page: < 2s
  - [ ] Dashboard: < 3s
  - [ ] Public profile: < 1.5s

### Security

- [ ] **SSL/TLS**
  - [ ] Certificate valid
  - [ ] No mixed content warnings
  - [ ] Security headers present

- [ ] **Authentication**
  - [ ] Unauthorized users cannot access `/dashboard`
  - [ ] API endpoints reject unauthenticated requests
  - [ ] User can only edit own profile

- [ ] **Input Validation**
  - [ ] Cannot use reserved handles
  - [ ] Cannot exceed link limits
  - [ ] Invalid URLs rejected
  - [ ] XSS attempts blocked

## Monitoring

### Application Insights

- [ ] **Setup**
  - [ ] Application Insights enabled for SWA
  - [ ] Instrumentation key configured
  - [ ] Logs flowing

- [ ] **Dashboards**
  - [ ] Overview dashboard created
  - [ ] Key metrics pinned:
    - [ ] Request rate
    - [ ] Response time
    - [ ] Failure rate
    - [ ] Active users

- [ ] **Alerts** (Recommended)
  - [ ] Alert: Response time > 5s
  - [ ] Alert: Error rate > 5%
  - [ ] Alert: Failed requests > 10/min

### Cosmos DB

- [ ] **Metrics**
  - [ ] Monitor RU/s consumption
  - [ ] Set budget alert if using provisioned throughput
  - [ ] Check for throttling

### Stripe

- [ ] **Dashboard**
  - [ ] Payments tab shows test transactions
  - [ ] Switch to live mode when ready
  - [ ] Webhook deliveries show success

## Go-Live

### Pre-Launch

- [ ] All checklist items completed
- [ ] No critical bugs
- [ ] Performance acceptable
- [ ] Security verified
- [ ] Monitoring in place

### Launch

- [ ] **Announce**
  - [ ] Social media posts
  - [ ] Email to existing users (if any)
  - [ ] Update marketing materials

- [ ] **Monitor**
  - [ ] Watch Application Insights for errors
  - [ ] Check Stripe dashboard
  - [ ] Monitor user sign-ups

### Post-Launch

- [ ] **First 24 Hours**
  - [ ] Monitor closely
  - [ ] Respond to issues quickly
  - [ ] Collect user feedback

- [ ] **First Week**
  - [ ] Review analytics
  - [ ] Identify bottlenecks
  - [ ] Plan improvements

- [ ] **First Month**
  - [ ] Review costs
  - [ ] Optimize performance
  - [ ] Add requested features

## Rollback Plan

If critical issues arise:

1. **Quick Rollback (< 5 minutes)**
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Manual Rollback (Azure Portal)**
   - Go to Static Web Apps → Deployments
   - Select previous successful deployment
   - Click "Redeploy"

3. **Database Rollback**
   - Cosmos DB supports point-in-time restore (up to 30 days)
   - Contact Azure support if needed

## Support Contacts

- **Azure Support**: https://portal.azure.com/#blade/Microsoft_Azure_Support/HelpAndSupportBlade
- **Stripe Support**: https://support.stripe.com
- **GitHub Support**: https://support.github.com
- **Internal Team**: support@yoursociallinks.com

---

**Deployment Date**: ___________
**Deployed By**: ___________
**Production URL**: https://yoursociallinks.com
**Status**: [ ] Success [ ] Issues [ ] Rolled Back

**Notes**:
_______________________________________________
_______________________________________________
_______________________________________________


