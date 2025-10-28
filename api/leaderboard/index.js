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

  // Get query parameters
  const gameId = req.query.gameId;
  let limit = parseInt(req.query.limit || "10", 10);

  if (!gameId || typeof gameId !== "string") {
    context.res = { status: 400, body: { error: "Missing gameId parameter" } };
    return;
  }

  // Enforce max limit of 100
  if (isNaN(limit) || limit < 1) {
    limit = 10;
  }
  if (limit > 100) {
    limit = 100;
  }

  try {
    const container = client.database(dbName).container(containerName);
    
    // Cross-partition query to get top scores
    const querySpec = {
      query: `
        SELECT TOP @limit 
          c.playerId, 
          c.displayName, 
          c.email, 
          c.score, 
          c.ts,
          c.id
        FROM c
        WHERE c.type = @type AND c.gameId = @gameId
        ORDER BY c.score DESC
      `,
      parameters: [
        { name: "@limit", value: limit },
        { name: "@type", value: "score" },
        { name: "@gameId", value: gameId }
      ]
    };

    const { resources: scores } = await container.items
      .query(querySpec, { 
        enableCrossPartitionQuery: true,
        maxItemCount: limit 
      })
      .fetchAll();

    context.res = { 
      status: 200, 
      body: { 
        gameId, 
        limit, 
        count: scores.length,
        scores 
      } 
    };
  } catch (err) {
    context.log.error("leaderboard error", err);
    context.res = { status: 500, body: { error: "Failed to fetch leaderboard" } };
  }
};

