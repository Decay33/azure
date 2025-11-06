type RequiredEnv = (key: string) => string;

const requiredEnv: RequiredEnv = (key) => {
  const value = process.env[key];

  if (!value || value.trim().length === 0) {
    throw new Error(`Environment variable ${key} is not set.`);
  }

  return value;
};

export const config = {
  cosmos: {
    connectionString: process.env.COSMOS_DB_CONNECTION_STRING ?? "",
    databaseId: process.env.COSMOS_DB_DATABASE_ID ?? "YSLData",
    profilesContainerId: process.env.COSMOS_DB_PROFILES_CONTAINER ?? "Profiles",
    linksContainerId: process.env.COSMOS_DB_LINKS_CONTAINER ?? "Links"
  },
  storage: {
    connectionString: process.env.STORAGE_CONNECTION_STRING ?? "",
    containerName: process.env.STORAGE_CONTAINER_NAME ?? "user-media"
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY ?? "",
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? ""
  },
  auth: {
    tenant: process.env.AAD_B2C_TENANT ?? "",
    clientId: process.env.AAD_B2C_CLIENT_ID ?? "",
    clientSecret: process.env.AAD_B2C_CLIENT_SECRET ?? "",
    policy: process.env.AAD_B2C_POLICY ?? "B2C_1_signupsignin"
  },
  helpers: {
    requiredEnv
  }
};
