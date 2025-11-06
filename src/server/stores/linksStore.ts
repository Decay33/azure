import { randomUUID } from "crypto";
import { getLinksContainer } from "@/server/cosmos/client";
import { MAX_LINKS } from "@/lib/constants";
import { LinkItem } from "@/lib/types/profile";
import { getMockLinksForUser } from "./profileStore.mock";
import { isMockMode } from "@/lib/env";

export interface LinkDocument {
  id: string;
  profileId: string;
  userId: string;
  label: string;
  url: string;
  accent?: LinkItem["accent"];
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type LinkInput = {
  id?: string;
  label: string;
  url: string;
  accent?: LinkItem["accent"];
};

export const getLinksForProfile = async (profileId: string): Promise<LinkItem[]> => {
  if (isMockMode()) {
    return getMockLinksForUser(profileId);
  }

  const container = getLinksContainer();
  const { resources } = await container.items
    .query<LinkDocument>({
      query: "SELECT * FROM c WHERE c.profileId = @profileId ORDER BY c.order ASC",
      parameters: [
        {
          name: "@profileId",
          value: profileId
        }
      ]
    })
    .fetchAll();

  return resources.map((doc) => ({
    id: doc.id,
    label: doc.label,
    url: doc.url,
    accent: doc.accent
  }));
};

export const replaceLinksForProfile = async (
  profileId: string,
  userId: string,
  linkInputs: LinkInput[]
): Promise<LinkItem[]> => {
  if (isMockMode()) {
    return getMockLinksForUser(profileId);
  }

  const container = getLinksContainer();
  const { resources: existing } = await container.items
    .query<{ id: string }>({
      query: "SELECT c.id FROM c WHERE c.profileId = @profileId",
      parameters: [
        {
          name: "@profileId",
          value: profileId
        }
      ]
    })
    .fetchAll();

  await Promise.all(
    existing.map((doc) => container.item(doc.id, profileId).delete().catch(() => undefined))
  );

  const cappedLinks = linkInputs.slice(0, MAX_LINKS);
  const now = new Date().toISOString();

  const documents: LinkDocument[] = cappedLinks.map((link, index) => ({
    id: link.id ?? randomUUID(),
    profileId,
    userId,
    label: link.label,
    url: link.url,
    accent: link.accent,
    order: index,
    createdAt: now,
    updatedAt: now
  }));

  await Promise.all(documents.map((doc) => container.items.upsert(doc)));

  return documents.map((doc) => ({
    id: doc.id,
    label: doc.label,
    url: doc.url,
    accent: doc.accent
  }));
};
