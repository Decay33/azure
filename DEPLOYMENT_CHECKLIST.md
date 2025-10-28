# 🚀 Deployment Checklist

Complete these steps in order to deploy your GameHub with authentication.

## ✅ Step 1: Update GitHub Secret

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Find or add: `AZURE_STATIC_WEB_APPS_API_TOKEN_JOLLY_POND_0F1AE1210`
4. Paste this value:
```
4d924b7f3f1d62ab9fe5b0cc06df566c078acc92af4edeff05e73077e40eb8af03-94e901fb-3f69-4968-bb32-b380bc0b31e901021210f1ae1210
```

## ✅ Step 2: Configure Azure Application Settings

### 2a. Set Up Cosmos DB Settings

1. Go to **Azure Portal** → **gamehub-cosmos1234** resource
2. Click **Keys** in left menu
3. Copy the **URI** and **PRIMARY KEY**
4. Go to **game-hub-swa** resource → **Configuration** → **Application settings**
5. Add these 4 settings:

| Name | Value |
|------|-------|
| `COSMOS_ENDPOINT` | `https://YOUR-COSMOS.documents.azure.com:443/` |
| `COSMOS_KEY` | `YOUR-PRIMARY-KEY-HERE` |
| `COSMOS_DB` | `gamehub` |
| `COSMOS_PLAYERDATA_CONTAINER` | `playerdata` |

### 2b. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select or create a project
3. **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Settings:
   - Application type: **Web application**
   - Name: `GameHub Static Web App`
   - Authorized JavaScript origins:
     - `https://jolly-pond-0f1ae1210.3.azurestaticapps.net`
   - Authorized redirect URIs:
     - `https://jolly-pond-0f1ae1210.3.azurestaticapps.net/.auth/login/google/callback`
6. Click **Create** and copy the Client ID and Client Secret
7. Back in Azure Portal → **game-hub-swa** → **Configuration**
8. Add these 2 settings:

| Name | Value |
|------|-------|
| `GOOGLE_CLIENT_ID` | `YOUR-CLIENT-ID.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | `YOUR-CLIENT-SECRET` |

9. Click **Save** at the top!

## ✅ Step 3: Verify Cosmos DB Container

1. Go to **Azure Portal** → **gamehub-cosmos1234**
2. Click **Data Explorer**
3. Verify you have:
   - Database: `gamehub`
   - Container: `playerdata` with partition key `/playerId`

If missing:
1. Click **New Container**
2. Database id: `gamehub` (create new or use existing)
3. Container id: `playerdata`
4. Partition key: `/playerId`
5. Throughput: 400 RU/s (Manual)
6. Click **OK**

## ✅ Step 4: Deploy from GitHub

Once all settings are configured:

```bash
cd C:\theaidemocracy\azure

# Stage all changes
git add .

# Commit
git commit -m "Add authentication and scoring system"

# Push to trigger deployment
git push
```

## ✅ Step 5: Monitor Deployment

1. Go to your GitHub repository
2. Click **Actions** tab
3. Watch the workflow run
4. Wait for green checkmark ✅ (takes 2-5 minutes)

## ✅ Step 6: Test Your Site

### 6a. Test Public Access
1. Visit: `https://jolly-pond-0f1ae1210.3.azurestaticapps.net`
2. You should see the Game Hub homepage
3. Games should be accessible (Cave Grok, Chromatic Runner)

### 6b. Test Authentication
1. Click **"Sign in with Google"**
2. Complete Google OAuth flow
3. You should be redirected back to your site
4. Your name should appear in the header

### 6c. Test Scoring System
1. After signing in, scroll to **"📊 Scoring System Demo"**
2. Try submitting a test score:
   - Game ID: `cavegrok`
   - Score: `1500`
   - Click **Submit Score**
3. Try viewing leaderboard:
   - Game ID: `cavegrok`
   - Limit: `10`
   - Click **Get Leaderboard**
4. Try viewing your scores:
   - Leave blank or type `cavegrok`
   - Click **Get My Scores**

## 🐛 Troubleshooting

### Deployment Still Fails
- Check GitHub Actions logs for specific errors
- Verify the deployment token in GitHub Secrets matches Azure
- Try resetting the deployment token in Azure Portal

### Authentication Doesn't Work
- Verify Google OAuth credentials are correct in Azure Configuration
- Check that redirect URI matches exactly
- Make sure you clicked **Save** in Azure Configuration
- Wait 5 minutes for settings to propagate

### API Returns 500 Errors
- Check Cosmos DB settings are correct
- Verify Cosmos DB container exists with correct partition key
- Check Application Insights logs in Azure Portal

### Site Not Loading
- Check Azure Portal → game-hub-swa → Overview for errors
- Verify deployment succeeded in GitHub Actions
- Try hard refresh: Ctrl+Shift+R

## 📊 Success Indicators

✅ GitHub Actions shows green checkmark
✅ Azure Portal shows "Succeeded" deployment
✅ Homepage loads at: `https://jolly-pond-0f1ae1210.3.azurestaticapps.net`
✅ Can sign in with Google
✅ Can submit scores
✅ Can view leaderboard
✅ Games (Cave Grok, Chromatic Runner) work

## 🎯 Next Steps After Successful Deployment

1. **Integrate Scoring into Games:**
   - Add score submission to Cave Grok (when level completes)
   - Add score submission to Chromatic Runner (when game ends)
   - Display leaderboards in game UI

2. **Customize:**
   - Update site branding
   - Add more games
   - Customize scoring rules

3. **Monitor:**
   - Check Cosmos DB usage in Azure Portal
   - Monitor costs
   - Review Application Insights logs

---

**Need Help?** Check SETUP_GUIDE.md and API_REFERENCE.md for detailed documentation.

**Your Site URL:** https://jolly-pond-0f1ae1210.3.azurestaticapps.net

