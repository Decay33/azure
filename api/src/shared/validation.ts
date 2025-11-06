export function validateHandle(handle: string): boolean {
  // Handle must be 3-30 characters, alphanumeric and hyphens only
  const handleRegex = /^[a-zA-Z0-9-]{3,30}$/;
  return handleRegex.test(handle);
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function validateVideoUrl(url: string): boolean {
  // Support TikTok, YouTube, Instagram, etc.
  const videoPatterns = [
    /tiktok\.com/,
    /youtube\.com|youtu\.be/,
    /instagram\.com/,
    /facebook\.com/,
    /twitter\.com|x\.com/
  ];
  
  return videoPatterns.some(pattern => pattern.test(url));
}

