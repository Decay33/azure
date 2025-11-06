import { CosmosClient, type Container, type Database } from "@azure/cosmos";

let cachedDatabase: Database | null = null;

const getConnectionString = () => process.env.COSMOS_DB_CONNECTION_STRING ?? process.env.COSMOS_CONN_STRING;

const getDatabaseId = () => process.env.COSMOS_DB_DATABASE_ID ?? process.env.COSMOS_DB ?? "ysldb";

const getContainerName = (envKey: string, fallback: string) =>
  process.env[envKey] ?? process.env[envKey.toUpperCase()] ?? fallback;

const ensureDatabase = (): Database => {
  if (cachedDatabase) {
    return cachedDatabase;
  }

  const connectionString = getConnectionString();

  if (!connectionString) {
    throw new Error("COSMOS_DB_CONNECTION_STRING (or COSMOS_CONN_STRING) must be set.");
  }

  const client = new CosmosClient(connectionString);
  cachedDatabase = client.database(getDatabaseId());
  return cachedDatabase;
};

const getContainer = (envKey: string, fallback: string): Container => {
  const database = ensureDatabase();
  return database.container(getContainerName(envKey, fallback));
};

export const getDatabase = () => ensureDatabase();
export const getUsersContainer = () => getContainer("COSMOS_DB_USERS_CONTAINER", "users");
export const getProfilesContainer = () => getContainer("COSMOS_DB_PROFILES_CONTAINER", "profiles");
export const getLinksContainer = () => getContainer("COSMOS_DB_LINKS_CONTAINER", "links");
