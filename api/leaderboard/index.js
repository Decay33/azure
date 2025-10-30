const { getUser } = require("../_shared/auth");
const { getContainer } = require("../_shared/cosmos");

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

    const gameId = (req.query?.gameId || req.query?.gameid || "").trim();
    if (!gameId) {
      context.res = {
        status: 400,
        body: { error: "gameId query parameter is required." }
      };
      return;
    }

    const rawLimit = req.query?.limit;
    let limit = 10;
    if (rawLimit !== undefined) {
      const parsed = parseInt(rawLimit, 10);
      if (Number.isNaN(parsed) || parsed <= 0) {
        context.res = {
          status: 400,
          body: { error: "limit must be a positive integer." }
        };
        return;
      }

      limit = Math.min(parsed, 100);
    }

    const container = getContainer();
    const query = `
      SELECT TOP ${limit} c.playerId, c.displayName, c.email, c.score, c.ts
      FROM c
      WHERE c.type = @type AND c.gameId = @gameId
      ORDER BY c.score DESC
    `;

    const { resources } = await container.items
      .query(
        {
          query,
          parameters: [
            { name: "@type", value: "score" },
            { name: "@gameId", value: gameId }
          ]
        },
        { enableCrossPartitionQuery: true }
      )
      .fetchAll();

    context.res = {
      status: 200,
      body: resources
    };
  } catch (error) {
    context.log.error("leaderboard failure", error);
    context.res = {
      status: 500,
      body: { error: "Failed to fetch leaderboard." }
    };
  }
};
