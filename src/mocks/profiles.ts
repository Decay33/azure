import { Profile } from "../lib/types/profile";

const MOCK_PROFILES: Record<string, Profile> = {
  aifunnytok: {
    id: "mock-aifunnytok",
    username: "aifunnytok",
    displayName: "AiFunnyTok",
    bio: "Comedy clips curated by AI. New skits daily.",
    avatarUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?crop=faces&fit=crop&w=256&h=256",
    theme: {
      backgroundStyle: "video",
      backgroundVideos: [
        "https://cdn.coverr.co/videos/coverr-delivery-day-4164/1080p.mp4",
        "https://cdn.coverr.co/videos/coverr-hacking-the-mainframe-8725/1080p.mp4",
        "https://cdn.coverr.co/videos/coverr-blue-paint-smoke-4066/1080p.mp4",
        "https://cdn.coverr.co/videos/coverr-porch-dropoff-5014/1080p.mp4",
        "https://cdn.coverr.co/videos/coverr-courier-on-the-run-5395/1080p.mp4",
        "https://cdn.coverr.co/videos/coverr-knock-knock-4788/1080p.mp4",
        "https://cdn.coverr.co/videos/coverr-ocean-splash-7615/1080p.mp4",
        "https://cdn.coverr.co/videos/coverr-blue-lights-8766/1080p.mp4"
      ],
      overlayOpacity: 0.55
    },
    links: [
      {
        id: "link-shop",
        label: "TikTok Shop",
        url: "https://www.tiktok.com/@aifunnytok/shop",
        accent: "aqua"
      },
      {
        id: "link-tiktok",
        label: "Follow on TikTok",
        url: "https://www.tiktok.com/@aifunnytok",
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
      tiktok: "https://www.tiktok.com/@aifunnytok",
      youtube: "https://youtube.com/@aifunnytok",
      instagram: "https://instagram.com/aifunnytok"
    },
    subscriptionStatus: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
};

export const mockProfiles = (username: string): Profile | null => {
  const key = username.toLowerCase();
  return MOCK_PROFILES[key] ?? null;
};
