const { CosmosClient } = require("@azure/cosmos");

let cachedClient;

function getCosmosClient() {
  if (cachedClient) {
    return cachedClient;
  }

  const endpoint = process.env.COSMOS_ENDPOINT;
  const key = process.env.COSMOS_KEY;

  if (!endpoint || !key) {
    throw new Error("Cosmos DB configuration missing: ensure COSMOS_ENDPOINT and COSMOS_KEY are set.");
  }

  cachedClient = new CosmosClient({ endpoint, key });
  return cachedClient;
}

function getContainer() {
  const databaseId = process.env.COSMOS_DB;
  const containerId = process.env.COSMOS_PLAYERDATA_CONTAINER;

  if (!databaseId || !containerId) {
    throw new Error(
      "Cosmos DB configuration missing: ensure COSMOS_DB and COSMOS_PLAYERDATA_CONTAINER are set."
    );
  }

  const client = getCosmosClient();
  return client.database(databaseId).container(containerId);
}

module.exports = {
  getContainer
};
