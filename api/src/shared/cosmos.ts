import { CosmosClient } from "@azure/cosmos";
import { randomUUID } from "crypto";

const endpoint = process.env.COSMOS_ENDPOINT || "";
const key = process.env.COSMOS_KEY || "";
const databaseId = process.env.COSMOS_DB || "gamehub";
const containerId = process.env.COSMOS_PROFILES || "profiles";

const client = new CosmosClient({ endpoint, key });
const database = client.database(databaseId);
const profilesContainer = database.container(containerId);

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
    const { resources } = await profilesContainer.items
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
    const { resource } = await profilesContainer.item(handle, handle).read<Profile>();
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

  const { resource } = await profilesContainer.items.create(newProfile);
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
  const { resource } = await profilesContainer.item(existing.handle, existing.handle).replace(updated);
  if (!resource) throw new Error("Failed to update profile");
  return resource as Profile;
}

