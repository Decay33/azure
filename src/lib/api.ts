import "server-only";

import { Profile } from "./types/profile";
import { getApiBaseUrl, isMockMode } from "./env";
import { mockProfiles } from "../mocks/profiles";

const handleResponse = async (response: Response): Promise<Profile | null> => {
  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Failed to load profile: ${response.status} ${detail}`);
  }

  return (await response.json()) as Profile;
};

export const fetchProfile = async (username: string): Promise<Profile | null> => {
  if (isMockMode()) {
    return mockProfiles(username);
  }

  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/profiles/${username}`, {
    next: {
      revalidate: 60
    },
    headers: {
      "Content-Type": "application/json"
    }
  });

  return handleResponse(response);
};
