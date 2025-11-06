import "server-only";

import { Profile } from "./types/profile";
import { getProfileByUsername } from "@/server/stores/profileStore";

export const fetchProfile = async (username: string): Promise<Profile | null> => {
  return getProfileByUsername(username);
};
