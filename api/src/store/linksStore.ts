import { randomUUID } from "crypto";
import { getLinksContainer } from "../lib/cosmos";
import { Link } from "../types";
import { MAX_LINKS } from "../constants";
import { getMockLinksForUser } from "./profileStore.mock";
import { LinkInput } from "../validation/schemas";

const useMockData = process.env.USE_MOCK_DATA === "true";

export interface LinkDocument {
  id: string;
  profileId: string;
  userId: string;
  label: string;
  url: string;
  accent?: Link["accent"];
  order: number;
  createdAt: string;
  updatedAt: string;
}

const mapDocToLink = (doc: LinkDocument): Link => ({
  id: doc.id,
  label: doc.label,
  url: doc.url,
  accent: doc.accent
});

export const getLinksForProfile = async (profileId: string): Promise<Link[]> => {
  if (useMockData) {
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

  return resources.map(mapDocToLink);
};

export const replaceLinksForProfile = async (
  profileId: string,
  userId: string,
  links: LinkInput[]
): Promise<Link[]> => {
  if (useMockData) {
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
    existing.map((item) => container.item(item.id, profileId).delete().catch(() => undefined))
  );

  const now = new Date().toISOString();
  const limitedLinks = links.slice(0, MAX_LINKS);

  const documents: LinkDocument[] = limitedLinks.map((link, index) => ({
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

  return documents.map(mapDocToLink);
};
