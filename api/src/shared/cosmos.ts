import { CosmosClient } from "@azure/cosmos";

const endpoint = process.env.COSMOS_ENDPOINT || "";
const key = process.env.COSMOS_KEY || "";
const databaseId = process.env.COSMOS_DB || "gamehub";

const client = new CosmosClient({ endpoint, key });
const database = client.database(databaseId);
const profilesContainer = database.container("profiles");

export interface Profile {
  id?: string;
  userId: string;
  handle: string;
  displayName: string;
  bio: string;
  profilePicture?: string;
  links: Array<{ title: string; url: string }>;
  videoLinks: Array<{ platform: string; url: string }>;
  theme: string;
  views?: number;
  subscriptionTier?: string;
  subscriptionStatus?: string;
  stripeCustomerId?: string;
  createdAt?: string;
  updatedAt?: string;
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
    const { resources } = await profilesContainer.items
      .query<Profile>({
        query: "SELECT * FROM c WHERE c.handle = @handle",
        parameters: [{ name: "@handle", value: handle }]
      })
      .fetchAll();
    
    return resources[0] || null;
  } catch (error) {
    console.error("Error fetching profile by handle:", error);
    return null;
  }
}

export async function createProfile(profile: Profile): Promise<Profile> {
  const newProfile = {
    ...profile,
    id: profile.userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    views: 0
  };

  const { resource } = await profilesContainer.items.create(newProfile);
  if (!resource) throw new Error("Failed to create profile");
  return resource as unknown as Profile;
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
  const existing = await getProfileByUserId(userId);
  if (!existing) throw new Error("Profile not found");

  const updated = {
    ...existing,
    ...updates,
    userId: existing.userId, // Prevent changing userId
    id: existing.id, // Prevent changing id
    updatedAt: new Date().toISOString()
  };

  const { resource } = await profilesContainer.item(existing.id!, existing.userId).replace(updated);
  if (!resource) throw new Error("Failed to update profile");
  return resource as unknown as Profile;
}

