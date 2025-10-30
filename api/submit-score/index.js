const { getUser } = require("../_shared/auth");
const { getContainer } = require("../_shared/cosmos");
const { createDocumentId } = require("../_shared/id");

function parseBody(req) {
  if (req.body === undefined || req.body === null) {
    return null;
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

    if (typeof body.gameId !== "string" || !body.gameId.trim()) {
      context.res = {
        status: 400,
        body: { error: "gameId is required (non-empty string)." }
      };
      return;
    }

    const rawScore = Number(body.score);
    if (!Number.isFinite(rawScore)) {
      context.res = {
        status: 400,
        body: { error: "score must be a finite number." }
      };
      return;
    }

    const score = Math.round(rawScore);
    const container = getContainer();
    const document = {
      id: createDocumentId(user.userId),
      playerId: user.playerId,
      type: "score",
      gameId: body.gameId.trim(),
      score,
      ts: new Date().toISOString(),
      displayName: user.displayName,
      email: user.email
    };

    await container.items.create(document);

    context.res = {
      status: 201,
      body: { ok: true, id: document.id }
    };
  } catch (error) {
    context.log.error("submit-score failure", error);
    context.res = {
      status: 500,
      body: { error: "Failed to submit score." }
    };
  }
};
