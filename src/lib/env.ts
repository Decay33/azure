const DEFAULT_LOCAL_URL = "http://localhost:3000";

export const getAppUrl = (): string => {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return DEFAULT_LOCAL_URL;
};

export const getApiBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
};

export const isMockMode = (): boolean =>
  process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true" || process.env.USE_MOCK_DATA === "true";
