const { getPrincipal, extractUser } = require("../_shared/auth");
const { getContainer } = require("../_shared/cosmos");
const { durableIdFromPrincipal } = require("../_shared/id");

const memoryStore = new Map();

function normalizeDisplayName(value) {
  if (value === null || value === undefined) {
    return "Player";
  }

  let name = String(value).trim();
  if (!name) {
    return "Player";
  }

  const atIndex = name.indexOf("@");
  if (atIndex > 0) {
    name = name.slice(0, atIndex);
  }

  name = name.split(/\s+/)[0];
  name = name.replace(/[^A-Za-z0-9_-]/g, "");

  if (!name) {
    return "Player";
  }

  return name.charAt(0).toUpperCase() + name.slice(1);
}

function sanitizeGameId(value) {
  if (!value) {
    return null;
  }
  const trimmed = value.toString().trim().toLowerCase();
  if (!/^[a-z0-9-_.]{1,64}$/.test(trimmed)) {
    return null;
  }
  return trimmed;
}

function parseBody(body) {
  if (body === undefined || body === null) {
    return {};
  }

  if (typeof body === "object") {
    return body;
  }

  try {
    return JSON.parse(body);
  } catch (_error) {
    return {};
  }
}

function getMemoryGame(gameId) {
  if (!memoryStore.has(gameId)) {
    memoryStore.set(gameId, new Map());
  }
  return memoryStore.get(gameId);
}

async function readScore(container, gameId, docId) {
  try {
    const { resource } = await container.item(docId, gameId).read();
    return resource || null;
  } catch (error) {
    if (error.code === 404) {
      return null;
    }
    throw error;
  }
}

async function queryScores(container, gameId, limit) {
  const querySpec = {
    query: "SELECT TOP @limit c.userId, c.displayName, c.bestScore, c.updatedAt FROM c WHERE c.docType = @docType AND c.slug = @slug ORDER BY c.bestScore DESC",
    parameters: [
      { name: "@limit", value: limit },
      { name: "@docType", value: "score" },
      { name: "@slug", value: gameId }
    ]
  };

  const { resources } = await container.items
    .query(querySpec, {
      partitionKey: gameId
    })
    .fetchAll();

  return resources || [];
}

module.exports = async function (context, req) {
  const principal = getPrincipal(req);

  if (!principal) {
    context.res = {
      status: 401,
      body: { error: "Authentication required." }
    };
    return;
  }

  const user = extractUser(principal);
  const durableUserId = durableIdFromPrincipal(user);
  const query = req.query || {};
  const personalOnly =
    req.method === "GET" &&
    ["true", "1"].includes(String(query.personal || query.userOnly || query.personalOnly || "").toLowerCase());

  const gameId = sanitizeGameId(req.query?.gameId || parseBody(req.body).gameId);

  if (!personalOnly && !gameId) {
    context.res = {
      status: 400,
      body: { error: "gameId is required." }
    };
    return;
  }

  const container = getContainer();

  if (req.method === "GET") {
    if (personalOnly) {
      try {
        let personal = [];

        if (container) {
          const personalQuery = {
            query:
              "SELECT c.slug, c.bestScore, c.updatedAt, c.displayName, c.userId FROM c WHERE c.docType = @docType AND c.userId = @userId ORDER BY c.updatedAt DESC",
            parameters: [
              { name: "@docType", value: "score" },
              { name: "@userId", value: durableUserId }
            ]
          };

          const { resources } = await container.items
            .query(personalQuery, { enableCrossPartitionQuery: true })
            .fetchAll();

        personal = (resources || []).map((item) => ({
          slug: item.slug,
          bestScore: item.bestScore,
          updatedAt: item.updatedAt,
          displayName: normalizeDisplayName(item.displayName || item.firstName || item.userId),
          userId: item.userId
        }));
        } else {
          const allEntries = [];
          for (const [slug, map] of memoryStore.entries()) {
            const record = map.get(durableUserId);
            if (record) {
              allEntries.push({
                slug,
                bestScore: record.bestScore,
                updatedAt: record.updatedAt,
                displayName: normalizeDisplayName(record.displayName || record.firstName || durableUserId),
                userId: durableUserId
              });
            }
          }
          allEntries.sort((a, b) => {
            const scoreDiff = (b.bestScore || 0) - (a.bestScore || 0);
            if (scoreDiff !== 0) {
              return scoreDiff;
            }
            return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
          });
          personal = allEntries;
        }

        context.res = {
          status: 200,
          body: { personal }
        };
      } catch (error) {
        context.log.error("personal score query failed", error);
        context.res = {
          status: 500,
          body: { error: "Failed to load personal scores." }
        };
      }
      return;
    }

    const rawLimit = req.query?.limit;
    let limit = 10;
    if (rawLimit !== undefined) {
      const parsed = parseInt(rawLimit, 10);
      if (Number.isNaN(parsed) || parsed <= 0) {
        context.res = {
          status: 400,
          body: { error: "limit must be a positive integer." }
        };
        return;
      }
      limit = Math.min(parsed, 100);
    }

    let entries = [];
    let myEntry = null;

    if (container) {
      try {
        const results = await queryScores(container, gameId, limit);
        entries = results.map((item) => ({
          userId: item.userId,
          displayName: normalizeDisplayName(item.displayName || item.firstName || item.userId),
          bestScore: item.bestScore,
          updatedAt: item.updatedAt
        }));
        myEntry = entries.find((entry) => entry.userId === durableUserId);
      } catch (error) {
        context.log.error("score query failed", error);
        context.res = {
          status: 500,
          body: { error: "Failed to load scores." }
        };
        return;
      }
    } else {
      const gameMap = getMemoryGame(gameId);
      entries = Array.from(gameMap.values())
        .map((record) => ({
          userId: record.userId,
          displayName: normalizeDisplayName(record.displayName || record.userId),
          bestScore: record.bestScore,
          updatedAt: record.updatedAt
        }))
        .sort((a, b) => b.bestScore - a.bestScore)
        .slice(0, limit);
      myEntry = entries.find((entry) => entry.userId === durableUserId) || null;
    }

    context.res = {
      status: 200,
      body: {
        entries,
        myScore: myEntry
      }
    };
    return;
  }

  if (req.method === "POST") {
    const body = parseBody(req.body);
    const rawScore = Number(body.score);

    if (!Number.isFinite(rawScore)) {
      context.res = {
        status: 400,
        body: { error: "score must be a number." }
      };
      return;
    }

    const score = Math.max(0, Math.round(rawScore));
    const userId = durableUserId;
    const now = new Date().toISOString();

    let bestScore = score;
    let updated = false;
    const friendlyName = normalizeDisplayName(
      (user && (user.firstName || user.displayName || user.email)) || userId
    );

    if (container) {
      const docId = `${gameId}:${userId}`;
      try {
        const existing = await readScore(container, gameId, docId);
        const currentBest = existing?.bestScore || 0;

        if (score > currentBest) {
          const doc = {
            id: docId,
            docType: "score",
            slug: gameId,
            gameId,
            userId,
            displayName: friendlyName,
            bestScore: score,
            updatedAt: now
          };
          await container.items.upsert(doc);
          bestScore = score;
          updated = true;
        } else {
          bestScore = currentBest;
        }
      } catch (error) {
        context.log.error("score upsert failed", error);
        context.res = {
          status: 500,
          body: { error: "Failed to record score." }
        };
        return;
      }
    } else {
      const gameMap = getMemoryGame(gameId);
      const current = gameMap.get(userId);
      const currentBest = current?.bestScore || 0;
      if (score > currentBest) {
        gameMap.set(userId, {
          userId,
          displayName: friendlyName,
          bestScore: score,
          updatedAt: now
        });
        bestScore = score;
        updated = true;
      } else {
        bestScore = currentBest;
      }
    }

    context.res = {
      status: 200,
      body: {
        ok: true,
        bestScore,
        updated
      }
    };
    return;
  }

  context.res = {
    status: 405,
    body: { error: "Method not allowed." }
  };
};

