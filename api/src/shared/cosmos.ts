import { CosmosClient, Container, Database } from "@azure/cosmos";

export class CosmosConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CosmosConfigError";
  }
}

let client: CosmosClient | null = null;
let database: Database | null = null;
let profilesContainer: Container | null = null;

function getRequiredEnv(name: string, fallback?: string): string | undefined {
  const value = process.env[name];
  if (value && value.trim().length > 0) {
    return value.trim();
  }
  return fallback?.trim();
}

function initialiseClient(): CosmosClient {
  if (client) {
    return client;
  }

  const connectionString = getRequiredEnv("COSMOS_CONNECTION_STRING");
  const endpoint = getRequiredEnv("COSMOS_ENDPOINT");
  const key = getRequiredEnv("COSMOS_KEY");

  try {
    if (connectionString) {
      client = new CosmosClient(connectionString);
    } else if (endpoint && key) {
      client = new CosmosClient({ endpoint, key });
    } else {
      throw new CosmosConfigError(
        "Cosmos configuration missing. Set COSMOS_CONNECTION_STRING or both COSMOS_ENDPOINT and COSMOS_KEY."
      );
    }
  } catch (error: any) {
    if (error instanceof CosmosConfigError) {
      throw error;
    }
    throw new CosmosConfigError(
      `Failed to initialise Cosmos client: ${error?.message || "Unknown error"}`
    );
  }

  return client!;
}

function getDatabase(): Database {
  if (!database) {
    const dbId = getRequiredEnv("COSMOS_DB", "ysl");
    if (!dbId) {
      throw new CosmosConfigError("COSMOS_DB is not configured.");
    }
    database = initialiseClient().database(dbId);
  }
  return database!;
}

function getProfilesContainer(): Container {
  if (!profilesContainer) {
    const containerId =
      getRequiredEnv("COSMOS_PROFILES") ||
      getRequiredEnv("COSMOS_PROFILES_CONTAINER") ||
      "profiles";

    profilesContainer = getDatabase().container(containerId);
  }
  return profilesContainer!;
}

export interface Profile {
  id: string;
  userId: string;
  handle: string;
  displayName: string;
  links: Array<{ title: string; url: string }>;
  videoLinks: Array<{ platform: string; url: string }>;
  status: string;
  views?: number;
  subscriptionTier?: string;
  subscriptionStatus?: string;
  stripeCustomerId?: string;
  createdAt: string;
  updatedAt: string;
}

export async function getProfileByUserId(userId: string): Promise<Profile | null> {
  try {
    const container = getProfilesContainer();
    const { resources } = await container.items
      .query<Profile>({
        query: "SELECT * FROM c WHERE c.userId = @userId",
        parameters: [{ name: "@userId", value: userId }]
      })
      .fetchAll();
    
    return resources[0] || null;
  } catch (error) {
    console.error("Error fetching profile by userId:", error);
    return null;
  }
}

export async function getProfileByHandle(handle: string): Promise<Profile | null> {
  try {
    // Use point read with partition key for efficiency
    const container = getProfilesContainer();
    const { resource } = await container.item(handle, handle).read<Profile>();
    return resource || null;
  } catch (error: any) {
    // 404 means not found, which is valid
    if (error.code === 404) {
      return null;
    }
    console.error("Error fetching profile by handle:", error);
    return null;
  }
}

export async function createProfile(profile: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>): Promise<Profile> {
  const newProfile: Profile = {
    id: profile.handle, // Use handle as id (same as partition key)
    userId: profile.userId,
    handle: profile.handle,
    displayName: profile.displayName,
    links: profile.links || [],
    videoLinks: profile.videoLinks || [],
    status: profile.status || "active",
    views: 0,
    subscriptionTier: profile.subscriptionTier,
    subscriptionStatus: profile.subscriptionStatus,
    stripeCustomerId: profile.stripeCustomerId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const container = getProfilesContainer();
  const { resource } = await container.items.create(newProfile);
  if (!resource) throw new Error("Failed to create profile");
  return resource as Profile;
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
  const existing = await getProfileByUserId(userId);
  if (!existing) throw new Error("Profile not found");

  const updated: Profile = {
    ...existing,
    ...updates,
    userId: existing.userId, // Prevent changing userId
    id: existing.id, // Prevent changing id
    handle: existing.handle, // Prevent changing handle (partition key)
    updatedAt: new Date().toISOString()
  };

  // Use handle as partition key
  const container = getProfilesContainer();
  const { resource } = await container.item(existing.handle, existing.handle).replace(updated);
  if (!resource) throw new Error("Failed to update profile");
  return resource as Profile;
}

export async function incrementProfileViews(handle: string): Promise<void> {
  const container = getProfilesContainer();
  const { resource } = await container.item(handle, handle).read<Profile>();
  if (!resource) {
    throw new Error("Profile not found");
  }

  const updated: Profile = {
    ...resource,
    views: (resource.views || 0) + 1,
    updatedAt: new Date().toISOString()
  };

  await container.item(handle, handle).replace(updated);
}

