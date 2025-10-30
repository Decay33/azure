const { CosmosClient } = require("@azure/cosmos");

let cachedClient;
let cachedContainer;

function getContainer() {
  if (cachedContainer) {
    return cachedContainer;
  }

  const connectionString = process.env.COSMOS_CONNECTION_STRING;
  if (!connectionString) {
    return null;
  }

  const databaseId = process.env.COSMOS_DB;
  const containerId = process.env.COSMOS_PLAYERDATA_CONTAINER;

  if (!databaseId || !containerId) {
    throw new Error("Cosmos DB configuration missing: ensure COSMOS_DB and COSMOS_PLAYERDATA_CONTAINER are set.");
  }

  if (!cachedClient) {
    cachedClient = new CosmosClient(connectionString);
  }

  cachedContainer = cachedClient.database(databaseId).container(containerId);
  return cachedContainer;
}

module.exports = {
  getContainer
};
