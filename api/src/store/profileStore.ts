import { SqlParameter, SqlQuerySpec } from "@azure/cosmos";
import { getLinksContainer, getProfilesContainer } from "../lib/cosmos";
import { Profile } from "../types";
import { getMockProfile } from "./profileStore.mock";

const useMockData = process.env.USE_MOCK_DATA === "true";

const profileQuery = (username: string): SqlQuerySpec => ({
  query: "SELECT * FROM c WHERE c.username = @username OFFSET 0 LIMIT 1",
  parameters: [
    {
      name: "@username",
      value: username
    } as SqlParameter
  ]
});

export const getProfileByUsername = async (username: string): Promise<Profile | null> => {
  if (useMockData) {
    return getMockProfile(username);
  }

  const profilesContainer = getProfilesContainer();
  const linksContainer = getLinksContainer();

  const { resources: profiles } = await profilesContainer.items.query<Profile>(profileQuery(username)).fetchAll();

  if (!profiles.length) {
    return null;
  }

  const profile = profiles[0];

  const { resources: links } = await linksContainer.items
    .query(
      {
        query: "SELECT * FROM c WHERE c.profileId = @profileId",
        parameters: [
          {
            name: "@profileId",
            value: profile.id
          }
        ]
      }
    )
    .fetchAll();

  return {
    ...profile,
    links
  };
};
