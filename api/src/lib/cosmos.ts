import { CosmosClient, Container } from "@azure/cosmos";
import { config } from "../config";

let client: CosmosClient | null = null;

const getClient = (): CosmosClient => {
  if (client) {
    return client;
  }

  const { cosmos } = config;

  if (!cosmos.connectionString) {
    throw new Error("COSMOS_DB_CONNECTION_STRING is required to use the database.");
  }

  client = new CosmosClient(cosmos.connectionString);
  return client;
};

export const getProfilesContainer = (): Container => {
  const { cosmos } = config;
  return getClient().database(cosmos.databaseId).container(cosmos.profilesContainerId);
};

export const getLinksContainer = (): Container => {
  const { cosmos } = config;
  return getClient().database(cosmos.databaseId).container(cosmos.linksContainerId);
};

export const getUsersContainer = (): Container => {
  const { cosmos } = config;
  return getClient().database(cosmos.databaseId).container(cosmos.usersContainerId);
};
