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
    'home', 'blog', 'pricing', 'features', 'pro', 'creator', 'app', 'beta',
    'test', 'demo', 'example', 'user', 'users', 'account', 'settings'
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

export function sanitizeString(str: string, maxLength: number): string {
  return str.slice(0, maxLength).trim();
}


