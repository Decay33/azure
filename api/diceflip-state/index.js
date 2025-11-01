const { getPrincipal, extractUser } = require("../_shared/auth");
const { getContainer } = require("../_shared/cosmos");
const { durableIdFromPrincipal } = require("../_shared/id");

const SLUG = "diceflip-state";
const DOC_TYPE = "diceflipState";

function defaultState() {
  return {
    stats: {
      highestScore: 0,
      lastScore: 0,
      bestLevel: 1,
      totalGames: 0,
      bestMatches3: 0,
      bestMatches4: 0,
      bestMatches5: 0,
      bestMatches6Plus: 0,
      bestNumbersMatched: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0
      }
    },
    unlocks: {
      skins: {
        classic: true,
        pastel: false,
        neon: false,
        galaxy: false
      },
      selectedSkin: "classic"
    },
    achievements: {
      unlocked: [],
      milestones: {}
    },
    version: 1
  };
}

function sanitizeNumber(value, fallback = 0, { min = 0, max = Number.MAX_SAFE_INTEGER, round = true } = {}) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }
  let clamped = numeric;
  if (numeric < min) {
    clamped = min;
  } else if (numeric > max) {
    clamped = max;
  }
  return round ? Math.floor(clamped) : clamped;
}

function sanitizeNumbersMatched(raw) {
  const base = defaultState().stats.bestNumbersMatched;
  if (!raw || typeof raw !== "object") {
    return base;
  }
  const cleaned = {};
  for (const key of ["1", "2", "3", "4", "5", "6"]) {
    const numericKey = Number(key);
    cleaned[numericKey] = sanitizeNumber(raw[key] ?? raw[numericKey], 0, { min: 0, max: 1_000_000 });
  }
  return cleaned;
}

function sanitizeStats(raw) {
  const base = defaultState().stats;
  if (!raw || typeof raw !== "object") {
    return base;
  }

  return {
    highestScore: sanitizeNumber(raw.highestScore, base.highestScore, { min: 0, max: 1_000_000_000 }),
    lastScore: sanitizeNumber(raw.lastScore, base.lastScore, { min: 0, max: 1_000_000_000 }),
    bestLevel: sanitizeNumber(raw.bestLevel, base.bestLevel, { min: 1, max: 500 }),
    totalGames: sanitizeNumber(raw.totalGames, base.totalGames, { min: 0, max: 1_000_000 }),
    bestMatches3: sanitizeNumber(raw.bestMatches3, base.bestMatches3, { min: 0, max: 1_000_000 }),
    bestMatches4: sanitizeNumber(raw.bestMatches4, base.bestMatches4, { min: 0, max: 1_000_000 }),
    bestMatches5: sanitizeNumber(raw.bestMatches5, base.bestMatches5, { min: 0, max: 1_000_000 }),
    bestMatches6Plus: sanitizeNumber(raw.bestMatches6Plus, base.bestMatches6Plus, { min: 0, max: 1_000_000 }),
    bestNumbersMatched: sanitizeNumbersMatched(raw.bestNumbersMatched)
  };
}

function sanitizeUnlocks(raw) {
  const base = defaultState().unlocks;
  if (!raw || typeof raw !== "object") {
    return base;
  }

  const skins = raw.skins && typeof raw.skins === "object" ? raw.skins : {};
  return {
    skins: {
      classic: true,
      pastel: Boolean(skins.pastel),
      neon: Boolean(skins.neon),
      galaxy: Boolean(skins.galaxy)
    },
    selectedSkin: typeof raw.selectedSkin === "string" ? raw.selectedSkin : base.selectedSkin
  };
}

function sanitizeAchievements(raw) {
  const base = defaultState().achievements;
  if (!raw || typeof raw !== "object") {
    return base;
  }

  let unlocked = [];
  if (Array.isArray(raw.unlocked)) {
    unlocked = raw.unlocked
      .filter((entry) => typeof entry === "string" && entry.length > 0)
      .slice(0, 100);
  }

  const milestones = {};
  if (raw.milestones && typeof raw.milestones === "object") {
    for (const [key, value] of Object.entries(raw.milestones)) {
      if (typeof key !== "string" || key.length > 64) {
        continue;
      }
      milestones[key] = sanitizeNumber(value, 0, { min: 0, max: 1_000_000 });
    }
  }

  return {
    unlocked,
    milestones
  };
}

function buildState(payload = {}) {
  const base = defaultState();
  return {
    stats: sanitizeStats(payload.stats),
    unlocks: sanitizeUnlocks(payload.unlocks),
    achievements: sanitizeAchievements(payload.achievements),
    version: payload.version || base.version
  };
}

function mergeState(existing = defaultState(), updates = {}) {
  const sanitized = buildState(updates);
  return {
    stats: {
      ...existing.stats,
      ...sanitized.stats,
      bestNumbersMatched: {
        ...existing.stats.bestNumbersMatched,
        ...sanitized.stats.bestNumbersMatched
      }
    },
    unlocks: {
      skins: {
        ...existing.unlocks.skins,
        ...sanitized.unlocks.skins
      },
      selectedSkin: sanitized.unlocks.selectedSkin || existing.unlocks.selectedSkin || "classic"
    },
    achievements: {
      unlocked: Array.from(new Set([...(existing.achievements.unlocked || []), ...(sanitized.achievements.unlocked || [])])).slice(0, 200),
      milestones: {
        ...(existing.achievements.milestones || {}),
        ...(sanitized.achievements.milestones || {})
      }
    },
    version: sanitized.version || existing.version || 1
  };
}

async function readState(container, docId) {
  try {
    const { resource } = await container.item(docId, SLUG).read();
    return resource || null;
  } catch (error) {
    if (error.code === 404) {
      return null;
    }
    throw error;
  }
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

  const container = getContainer();
  if (!container) {
    context.res = {
      status: 500,
      body: { error: "Cosmos DB is not configured." }
    };
    return;
  }

  const user = extractUser(principal);
  const userId = durableIdFromPrincipal(user);
  const documentId = `diceflip:${userId}`;
  const now = new Date().toISOString();

  if (req.method === "GET") {
    try {
      const existing = await readState(container, documentId);
      const state = existing?.state ? mergeState(defaultState(), existing.state) : defaultState();

      context.res = {
        status: 200,
        body: {
          state,
          updatedAt: existing?.updatedAt || null
        }
      };
    } catch (error) {
      context.log.error("failed to load diceflip state", error);
      context.res = {
        status: 500,
        body: { error: "Failed to load state." }
      };
    }
    return;
  }

  if (req.method === "POST") {
    let payload = {};
    if (req.body) {
      if (typeof req.body === "object") {
        payload = req.body;
      } else {
        try {
          payload = JSON.parse(req.body);
        } catch (_error) {
          payload = {};
        }
      }
    }

    try {
      const existing = await readState(container, documentId);
      const currentState = existing?.state ? mergeState(defaultState(), existing.state) : defaultState();
      const merged = mergeState(currentState, payload);

      const document = {
        id: documentId,
        slug: SLUG,
        docType: DOC_TYPE,
        userId,
        firstName: user.firstName || null,
        displayName: user.displayName || userId,
        state: merged,
        updatedAt: now
      };

      await container.items.upsert(document, { disableAutomaticIdGeneration: true });

      context.res = {
        status: 200,
        body: {
          ok: true,
          state: merged,
          updatedAt: now
        }
      };
    } catch (error) {
      context.log.error("failed to persist diceflip state", error);
      context.res = {
        status: 500,
        body: { error: "Failed to save state." }
      };
    }
    return;
  }

  context.res = {
    status: 405,
    body: { error: "Method not allowed." }
  };
};
