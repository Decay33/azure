import { z } from "zod";
import { MAX_BACKGROUND_VIDEOS, MAX_LINKS } from "@/lib/constants";

const usernameRegex = /^[a-z0-9][a-z0-9-]{2,30}$/i;

export const profileInputSchema = z.object({
  displayName: z.string().min(1).max(120).optional(),
  username: z
    .string()
    .regex(usernameRegex, "Username must be 3-30 characters. Letters, numbers, and dashes only.")
    .optional(),
  bio: z.string().max(280).optional(),
  avatarUrl: z.string().url().optional(),
  theme: z
    .object({
      backgroundStyle: z.enum(["video", "gradient", "static"]).optional(),
      overlayOpacity: z.number().min(0).max(1).optional(),
      gradientFrom: z.string().max(32).optional(),
      gradientTo: z.string().max(32).optional()
    })
    .optional(),
  backdrops: z.array(z.string().url()).max(MAX_BACKGROUND_VIDEOS).optional(),
  social: z.record(z.string()).optional()
});

export const linkInputSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1).max(60),
  url: z.string().url(),
  accent: z.enum(["aqua", "magenta", "orange", "purple", "red", "emerald"]).optional()
});

export const linksInputSchema = z.array(linkInputSchema).max(MAX_LINKS);

export const uploadInputSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().default("video/mp4")
});
