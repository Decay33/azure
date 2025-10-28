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

  const { userId, userDetails, identityProvider } = cp;
  const { type = "event", payload = {}, ts = Date.now() } = req.body || {};

  const doc = {
    id: `${userId}-${ts}-${Math.random().toString(36).slice(2)}`,
    playerId: userId,           // partition key property for /playerId
    type,                       // e.g., "page_view", "click"
    payload,                    // anything you want to store
    ts,
    meta: {
      email: userDetails,
      provider: identityProvider
    }
  };

  try {
    const container = client.database(dbName).container(containerName);
    await container.items.create(doc, { partitionKey: doc.playerId });
    context.res = { status: 200, body: { ok: true, id: doc.id } };
  } catch (err) {
    context.log.error("track error", err);
    context.res = { status: 500, body: { error: "Failed to store event" } };
  }
};
