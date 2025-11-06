import { Profile, Link } from "../types";

const baseProfile: Profile = {
  id: "mock-aifunnytok",
  username: "aifunnytok",
  displayName: "AiFunnyTok",
  bio: "Comedy clips curated by AI. New skits daily.",
  avatarUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?crop=faces&fit=crop&w=256&h=256",
  theme: {
    backgroundStyle: "video",
    overlayOpacity: 0.45,
    backgroundVideos: [
      "https://cdn.coverr.co/videos/coverr-delivery-day-4164/1080p.mp4",
      "https://cdn.coverr.co/videos/coverr-blue-paint-smoke-4066/1080p.mp4",
      "https://cdn.coverr.co/videos/coverr-porch-dropoff-5014/1080p.mp4",
      "https://cdn.coverr.co/videos/coverr-knock-knock-4788/1080p.mp4"
    ]
  },
  links: [
    {
      id: "link-tiktok",
      label: "Follow on TikTok",
      url: "https://tiktok.com/@aifunnytok",
      accent: "magenta"
    },
    {
      id: "link-youtube",
      label: "Subscribe on YouTube",
      url: "https://youtube.com/@aifunnytok",
      accent: "red"
    },
    {
      id: "link-instagram",
      label: "Follow on Instagram",
      url: "https://instagram.com/aifunnytok",
      accent: "orange"
    }
  ],
  social: {
    tiktok: "https://tiktok.com/@aifunnytok",
    instagram: "https://instagram.com/aifunnytok",
    youtube: "https://youtube.com/@aifunnytok"
  },
  updatedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  subscriptionStatus: "active"
};

export const getMockProfile = (username: string): Profile | null => {
  if (username.toLowerCase() !== baseProfile.username.toLowerCase()) {
    return null;
  }

  return {
    ...baseProfile,
    links: baseProfile.links.map((link) => ({ ...link }))
  };
};

export const getMockProfileForUser = (userId: string): Profile => ({
  ...baseProfile,
  id: userId,
  links: baseProfile.links.map((link, index) => ({
    ...link,
    id: `${userId}-link-${index}`
  }))
});

export const getMockLinksForUser = (profileId: string): Link[] =>
  baseProfile.links.map((link, index) => ({
    ...link,
    id: `${profileId}-link-${index}`
  }));
