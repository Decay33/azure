'use client';

import type { IPublicClientApplication } from "@azure/msal-browser";
import { acquireToken } from "./auth-client";
import { getApiBaseUrl } from "./env";

type FetchOptions = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
};

export async function callAuthorizedApi<T>(
  instance: IPublicClientApplication,
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const tokenResult = await acquireToken(instance);
  const token = tokenResult.accessToken;
  const baseUrl = getApiBaseUrl().replace(/\/$/, "");
  const url = baseUrl
    ? `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`
    : `${path.startsWith("/") ? "" : "/"}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {})
    }
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`API request failed: ${response.status} ${detail}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
