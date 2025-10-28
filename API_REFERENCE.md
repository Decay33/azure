# GameHub API Reference

Quick reference for all API endpoints.

## Base URL
```
https://your-site.azurestaticapps.net/api
```

---

## 🔐 Authentication

All endpoints require authentication. If not authenticated, returns:
```json
{
  "error": "Unauthenticated"
}
```
**Status:** 401

---

## Endpoints

### 1. Initialize User Profile

Creates or updates user profile on first authenticated visit.

**Endpoint:** `POST /api/user-init`

**Request Body:** `{}` (empty or omit)

**Response:**
```json
{
  "ok": true,
  "user": {
    "id": "google|123456789",
    "displayName": "John Doe"
  }
}
```

**Status Codes:**
- `200` - Success
- `401` - Not authenticated
- `500` - Database error

---

### 2. Track Event

Track user events (page views, clicks, custom events).

**Endpoint:** `POST /api/track`

**Request Body:**
```json
{
  "type": "page_view",
  "payload": {
    "path": "/games/cavegrok"
  },
  "ts": 1700000000000  // Optional, defaults to Date.now()
}
```

**Response:**
```json
{
  "ok": true,
  "id": "google|123456789-1700000000000-abc123"
}
```

**Status Codes:**
- `200` - Success
- `401` - Not authenticated
- `500` - Database error

---

### 3. Submit Score

Submit a game score for the authenticated user.

**Endpoint:** `POST /api/submit-score`

**Request Body:**
```json
{
  "gameId": "cavegrok",
  "score": 1500
}
```

**Validation:**
- `gameId`: Required string
- `score`: Required number (will be coerced to integer)

**Response:**
```json
{
  "ok": true,
  "id": "google|123456789-1700000000000-xyz789",
  "score": 1500
}
```

**Status Codes:**
- `200` - Success
- `400` - Missing or invalid gameId/score
- `401` - Not authenticated
- `500` - Database error

---

### 4. Get Leaderboard

Get top scores for a specific game.

**Endpoint:** `GET /api/leaderboard`

**Query Parameters:**
- `gameId` (required) - Game identifier
- `limit` (optional) - Number of results (1-100, default: 10)

**Example:**
```
GET /api/leaderboard?gameId=cavegrok&limit=10
```

**Response:**
```json
{
  "gameId": "cavegrok",
  "limit": 10,
  "count": 10,
  "scores": [
    {
      "playerId": "google|123456789",
      "displayName": "John Doe",
      "email": "john@example.com",
      "score": 2500,
      "ts": 1700000000000,
      "id": "google|123456789-1700000000000-xyz789"
    },
    {
      "playerId": "google|987654321",
      "displayName": "Jane Smith",
      "email": "jane@example.com",
      "score": 2000,
      "ts": 1700000001000,
      "id": "google|987654321-1700000001000-abc456"
    }
  ]
}
```

**Notes:**
- Results ordered by score DESC (highest first)
- Uses cross-partition query
- Returns top N unique scores (may include duplicate players)

**Status Codes:**
- `200` - Success
- `400` - Missing gameId parameter
- `401` - Not authenticated
- `500` - Database error

---

### 5. Get My Scores

Get all scores for the authenticated user.

**Endpoint:** `GET /api/my-scores`

**Query Parameters:**
- `gameId` (optional) - Filter by specific game, omit for all games

**Examples:**
```
GET /api/my-scores                    # All games
GET /api/my-scores?gameId=cavegrok    # Specific game
```

**Response:**
```json
{
  "userId": "google|123456789",
  "gameId": "cavegrok",
  "count": 3,
  "scores": [
    {
      "gameId": "cavegrok",
      "score": 1500,
      "ts": 1700000002000,
      "id": "google|123456789-1700000002000-def789"
    },
    {
      "gameId": "cavegrok",
      "score": 1200,
      "ts": 1700000001000,
      "id": "google|123456789-1700000001000-ghi012"
    },
    {
      "gameId": "cavegrok",
      "score": 900,
      "ts": 1700000000000,
      "id": "google|123456789-1700000000000-jkl345"
    }
  ]
}
```

**Notes:**
- Results ordered by timestamp DESC (newest first)
- Efficient query (uses partition key)

**Status Codes:**
- `200` - Success
- `401` - Not authenticated
- `500` - Database error

---

### 6. Get Current User

Get current authenticated user information.

**Endpoint:** `GET /api/GetMe`

**Response:**
```json
{
  "user": {
    "userId": "google|123456789",
    "userDetails": "john@example.com",
    "identityProvider": "google",
    "userRoles": ["authenticated"],
    "claims": [
      {
        "typ": "name",
        "val": "John Doe"
      },
      {
        "typ": "email",
        "val": "john@example.com"
      }
    ]
  }
}
```

Or if not authenticated:
```json
{
  "user": null
}
```

**Status Codes:**
- `200` - Always returns 200 (check user field)

---

## Error Responses

All endpoints may return these error formats:

### 400 Bad Request
```json
{
  "error": "Missing or invalid gameId"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthenticated"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to submit score"
}
```

---

## JavaScript Examples

### Submit Score
```javascript
async function submitScore(gameId, score) {
  const response = await fetch('/api/submit-score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ gameId, score })
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  
  return await response.json();
}

// Usage
try {
  const result = await submitScore('cavegrok', 1500);
  console.log('Submitted:', result);
} catch (error) {
  console.error('Failed:', error);
}
```

### Get Leaderboard
```javascript
async function getLeaderboard(gameId, limit = 10) {
  const url = `/api/leaderboard?gameId=${encodeURIComponent(gameId)}&limit=${limit}`;
  const response = await fetch(url, { credentials: 'include' });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  
  return await response.json();
}

// Usage
const leaderboard = await getLeaderboard('cavegrok', 10);
console.log('Top 10:', leaderboard.scores);
```

### Get My Scores
```javascript
async function getMyScores(gameId = null) {
  let url = '/api/my-scores';
  if (gameId) {
    url += `?gameId=${encodeURIComponent(gameId)}`;
  }
  
  const response = await fetch(url, { credentials: 'include' });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  
  return await response.json();
}

// Usage
const myScores = await getMyScores('cavegrok');
console.log('My scores:', myScores.scores);
```

### Track Event
```javascript
async function trackEvent(type, payload) {
  const response = await fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ type, payload })
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  
  return await response.json();
}

// Usage
await trackEvent('level_complete', { level: 5, time: 120 });
await trackEvent('powerup_collected', { powerup: 'shield' });
```

---

## Rate Limits

Currently **no rate limiting** is enforced. Consider adding:
- Client-side debouncing for track events
- Server-side rate limiting via Azure Front Door
- Anti-cheat validation for scores

---

## Data Retention

All data is stored indefinitely in Cosmos DB. To implement retention:

1. Add TTL (Time To Live) to Cosmos DB container
2. Or implement periodic cleanup Azure Function
3. Or filter by timestamp in queries

---

## Performance Tips

1. **Leaderboard queries** are cross-partition (expensive)
   - Cache results client-side
   - Consider 5-minute refresh intervals
   
2. **My Scores queries** use partition key (fast)
   - Safe to call frequently

3. **Submit Score** is single-partition write (fast)
   - No performance concerns

4. **Track Events** can be batched
   - Consider batching multiple events in one call

---

## Future Enhancements

Possible additions:
- **Achievements system** (new document type: "achievement")
- **Daily/weekly/monthly leaderboards** (filter by timestamp)
- **Player profiles** (stats, badges, level)
- **Score verification** (replay data, checksums)
- **Social features** (friends, challenges)

---

## Testing with curl

```bash
# Set your cookie
export COOKIE="StaticWebAppsAuthCookie=YOUR_COOKIE_HERE"

# Submit score
curl -X POST https://your-site.azurestaticapps.net/api/submit-score \
  -H "Content-Type: application/json" \
  -H "Cookie: $COOKIE" \
  -d '{"gameId":"cavegrok","score":1500}'

# Get leaderboard
curl "https://your-site.azurestaticapps.net/api/leaderboard?gameId=cavegrok&limit=10" \
  -H "Cookie: $COOKIE"

# Get my scores
curl "https://your-site.azurestaticapps.net/api/my-scores?gameId=cavegrok" \
  -H "Cookie: $COOKIE"

# Track event
curl -X POST https://your-site.azurestaticapps.net/api/track \
  -H "Content-Type: application/json" \
  -H "Cookie: $COOKIE" \
  -d '{"type":"game_started","payload":{"gameId":"cavegrok"}}'
```

---

**Last Updated:** October 28, 2025

