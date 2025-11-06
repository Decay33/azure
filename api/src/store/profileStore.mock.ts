import { Profile } from "../types";

const mockProfiles: Record<string, Profile> = {
  aifunnytok: {
    id: "mock-aifunnytok",
    username: "aifunnytok",
    displayName: "AiFunnyTok",
    bio: "Comedy clips curated by AI. New skits daily.",
    avatarUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?crop=faces&fit=crop&w=256&h=256",
    theme: {
      backgroundStyle: "video",
      overlayOpacity: 0.45,
      backgroundVideos: [
        "https://example.com/videos/loop-1.mp4",
        "https://example.com/videos/loop-2.mp4",
        "https://example.com/videos/loop-3.mp4",
        "https://example.com/videos/loop-4.mp4",
        "https://example.com/videos/loop-5.mp4",
        "https://example.com/videos/loop-6.mp4",
        "https://example.com/videos/loop-7.mp4",
        "https://example.com/videos/loop-8.mp4"
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
  }
};

export const getMockProfile = (username: string): Profile | null => {
  const key = username.toLowerCase();
  return mockProfiles[key] ?? null;
};
