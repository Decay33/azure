const { getUser } = require("../_shared/auth");
const { getContainer } = require("../_shared/cosmos");
const { createDocumentId } = require("../_shared/id");

function parseBody(req) {
  if (req.body === undefined || req.body === null) {
    return {};
  }

  if (typeof req.body === "object") {
    return req.body;
  }

  try {
    return JSON.parse(req.body);
  } catch (_err) {
    return null;
  }
}

module.exports = async function (context, req) {
  try {
    const user = getUser(req);

    if (!user) {
      context.res = {
        status: 401,
        body: { error: "Authentication required." }
      };
      return;
    }

    const body = parseBody(req);
    if (!body || typeof body !== "object") {
      context.res = {
        status: 400,
        body: { error: "Invalid JSON body." }
      };
      return;
    }

    const type =
      typeof body.type === "string" && body.type.trim() ? body.type.trim() : "event";

    const payload = body.payload === undefined ? null : body.payload;

    let timestamp = body.ts;
    if (timestamp) {
      const parsedTimestamp = new Date(timestamp);
      if (Number.isNaN(parsedTimestamp.getTime())) {
        context.res = {
          status: 400,
          body: { error: "Invalid ts value. Use a valid date or timestamp." }
        };
        return;
      }
      timestamp = parsedTimestamp.toISOString();
    } else {
      timestamp = new Date().toISOString();
    }

    const container = getContainer();
    const document = {
      id: createDocumentId(user.userId),
      playerId: user.playerId,
      type,
      payload,
      ts: timestamp,
      meta: {
        email: user.email,
        provider: user.provider
      }
    };

    await container.items.create(document);

    context.res = {
      status: 202,
      body: { ok: true, id: document.id }
    };
  } catch (error) {
    context.log.error("track failure", error);
    context.res = {
      status: 500,
      body: { error: "Failed to record event." }
    };
  }
};
