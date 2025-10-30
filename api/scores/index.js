const { getPrincipal, extractUser } = require("../_shared/auth");
const { getContainer } = require("../_shared/cosmos");
const { durableIdFromPrincipal } = require("../_shared/id");

const memoryStore = new Map();

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
  const gameId = sanitizeGameId(req.query?.gameId || parseBody(req.body).gameId);

  if (!gameId) {
    context.res = {
      status: 400,
      body: { error: "gameId is required." }
    };
    return;
  }

  const container = getContainer();

  if (req.method === "GET") {
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
          displayName: item.displayName,
          bestScore: item.bestScore,
          updatedAt: item.updatedAt
        }));
        myEntry = entries.find((entry) => entry.userId === user.id);
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
        .sort((a, b) => b.bestScore - a.bestScore)
        .slice(0, limit);
      myEntry = gameMap.get(user.id) || null;
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
            displayName: user.displayName || user.id,
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
          displayName: user.displayName || user.id,
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

