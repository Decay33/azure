const { getPrincipal, extractUser } = require("../_shared/auth");
const { getContainer } = require("../_shared/cosmos");
const { durableIdFromPrincipal } = require("../_shared/id");

const SLUG = "cavegrok-state";
const DOC_TYPE = "cavegrokState";

function defaultState() {
  return {
    unlocks: {
      hotPink: false,
      purple: false,
      golden: false
    },
    purchases: {},
    inventory: {
      coins: 0
    },
    progress: {
      lastLevel: 1
    },
    stats: {
      lastScore: 0
    },
    version: 1
  };
}

function sanitizeUnlocks(raw) {
  const base = defaultState().unlocks;
  if (!raw || typeof raw !== "object") {
    return base;
  }

  return {
    hotPink: Boolean(raw.hotPink),
    purple: Boolean(raw.purple),
    golden: Boolean(raw.golden)
  };
}

function sanitizeInventory(raw) {
  const base = defaultState().inventory;
  if (!raw || typeof raw !== "object") {
    return base;
  }

  const coins = Number(raw.coins);
  return {
    coins: Number.isFinite(coins) && coins >= 0 ? Math.floor(coins) : base.coins
  };
}

function sanitizeProgress(raw) {
  const base = defaultState().progress;
  if (!raw || typeof raw !== "object") {
    return base;
  }

  const lastLevel = Number(raw.lastLevel);
  return {
    lastLevel:
      Number.isFinite(lastLevel) && lastLevel > 0 && lastLevel < 1000
        ? Math.floor(lastLevel)
        : base.lastLevel
  };
}

function sanitizeStats(raw) {
  const base = defaultState().stats;
  if (!raw || typeof raw !== "object") {
    return base;
  }

  const lastScore = Number(raw.lastScore);
  return {
    lastScore:
      Number.isFinite(lastScore) && lastScore >= 0 && lastScore < 1_000_000_000
        ? Math.floor(lastScore)
        : base.lastScore
  };
}

function sanitizePurchases(raw) {
  if (!raw || typeof raw !== "object") {
    return {};
  }

  const safe = {};
  const allowKey = /^[a-z0-9_-]{1,64}$/i;

  for (const [key, value] of Object.entries(raw)) {
    if (!allowKey.test(key)) {
      continue;
    }

    const entry = {};
    const purchased = value && typeof value === "object" ? value : {};

    entry.owned = Boolean(purchased.owned ?? true);

    if (typeof purchased.provider === "string") {
      entry.provider = purchased.provider.slice(0, 64);
    }
    if (typeof purchased.transactionId === "string") {
      entry.transactionId = purchased.transactionId.slice(0, 128);
    }
    if (typeof purchased.currency === "string") {
      entry.currency = purchased.currency.slice(0, 16).toUpperCase();
    }

    const amount = Number(purchased.amount);
    if (Number.isFinite(amount) && amount >= 0) {
      entry.amount = Number(amount.toFixed(2));
    }

    if (purchased.purchasedAt) {
      const stamp = new Date(purchased.purchasedAt);
      if (!Number.isNaN(stamp.valueOf())) {
        entry.purchasedAt = stamp.toISOString();
      }
    }

    if (!entry.purchasedAt) {
      entry.purchasedAt = new Date().toISOString();
    }

    safe[key] = entry;
  }

  return safe;
}

function buildState(payload = {}) {
  const base = defaultState();
  return {
    unlocks: sanitizeUnlocks(payload.unlocks),
    purchases: sanitizePurchases(payload.purchases),
    inventory: sanitizeInventory(payload.inventory),
    progress: sanitizeProgress(payload.progress),
    stats: sanitizeStats(payload.stats),
    version: payload.version || base.version
  };
}

function mergeState(existing = defaultState(), updates = {}) {
  const sanitized = buildState(updates);

  return {
    unlocks: {
      ...existing.unlocks,
      ...sanitized.unlocks
    },
    purchases: {
      ...existing.purchases,
      ...sanitized.purchases
    },
    inventory: {
      ...existing.inventory,
      ...sanitized.inventory
    },
    progress: {
      ...existing.progress,
      ...sanitized.progress
    },
    stats: {
      ...existing.stats,
      ...sanitized.stats
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
  const documentId = `cavegrok:${userId}`;
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
      context.log.error("failed to load cavegrok state", error);
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
      context.log.error("failed to persist cavegrok state", error);
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
