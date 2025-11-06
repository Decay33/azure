export interface Link {
  id: string;
  label: string;
  url: string;
  accent?: "aqua" | "magenta" | "orange" | "purple" | "red" | "emerald";
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
  links: Link[];
  social?: Record<string, string>;
  updatedAt: string;
  createdAt: string;
  subscriptionStatus?: "active" | "trialing" | "past_due" | "canceled";
}
