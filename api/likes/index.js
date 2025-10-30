const { getPrincipal, extractUser } = require("../_shared/auth");
const { getContainer } = require("../_shared/cosmos");
const { durableIdFromPrincipal } = require("../_shared/id");

const memoryStore = new Map();

function sanitizeSlug(value) {
  if (!value) {
    return null;
  }
  const trimmed = value.toString().trim().toLowerCase();
  if (!/^[a-z0-9-_]{1,64}$/.test(trimmed)) {
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

async function getLikesFromCosmos(container, slug) {
  try {
    const { resource } = await container.item(slug, slug).read();
    return Number.isFinite(resource?.likes) ? resource.likes : 0;
  } catch (error) {
    if (error.code === 404) {
      return 0;
    }
    throw error;
  }
}

async function incrementLikesInCosmos(container, slug, userId) {
  const now = new Date().toISOString();
  try {
    const { resource } = await container.item(slug, slug).read();
    const current = Number.isFinite(resource?.likes) ? resource.likes : 0;
    const updated = {
      ...resource,
      id: slug,
      slug,
      likes: current + 1,
      updatedAt: now,
      lastUpdatedBy: userId
    };
    await container.items.upsert(updated);
    return updated.likes;
  } catch (error) {
    if (error.code === 404) {
      const doc = {
        id: slug,
        slug,
        likes: 1,
        updatedAt: now,
        lastUpdatedBy: userId
      };
      await container.items.create(doc);
      return 1;
    }
    throw error;
  }
}

function getLikesFromMemory(slug) {
  return memoryStore.get(slug) || 0;
}

function incrementLikesInMemory(slug) {
  const current = memoryStore.get(slug) || 0;
  const updated = current + 1;
  memoryStore.set(slug, updated);
  return updated;
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
  const body = req.method === "POST" ? parseBody(req.body) : {};
  const slug = sanitizeSlug(req.query?.slug || req.query?.gameId || body.slug);

  if (!slug) {
    context.res = {
      status: 400,
      body: { error: "A valid slug is required." }
    };
    return;
  }

  const container = getContainer();

  try {
    if (req.method === "GET") {
      const likes = container ? await getLikesFromCosmos(container, slug) : getLikesFromMemory(slug);
      context.res = {
        status: 200,
        body: { slug, likes }
      };
      return;
    }

    if (req.method === "POST") {
      const likes = container
        ? await incrementLikesInCosmos(container, slug, durableIdFromPrincipal(user))
        : incrementLikesInMemory(slug);

      if (!container) {
        context.log.warn("Cosmos configuration missing, using in-memory like counter.");
      }

      context.res = {
        status: 200,
        body: { slug, likes }
      };
      return;
    }

    context.res = {
      status: 405,
      body: { error: "Method not allowed." }
    };
  } catch (error) {
    context.log.error("likes handler failed", error);
    context.res = {
      status: 500,
      body: { error: "Unable to process request." }
    };
  }
};
