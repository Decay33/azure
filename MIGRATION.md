# Migration Guide: From Gaming Site to YourSocialLinks

This document explains how to migrate from the existing gaming-focused Azure Static Web App to the new YourSocialLinks platform while preserving your existing Google login configuration.

## Overview

The migration involves:
1. Preserving existing Azure SWA and Google OAuth configuration
2. Adding Azure AD B2C for email/password login
3. Deploying new frontend and API code
4. Setting up Cosmos DB and Stripe integration

## Pre-Migration Checklist

- [ ] Backup existing Azure SWA configuration
- [ ] Export any existing user data (if applicable)
- [ ] Note down current Google OAuth Client ID and Secret
- [ ] Verify domain DNS configuration
- [ ] Create Cosmos DB account (serverless)
- [ ] Create Stripe account and get API keys

## Step 1: Preserve Google Login

### Current Configuration
Your existing Google OAuth configuration is already working. We'll keep it intact.

1. **Verify Current Settings** (Azure Portal → Static Web Apps → Configuration)
   ```
   Authentication provider: Google
   Client ID: <existing-google-client-id>
   Client Secret: <existing-google-client-secret>
   ```

2. **No Changes Required**
   - The new code uses the same `/.auth/login/google` endpoint
   - User sessions will continue to work
   - No user re-authentication needed

## Step 2: Add Email/Password Login (Azure AD B2C)

### Create Azure AD B2C Tenant

1. **Create B2C Tenant**
   - Azure Portal → Create a resource → Azure Active Directory B2C
   - Tenant name: `yoursociallinks`
   - Domain: `yoursociallinks.onmicrosoft.com`

2. **Create Sign-up/Sign-in User Flow**
   - B2C Portal → User flows → New user flow
   - Type: Sign up and sign in
   - Version: Recommended
   - Name: `B2C_1_signupsignin`
   - Identity providers: Email signup
   - User attributes: Email Address, Display Name

3. **Register Application**
   - B2C Portal → Applications → Add
   - Name: YourSocialLinks
   - Web App: Yes
   - Redirect URIs: `https://yoursociallinks.com/.auth/login/aad/callback`
   - Generate client secret
   - Note: Client ID and Client Secret

4. **Add to SWA Configuration**
   
   Add to `staticwebapp.config.json`:
   ```json
   {
     "auth": {
       "identityProviders": {
         "azureActiveDirectory": {
           "registration": {
             "openIdIssuer": "https://yoursociallinks.b2clogin.com/yoursociallinks.onmicrosoft.com/v2.0/.well-known/openid-configuration?p=B2C_1_signupsignin",
             "clientIdSettingName": "AAD_CLIENT_ID",
             "clientSecretSettingName": "AAD_CLIENT_SECRET"
           }
         }
       }
     }
   }
   ```

   Add to Azure App Settings:
   ```
   AAD_CLIENT_ID=<your-b2c-client-id>
   AAD_CLIENT_SECRET=<your-b2c-client-secret>
   ```

## Step 3: Set Up Cosmos DB

1. **Create Cosmos DB Account**
   ```bash
   # Via Azure Portal or CLI
   az cosmosdb create \
     --name yoursociallinks-db \
     --resource-group your-resource-group \
     --kind GlobalDocumentDB \
     --capabilities EnableServerless
   ```

2. **Get Connection Details**
   - Azure Portal → Cosmos DB → Keys
   - Copy URI and Primary Key

3. **Run Setup Script**
   ```bash
   export COSMOS_ENDPOINT="https://your-account.documents.azure.com:443/"
   export COSMOS_KEY="your-primary-key"
   npx ts-node scripts/setup-cosmos.ts
   ```

4. **Add to Azure App Settings**
   ```
   COSMOS_ENDPOINT=https://your-account.documents.azure.com:443/
   COSMOS_KEY=your-primary-key
   COSMOS_DB=ysl
   COSMOS_PROFILES_CONTAINER=profiles
   COSMOS_EVENTS_CONTAINER=events
   ```

## Step 4: Configure Stripe

1. **Create Stripe Account** (if not exists)
   - Sign up at https://stripe.com

2. **Create Product and Price**
   ```bash
   # Via Stripe Dashboard or API
   Product ID: prod_TN0iLZlXlOo8iH (already exists per your spec)
   Price: $8.00/month recurring
   ```

3. **Get API Keys**
   - Stripe Dashboard → Developers → API keys
   - Use **Test keys** for development
   - Use **Live keys** for production

4. **Configure Webhook**
   - Stripe Dashboard → Developers → Webhooks → Add endpoint
   - URL: `https://yoursociallinks.com/api/stripe/webhook`
   - Events:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_failed`
   - Copy webhook signing secret

5. **Add to Azure App Settings**
   ```
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   STRIPE_PRICE_CREATOR=price_...
   STRIPE_PRODUCT_CREATOR=prod_TN0iLZlXlOo8iH
   ```

## Step 5: Configure Azure Storage (for avatars)

1. **Create Storage Account** (if not exists)
   ```bash
   az storage account create \
     --name yoursociallinks \
     --resource-group your-resource-group \
     --sku Standard_LRS
   ```

2. **Create Container**
   ```bash
   az storage container create \
     --name ysl-public \
     --account-name yoursociallinks \
     --public-access blob
   ```

3. **Get Connection String**
   - Azure Portal → Storage Account → Access keys

4. **Add to Azure App Settings**
   ```
   STORAGE_ACCOUNT=yoursociallinks
   STORAGE_KEY=your-storage-key
   STORAGE_CONTAINER=ysl-public
   ```

## Step 6: Deploy New Code

1. **Remove Old Game Files**
   ```bash
   rm -rf cavegrok/ chromaticrunner/ diceflip/ members/ tools/
   rm index.html style.css
   ```

2. **Commit New Code**
   ```bash
   git add .
   git commit -m "Migrate to YourSocialLinks platform"
   ```

3. **Push to Main Branch**
   ```bash
   git push origin main
   ```

4. **Monitor Deployment**
   - GitHub Actions tab will show deployment progress
   - Typically takes 3-5 minutes

## Step 7: Update DNS (if changing domain)

If switching from `jolly-pond-*.azurestaticapps.net` to `yoursociallinks.com`:

1. **Add Custom Domain in Azure**
   - Azure Portal → Static Web Apps → Custom domains
   - Add: `yoursociallinks.com` and `www.yoursociallinks.com`

2. **Update DNS Records**
   ```
   Type: CNAME
   Name: @
   Value: jolly-pond-0f1ae1210.3.azurestaticapps.net
   
   Type: CNAME
   Name: www
   Value: jolly-pond-0f1ae1210.3.azurestaticapps.net
   ```

3. **Validate Domain**
   - Wait for DNS propagation (5-30 minutes)
   - Azure will automatically provision SSL certificate

## Step 8: Test Migration

### Manual Testing

1. **Test Google Login**
   ```
   Visit: https://yoursociallinks.com
   Click: "Sign in with Google"
   Verify: Redirected to Google, then back to /dashboard
   ```

2. **Test Email Login**
   ```
   Visit: https://yoursociallinks.com
   Click: "Sign in with Email"
   Verify: B2C sign-up form appears
   Create account and verify email
   ```

3. **Test Handle Claim**
   ```
   After login, claim a unique handle (e.g., "testuser")
   Verify: Profile created in Cosmos DB
   ```

4. **Test Public Profile**
   ```
   Visit: https://yoursociallinks.com/testuser
   Verify: Profile page renders with links
   ```

5. **Test Stripe Checkout**
   ```
   Dashboard → Subscription → Upgrade to Creator
   Use test card: 4242 4242 4242 4242
   Verify: Subscription activated
   ```

### Automated Testing

```bash
# Run smoke tests
npm run test:e2e
```

## Step 9: Post-Migration Tasks

- [ ] Monitor Application Insights for errors
- [ ] Check Cosmos DB request charges
- [ ] Verify webhook deliveries in Stripe dashboard
- [ ] Test on mobile devices
- [ ] Run Lighthouse performance audit
- [ ] Update marketing materials with new URLs

## Rollback Plan

If issues arise:

1. **Revert Git Commit**
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Restore Previous Deployment**
   - Azure Portal → Static Web Apps → Deployments
   - Select previous successful deployment
   - Click "Redeploy"

3. **Verify Rollback**
   - Old site should be live within 2-3 minutes
   - Google login still works (never changed)

## Common Issues

### Issue: Google Login Not Working
**Solution**: 
- Verify Google OAuth redirect URI includes `/.auth/login/google/callback`
- Check Azure App Settings for correct Client ID/Secret

### Issue: B2C Login Fails
**Solution**:
- Verify B2C tenant configuration
- Check redirect URIs match exactly
- Ensure user flow is published

### Issue: Cosmos DB Connection Error
**Solution**:
- Verify endpoint and key in App Settings
- Check firewall rules allow Azure services
- Ensure containers were created

### Issue: Stripe Webhook Not Firing
**Solution**:
- Verify webhook URL is correct and public
- Check webhook signing secret matches
- Test webhook using Stripe CLI

### Issue: 404 on Profile Pages
**Solution**:
- Check `staticwebapp.config.json` routes
- Verify `/:handle` route has correct rewrite
- Clear browser cache

## Data Migration (if needed)

If you had existing users in the old system:

1. **Export Old Data**
   ```bash
   # From old database or API
   curl https://your-old-api.com/export > old-users.json
   ```

2. **Transform to New Schema**
   ```javascript
   // scripts/migrate-users.ts
   // Map old user format to new Profile schema
   ```

3. **Import to Cosmos DB**
   ```bash
   npx ts-node scripts/migrate-users.ts
   ```

## Support

If you encounter issues during migration:

1. Check logs in Azure Portal → Application Insights
2. Review this migration guide thoroughly
3. Check GitHub issues for similar problems
4. Contact support at support@yoursociallinks.com

## Success Criteria

Migration is complete when:

- ✅ Google login works
- ✅ Email/password login works
- ✅ Users can claim handles
- ✅ Public profiles are accessible
- ✅ Links can be added/edited
- ✅ Stripe checkout works
- ✅ No errors in Application Insights
- ✅ Custom domain resolves correctly
- ✅ SSL certificate is valid

---

**Estimated Migration Time**: 2-3 hours
**Downtime Required**: None (blue-green deployment)
**Rollback Time**: < 5 minutes

Good luck with your migration! 🚀


