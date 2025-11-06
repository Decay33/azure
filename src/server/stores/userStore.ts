import { getUsersContainer } from "@/server/cosmos/client";
import { isMockMode } from "@/lib/env";

export interface UserDocument {
  id: string;
  email?: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

export const ensureUserDocument = async (userId: string, data: { email?: string; name?: string }) => {
  const now = new Date().toISOString();

  if (isMockMode()) {
    return {
      id: userId,
      email: data.email,
      name: data.name,
      createdAt: now,
      updatedAt: now
    };
  }

  try {
    const container = getUsersContainer();
    const { resource } = await container.item(userId, userId).read<UserDocument>();
    if (resource) {
      const updated: UserDocument = {
        ...resource,
        email: data.email ?? resource.email,
        name: data.name ?? resource.name,
        updatedAt: now
      };
      await container.items.upsert(updated, { disableAutomaticIdGeneration: true });
      return updated;
    }
  } catch (error) {
    if (
      !(typeof error === "object" && error !== null && "code" in error && (error as { code: number }).code === 404)
    ) {
      throw error;
    }
  }

  const document: UserDocument = {
    id: userId,
    email: data.email,
    name: data.name,
    createdAt: now,
    updatedAt: now
  };

  await getUsersContainer().items.create(document);
  return document;
};
