import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function validateHandle(handle: string): { valid: boolean; error?: string } {
  if (!handle) {
    return { valid: false, error: 'Handle is required' };
  }
  
  if (handle.length < 3) {
    return { valid: false, error: 'Handle must be at least 3 characters' };
  }
  
  if (handle.length > 20) {
    return { valid: false, error: 'Handle must be 20 characters or less' };
  }
  
  const regex = /^[a-z0-9_-]+$/;
  if (!regex.test(handle)) {
    return { valid: false, error: 'Handle can only contain lowercase letters, numbers, hyphens, and underscores' };
  }
  
  const reserved = [
    'admin', 'api', 'www', 'cdn', 'support', 'help', 'terms', 'privacy',
    'dashboard', 'login', 'logout', 'signup', 'signin', 'about', 'contact',
    'home', 'blog', 'pricing', 'features', 'pro', 'creator', 'app', 'beta'
  ];
  
  if (reserved.includes(handle.toLowerCase())) {
    return { valid: false, error: 'This handle is reserved' };
  }
  
  return { valid: true };
}

export function validateUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}


