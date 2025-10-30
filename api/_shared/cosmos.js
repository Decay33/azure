const { CosmosClient } = require("@azure/cosmos");

let cachedClient;
let cachedContainer;

function getContainer() {
  if (cachedContainer) {
    return cachedContainer;
  }

  const connectionString = process.env.COSMOS_CONN_STRING;
  if (!connectionString) {
    return null;
  }

  const databaseId = process.env.COSMOS_DB_NAME;
  const containerId = process.env.COSMOS_CONTAINER_NAME;

  if (!databaseId || !containerId) {
    throw new Error("Cosmos DB configuration missing: ensure COSMOS_DB_NAME and COSMOS_CONTAINER_NAME are set.");
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
