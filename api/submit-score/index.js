const { CosmosClient } = require("@azure/cosmos");

function getClientPrincipal(req) {
  const header = req.headers["x-ms-client-principal"];
  if (!header) return null;
  try {
    const decoded = Buffer.from(header, "base64").toString("utf8");
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

const client = new CosmosClient({
  endpoint: process.env.COSMOS_ENDPOINT,
  key: process.env.COSMOS_KEY
});

const dbName = process.env.COSMOS_DB || "gamehub";
const containerName = process.env.COSMOS_PLAYERDATA_CONTAINER || "playerdata";

module.exports = async function (context, req) {
  const cp = getClientPrincipal(req);
  if (!cp) {
    context.res = { status: 401, body: { error: "Unauthenticated" } };
    return;
  }

  const { userId, userDetails, identityProvider, claims = [] } = cp;
  const displayName = (claims.find(c => c.typ === "name") || {}).val || userDetails;

  // Validate request body
  const { gameId, score } = req.body || {};
  
  if (!gameId || typeof gameId !== "string") {
    context.res = { status: 400, body: { error: "Missing or invalid gameId" } };
    return;
  }

  if (score === undefined || score === null) {
    context.res = { status: 400, body: { error: "Missing score" } };
    return;
  }

  // Coerce score to integer
  const scoreInt = parseInt(score, 10);
  if (isNaN(scoreInt)) {
    context.res = { status: 400, body: { error: "Invalid score - must be a number" } };
    return;
  }

  const ts = Date.now();
  const randomSuffix = Math.random().toString(36).slice(2, 10);
  const docId = `${userId}-${ts}-${randomSuffix}`;

  const doc = {
    id: docId,
    playerId: userId,           // partition key
    type: "score",
    gameId,
    score: scoreInt,
    ts,
    displayName,
    email: userDetails,
    provider: identityProvider
  };

  try {
    const container = client.database(dbName).container(containerName);
    await container.items.create(doc, { partitionKey: doc.playerId });
    context.res = { 
      status: 200, 
      body: { ok: true, id: doc.id, score: scoreInt } 
    };
  } catch (err) {
    context.log.error("submit-score error", err);
    context.res = { status: 500, body: { error: "Failed to submit score" } };
  }
};

