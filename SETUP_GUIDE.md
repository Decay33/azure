# Azure Static Web App - Setup Guide

This guide will help you deploy your GameHub application with authentication and scoring system.

## 📋 What Was Built

### API Functions Created
1. **`/api/user-init`** - Creates/updates user profile on first authenticated visit
2. **`/api/track`** - Tracks events (page views, clicks, etc.)
3. **`/api/submit-score`** - Submit game scores
4. **`/api/leaderboard`** - Get top scores for a game
5. **`/api/my-scores`** - Get current user's scores
6. **`/api/GetMe`** - Get current user info (already existed)

### Files Created/Modified
```
azure/
├── index.html                        [MODIFIED] - Added scoring demo UI
├── staticwebapp.config.json          [EXISTS] - Already configured correctly
├── api/
│   ├── package.json                  [MODIFIED] - Added @azure/cosmos
│   ├── GetMe/                        [EXISTS] - Unchanged
│   ├── user-init/
│   │   ├── function.json             [EXISTS] - Already configured
│   │   └── index.js                  [EXISTS] - Already implemented
│   ├── track/
│   │   ├── function.json             [EXISTS] - Already configured
│   │   └── index.js                  [EXISTS] - Already implemented
│   ├── submit-score/
│   │   ├── function.json             [NEW] - Created
│   │   └── index.js                  [NEW] - Created
│   ├── leaderboard/
│   │   ├── function.json             [NEW] - Created
│   │   └── index.js                  [NEW] - Created
│   └── my-scores/
│       ├── function.json             [NEW] - Created
│       └── index.js                  [NEW] - Created
└── SETUP_GUIDE.md                    [NEW] - This file
```

### Files Removed
- ❌ `index.php` - Azure Static Web Apps doesn't support PHP
- ❌ `indexbackup.php`
- ❌ `contact.php`
- ❌ `privacy.php`
- ❌ `tools.php`
- ❌ `db_config.php`
- ❌ `send_mail.php`
- ❌ `get_likes.php`
- ❌ `like.php`

---

## 🔧 Azure Portal Setup (One-Time)

### Step 1: Configure Cosmos DB Connection

1. Go to **Azure Portal** (https://portal.azure.com)
2. Navigate to your **Static Web App** resource
3. In the left menu, click **Configuration**
4. Click **+ Add** to add Application Settings:

Add these **4 settings** (if not already present):

| Name | Value | Notes |
|------|-------|-------|
| `COSMOS_ENDPOINT` | `https://YOUR-COSMOS-ACCOUNT.documents.azure.com:443/` | Get from Cosmos DB → Keys |
| `COSMOS_KEY` | `your-primary-key-here` | Get from Cosmos DB → Keys |
| `COSMOS_DB` | `gamehub` | Database name |
| `COSMOS_PLAYERDATA_CONTAINER` | `playerdata` | Container name |

5. Click **Save** at the top

### Step 2: Configure Google OAuth (If Not Done)

Your `staticwebapp.config.json` already has Google OIDC configured. Make sure these settings exist in Azure:

1. In your Static Web App, go to **Configuration**
2. Add these Application Settings:

| Name | Value | Where to Get |
|------|-------|--------------|
| `GOOGLE_CLIENT_ID` | `your-google-client-id` | Google Cloud Console → APIs & Services → Credentials |
| `GOOGLE_CLIENT_SECRET` | `your-google-client-secret` | Same place as Client ID |

3. Click **Save**

### Step 3: Verify Cosmos DB Container

1. Go to your **Cosmos DB** resource in Azure Portal
2. Click **Data Explorer**
3. Verify you have:
   - Database: `gamehub`
   - Container: `playerdata`
   - Partition key: `/playerId`

If the container doesn't exist:
1. Click **New Container**
2. Database id: `gamehub` (or select existing)
3. Container id: `playerdata`
4. Partition key: `/playerId`
5. Throughput: 400 RU/s (or Autoscale)
6. Click **OK**

---

## 🚀 GitHub Deployment

### Step 1: Push Your Code

Since this is your first day with Git, here's the exact process:

```bash
# Navigate to your azure folder
cd C:\theaidemocracy\azure

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Add scoring system with Cosmos DB integration"

# Add your GitHub repository as remote (replace with your repo URL)
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git

# Push to main branch
git push -u origin main
```

**Note:** You'll need to authenticate with GitHub. Use your GitHub username and a **Personal Access Token** (not your password).

To create a Personal Access Token:
1. Go to GitHub.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name like "Azure Deploy"
4. Check the "repo" scope
5. Click "Generate token"
6. Copy the token (you'll use this as your password when pushing)

### Step 2: Trigger Deployment

Your GitHub Actions workflow at `.github/workflows/azure-static-web-apps-jolly-pond-0f1ae1210.yml` will automatically:
1. Build your app
2. Deploy to Azure
3. Install npm dependencies (including @azure/cosmos)
4. Deploy all API functions

**Check deployment status:**
1. Go to your GitHub repository
2. Click **Actions** tab
3. You should see your workflow running
4. Wait for green checkmark ✓

---

## 🧪 Testing Your APIs

### Using the Web UI (Easiest Method)

1. **Visit your site:** `https://your-site.azurestaticapps.net`
2. **Sign in** with Google
3. **Scroll down** to the "📊 Scoring System Demo" section
4. Use the forms to:
   - Submit a test score
   - View the leaderboard
   - See your scores

### Using curl Commands

Replace `<your-site>` with your actual Azure Static Web App URL.

#### 1. Test Authentication
```bash
# This should redirect to Google login
curl -i https://<your-site>.azurestaticapps.net/api/user-init
```

#### 2. Get Your User Info (After logging in via browser)
```bash
curl -i https://<your-site>.azurestaticapps.net/.auth/me \
  -H "Cookie: StaticWebAppsAuthCookie=YOUR_COOKIE_HERE"
```

#### 3. Submit a Score
```bash
curl -i https://<your-site>.azurestaticapps.net/api/submit-score \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Cookie: StaticWebAppsAuthCookie=YOUR_COOKIE_HERE" \
  -d '{"gameId":"cavegrok","score":1500}'
```

#### 4. Get Leaderboard
```bash
curl -i "https://<your-site>.azurestaticapps.net/api/leaderboard?gameId=cavegrok&limit=10" \
  -H "Cookie: StaticWebAppsAuthCookie=YOUR_COOKIE_HERE"
```

#### 5. Get My Scores
```bash
curl -i "https://<your-site>.azurestaticapps.net/api/my-scores?gameId=cavegrok" \
  -H "Cookie: StaticWebAppsAuthCookie=YOUR_COOKIE_HERE"
```

**Note:** To get your cookie:
1. Sign in to your site via browser
2. Open DevTools (F12)
3. Go to Application → Cookies
4. Copy the `StaticWebAppsAuthCookie` value

---

## 📊 Cosmos DB Document Structure

### User Profile Document
```json
{
  "id": "google|123456789",
  "playerId": "google|123456789",
  "type": "user",
  "email": "player@example.com",
  "provider": "google",
  "displayName": "John Doe",
  "createdAt": 1699999999999,
  "lastSeenAt": 1700000000000
}
```

### Event Document
```json
{
  "id": "google|123456789-1700000000000-abc123",
  "playerId": "google|123456789",
  "type": "page_view",
  "payload": {
    "path": "/"
  },
  "ts": 1700000000000,
  "meta": {
    "email": "player@example.com",
    "provider": "google"
  }
}
```

### Score Document
```json
{
  "id": "google|123456789-1700000000000-xyz789",
  "playerId": "google|123456789",
  "type": "score",
  "gameId": "cavegrok",
  "score": 1500,
  "ts": 1700000000000,
  "displayName": "John Doe",
  "email": "player@example.com",
  "provider": "google"
}
```

---

## 🎮 Integrating Scoring into Your Games

### In Cave Grok or Chromatic Runner

Add this code when a player finishes a level:

```javascript
async function submitGameScore(gameId, score) {
  try {
    const response = await fetch('/api/submit-score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ gameId, score })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Score submitted:', result);
    return result;
  } catch (error) {
    console.error('Failed to submit score:', error);
    // Continue gameplay even if score submission fails
  }
}

// Example usage in your game
async function handleLevelComplete(finalScore) {
  // Show game over screen first
  showGameOverScreen(finalScore);
  
  // Then submit score in background
  await submitGameScore('cavegrok', finalScore);
  
  // Optionally show leaderboard
  await showLeaderboard('cavegrok');
}

async function showLeaderboard(gameId) {
  try {
    const response = await fetch(
      `/api/leaderboard?gameId=${gameId}&limit=10`,
      { credentials: 'include' }
    );
    const data = await response.json();
    
    // Display leaderboard in your game UI
    console.log('Top 10 scores:', data.scores);
    // ... render in your game
  } catch (error) {
    console.error('Failed to load leaderboard:', error);
  }
}
```

---

## ⚠️ Important Notes

### Performance Considerations

**Current Setup:**
- ✅ Good for development and testing
- ✅ Works fine for small-medium user base (< 1000 players)
- ⚠️ Uses **cross-partition queries** for leaderboard (can be expensive at scale)

**Future Optimization (when you have lots of players):**
1. Create a separate `Scores` container with partition key `/gameId`
2. Add composite index: `(gameId ASC, score DESC)`
3. This makes leaderboard queries much faster and cheaper

To add when needed:
```json
{
  "indexingPolicy": {
    "compositeIndexes": [
      [
        { "path": "/gameId", "order": "ascending" },
        { "path": "/score", "order": "descending" }
      ]
    ]
  }
}
```

### Security

- ✅ All API routes require authentication
- ✅ Users can only submit scores for themselves
- ✅ Partition keys prevent cross-user data access
- ✅ Cosmos DB connection strings stored as secrets
- ⚠️ Currently no rate limiting (add Azure Front Door if needed)
- ⚠️ No score validation (add anti-cheat logic in your games)

### Cost Optimization

**Cosmos DB costs:**
- Minimum: ~$24/month (400 RU/s)
- Consider: Serverless tier for development ($0.25 per million operations)

To switch to Serverless:
1. Create new Cosmos DB account with Serverless
2. Update `COSMOS_ENDPOINT` and `COSMOS_KEY`
3. Much cheaper for low-traffic scenarios

---

## 🐛 Troubleshooting

### "401 Unauthenticated" errors
- **Cause:** Not signed in or session expired
- **Fix:** Sign in again via browser

### "Failed to upsert user" or "Failed to store event"
- **Cause:** Cosmos DB settings incorrect or container doesn't exist
- **Fix:** Verify Application Settings in Azure Portal
- **Fix:** Check container exists with correct partition key

### Leaderboard returns empty array
- **Cause:** No scores submitted yet for that gameId
- **Fix:** Submit test scores using the demo UI

### Deployment fails
- **Cause:** GitHub Actions can't find secrets
- **Fix:** Verify `AZURE_STATIC_WEB_APPS_API_TOKEN_JOLLY_POND_0F1AE1210` exists in GitHub Secrets
- **Location:** GitHub repo → Settings → Secrets and variables → Actions

### Functions not found (404)
- **Cause:** Functions didn't deploy
- **Fix:** Check GitHub Actions logs
- **Fix:** Ensure `api` folder structure is correct
- **Fix:** Run `npm install` locally in `/api` folder to verify dependencies

---

## 📞 Need Help?

### Check Logs
1. **Azure Portal** → Your Static Web App → **Application Insights** (if enabled)
2. **GitHub** → Your Repo → **Actions** tab → Click latest workflow

### Useful Azure CLI Commands
```bash
# View your SWA details
az staticwebapp show --name YOUR-SWA-NAME --resource-group YOUR-RG

# List environment variables
az staticwebapp appsettings list --name YOUR-SWA-NAME

# View logs (requires Application Insights)
az monitor app-insights query \
  --app YOUR-APP-INSIGHTS-NAME \
  --analytics-query "traces | order by timestamp desc | take 50"
```

---

## ✅ Success Checklist

- [ ] Cosmos DB container `playerdata` exists with partition key `/playerId`
- [ ] Application Settings configured in Azure Portal (4 Cosmos settings)
- [ ] Google OAuth settings configured (if using auth)
- [ ] Code pushed to GitHub
- [ ] GitHub Actions workflow completed successfully (green checkmark)
- [ ] Can sign in with Google on your site
- [ ] Can submit test score via web UI
- [ ] Can view leaderboard
- [ ] Can view "My Scores"

---

## 🎯 Next Steps

1. **Test thoroughly** using the web UI
2. **Integrate scoring** into Cave Grok and Chromatic Runner
3. **Add leaderboard UI** directly in your games
4. **Monitor Cosmos DB costs** in Azure Portal
5. **Consider adding:** Rate limiting, score validation, achievements system

---

## 📚 Additional Resources

- [Azure Static Web Apps Docs](https://learn.microsoft.com/en-us/azure/static-web-apps/)
- [Azure Cosmos DB Docs](https://learn.microsoft.com/en-us/azure/cosmos-db/)
- [GitHub Actions Docs](https://docs.github.com/en/actions)

---

**Questions?** Check the troubleshooting section or review Azure Portal logs.

