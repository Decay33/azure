export type LinkAccent = "aqua" | "magenta" | "orange" | "purple" | "red" | "emerald";

export interface LinkItem {
  id: string;
  label: string;
  url: string;
  accent?: LinkAccent;
}

export interface ProfileTheme {
  backgroundStyle: "video" | "gradient" | "static";
  backgroundVideos: string[];
  gradientFrom?: string;
  gradientTo?: string;
  overlayOpacity?: number;
}

export interface Profile {
  id: string;
  username: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  theme: ProfileTheme;
  links: LinkItem[];
  social?: Record<string, string>;
  subscriptionStatus?: "active" | "trialing" | "past_due" | "canceled";
  createdAt: string;
  updatedAt: string;
}
