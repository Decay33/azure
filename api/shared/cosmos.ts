import { CosmosClient, Container } from '@azure/cosmos';

const endpoint = process.env.COSMOS_ENDPOINT || '';
const key = process.env.COSMOS_KEY || '';
const databaseId = process.env.COSMOS_DB || 'ysl';
const profilesContainerId = process.env.COSMOS_PROFILES_CONTAINER || 'profiles';
const eventsContainerId = process.env.COSMOS_EVENTS_CONTAINER || 'events';

const client = new CosmosClient({ endpoint, key });
const database = client.database(databaseId);

export const profilesContainer: Container = database.container(profilesContainerId);
export const eventsContainer: Container = database.container(eventsContainerId);

export interface Profile {
  id: string;
  userId: string;
  handle: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  theme: {
    style: string;
    accent: string;
  };
  links: Array<{
    id: string;
    label: string;
    url: string;
    icon?: string;
    order: number;
  }>;
  videoLinks: Array<{
    id: string;
    platform: string;
    url: string;
    thumb?: string;
    order: number;
  }>;
  status: 'active' | 'suspended' | 'canceled';
  subscription?: {
    tier: 'free' | 'creator';
    status: string;
    currentPeriodEnd?: string;
  };
  createdAt: string;
  updatedAt: string;
  ttl?: number;
}

export interface Event {
  id: string;
  handle: string;
  type: string;
  ts: string;
  ua?: string;
  ref?: string;
}

export async function getProfileByHandle(handle: string): Promise<Profile | null> {
  const query = {
    query: 'SELECT * FROM c WHERE c.handle = @handle',
    parameters: [{ name: '@handle', value: handle }],
  };

  const { resources } = await profilesContainer.items.query(query).fetchAll();
  return resources[0] || null;
}

export async function getProfileByUserId(userId: string): Promise<Profile | null> {
  const query = {
    query: 'SELECT * FROM c WHERE c.userId = @userId',
    parameters: [{ name: '@userId', value: userId }],
  };

  const { resources } = await profilesContainer.items.query(query).fetchAll();
  return resources[0] || null;
}

export async function createProfile(profile: Profile): Promise<Profile> {
  const { resource } = await profilesContainer.items.create(profile);
  return resource as Profile;
}

export async function updateProfile(profile: Profile): Promise<Profile> {
  profile.updatedAt = new Date().toISOString();
  const { resource } = await profilesContainer.item(profile.id, profile.handle).replace(profile);
  return resource as Profile;
}

export async function logEvent(event: Event): Promise<void> {
  await eventsContainer.items.create(event);
}


