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
  const displayName =
    (claims.find(c => c.typ === "name") || {}).val || userDetails;

  const doc = {
    id: userId,                 // single profile doc per user
    playerId: userId,           // partition key property (MUST match /playerId)
    type: "user",               // allows mixed record types in one container
    email: userDetails,
    provider: identityProvider,
    displayName,
    createdAt: Date.now(),
    lastSeenAt: Date.now()
  };

  try {
    const container = client.database(dbName).container(containerName);
    await container.items.upsert(doc, { partitionKey: doc.playerId });
    context.res = { status: 200, body: { ok: true, user: { id: doc.id, displayName: doc.displayName } } };
  } catch (err) {
    context.log.error("user-init error", err);
    context.res = { status: 500, body: { error: "Failed to upsert user" } };
  }
};
