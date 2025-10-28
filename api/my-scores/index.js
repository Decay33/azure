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

  const { userId } = cp;
  const gameId = req.query.gameId; // Optional filter

  try {
    const container = client.database(dbName).container(containerName);
    
    let querySpec;
    
    if (gameId) {
      // Filter by specific game
      querySpec = {
        query: `
          SELECT c.gameId, c.score, c.ts, c.id
          FROM c
          WHERE c.type = @type 
            AND c.playerId = @userId 
            AND c.gameId = @gameId
          ORDER BY c.ts DESC
        `,
        parameters: [
          { name: "@type", value: "score" },
          { name: "@userId", value: userId },
          { name: "@gameId", value: gameId }
        ]
      };
    } else {
      // Get all scores for user
      querySpec = {
        query: `
          SELECT c.gameId, c.score, c.ts, c.id
          FROM c
          WHERE c.type = @type AND c.playerId = @userId
          ORDER BY c.ts DESC
        `,
        parameters: [
          { name: "@type", value: "score" },
          { name: "@userId", value: userId }
        ]
      };
    }

    const { resources: scores } = await container.items
      .query(querySpec, { 
        partitionKey: userId  // Can use partition key since we're querying only this user
      })
      .fetchAll();

    context.res = { 
      status: 200, 
      body: { 
        userId,
        gameId: gameId || "all",
        count: scores.length,
        scores 
      } 
    };
  } catch (err) {
    context.log.error("my-scores error", err);
    context.res = { status: 500, body: { error: "Failed to fetch scores" } };
  }
};

