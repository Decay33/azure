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

    const gameIdRaw = req.query?.gameId || req.query?.gameid;
    const gameId = typeof gameIdRaw === "string" ? gameIdRaw.trim() : "";

    const queryParts = [
      "SELECT c.gameId, c.score, c.ts",
      "FROM c",
      "WHERE c.type = @type AND c.playerId = @playerId"
    ];

    const parameters = [
      { name: "@type", value: "score" },
      { name: "@playerId", value: user.playerId }
    ];

    if (gameId) {
      queryParts.push("AND c.gameId = @gameId");
      parameters.push({ name: "@gameId", value: gameId });
    }

    queryParts.push("ORDER BY c.ts DESC");

    const container = getContainer();
    const { resources } = await container.items
      .query(
        {
          query: queryParts.join(" "),
          parameters
        },
        { enableCrossPartitionQuery: true }
      )
      .fetchAll();

    context.res = {
      status: 200,
      body: resources
    };
  } catch (error) {
    context.log.error("my-scores failure", error);
    context.res = {
      status: 500,
      body: { error: "Failed to fetch scores." }
    };
  }
};
