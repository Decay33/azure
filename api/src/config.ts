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
    usersContainerId: process.env.COSMOS_DB_USERS_CONTAINER ?? "Users",
    profilesContainerId: process.env.COSMOS_DB_PROFILES_CONTAINER ?? "Profiles",
    linksContainerId: process.env.COSMOS_DB_LINKS_CONTAINER ?? "Links"
  },
  storage: {
    connectionString: process.env.STORAGE_CONNECTION_STRING ?? "",
    containerName:
      process.env.STORAGE_CONTAINER_NAME ?? process.env.AZURE_STORAGE_CONTAINER ?? "user-media",
    accountName: process.env.AZURE_STORAGE_ACCOUNT,
    region: process.env.AZURE_STORAGE_REGION ?? "centralus"
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY ?? "",
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? ""
  },
  auth: {
    authority: process.env.NEXT_PUBLIC_B2C_AUTHORITY ?? "",
    policy: process.env.NEXT_PUBLIC_B2C_POLICY ?? "",
    audience: process.env.B2C_API_AUDIENCE ?? "",
    scope: process.env.NEXT_PUBLIC_B2C_SCOPE ?? ""
  },
  helpers: {
    requiredEnv
  }
};
