import { SqlParameter, SqlQuerySpec } from "@azure/cosmos";
import { getProfilesContainer } from "@/server/cosmos/client";
import { Profile } from "@/lib/types/profile";
import { getMockProfile, getMockProfileForUser } from "./profileStore.mock";
import { MAX_BACKGROUND_VIDEOS } from "@/lib/constants";
import { getLinksForProfile } from "./linksStore";
import { isMockMode } from "@/lib/env";

export interface ProfileDocument {
  id: string;
  userId: string;
  username?: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  theme?: {
    backgroundStyle?: string;
    overlayOpacity?: number;
    gradientFrom?: string;
    gradientTo?: string;
    backgroundVideos?: string[];
  };
  backdrops?: string[];
  social?: Record<string, string>;
  subscriptionStatus?: "active" | "trialing" | "past_due" | "canceled";
  createdAt: string;
  updatedAt: string;
}

const profileQuery = (username: string): SqlQuerySpec => ({
  query: "SELECT * FROM c WHERE c.username = @username OFFSET 0 LIMIT 1",
  parameters: [
    {
      name: "@username",
      value: username
    } as SqlParameter
  ]
});

const getDocumentByUserId = async (userId: string): Promise<ProfileDocument | null> => {
  try {
    const { resource } = await getProfilesContainer().item(userId, userId).read<ProfileDocument>();
    return resource ?? null;
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      typeof (error as { code: unknown }).code === "number" &&
      (error as { code: number }).code === 404
    ) {
      return null;
    }
    throw error;
  }
};

const mapDocumentToProfile = async (doc: ProfileDocument): Promise<Profile> => {
  const links = await getLinksForProfile(doc.id);
  const backgroundVideos =
    doc.theme?.backgroundVideos ?? doc.backdrops?.slice(0, MAX_BACKGROUND_VIDEOS) ?? [];
  const backgroundStyle = (doc.theme?.backgroundStyle ?? "video") as Profile["theme"]["backgroundStyle"];

  return {
    id: doc.id,
    username: doc.username ?? doc.id,
    displayName: doc.displayName ?? doc.username ?? doc.id,
    bio: doc.bio,
    avatarUrl: doc.avatarUrl,
    theme: {
      backgroundStyle,
      backgroundVideos,
      gradientFrom: doc.theme?.gradientFrom,
      gradientTo: doc.theme?.gradientTo,
      overlayOpacity: doc.theme?.overlayOpacity ?? 0.55
    },
    links,
    social: doc.social,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    subscriptionStatus: doc.subscriptionStatus
  };
};

export const getProfileByUsername = async (username: string): Promise<Profile | null> => {
  if (isMockMode()) {
    return getMockProfile(username);
  }

  const { resources } = await getProfilesContainer().items.query<ProfileDocument>(profileQuery(username)).fetchAll();
  if (!resources.length) {
    return null;
  }

  return mapDocumentToProfile(resources[0]);
};

export const getProfileByUserId = async (userId: string): Promise<Profile | null> => {
  if (isMockMode()) {
    return getMockProfileForUser(userId);
  }

  const doc = await getDocumentByUserId(userId);
  if (!doc) {
    return null;
  }

  return mapDocumentToProfile(doc);
};

export type ProfileUpdate = {
  displayName?: string;
  bio?: string;
  username?: string;
  avatarUrl?: string;
  backgroundVideos?: string[];
  theme?: Partial<Profile["theme"]>;
  social?: Record<string, string>;
};

export const upsertProfile = async (userId: string, update: ProfileUpdate): Promise<Profile> => {
  if (isMockMode()) {
    return getMockProfileForUser(userId);
  }

  const existingDoc = await getDocumentByUserId(userId);
  const now = new Date().toISOString();

  const baseDoc: ProfileDocument = existingDoc ?? {
    id: userId,
    userId,
    createdAt: now,
    updatedAt: now,
    theme: {
      backgroundStyle: "video",
      overlayOpacity: 0.55,
      backgroundVideos: []
    }
  };

  const mergedTheme = {
    ...baseDoc.theme,
    ...update.theme
  };

  if (update.backgroundVideos) {
    mergedTheme.backgroundVideos = update.backgroundVideos.slice(0, MAX_BACKGROUND_VIDEOS);
  }

  const doc: ProfileDocument = {
    ...baseDoc,
    displayName: update.displayName ?? baseDoc.displayName,
    bio: update.bio ?? baseDoc.bio,
    username: update.username ?? baseDoc.username,
    avatarUrl: update.avatarUrl ?? baseDoc.avatarUrl,
    theme: mergedTheme,
    backdrops: mergedTheme.backgroundVideos,
    social: update.social ?? baseDoc.social,
    updatedAt: now
  };

  await getProfilesContainer().items.upsert(doc, { disableAutomaticIdGeneration: true });

  return mapDocumentToProfile(doc);
};
