'use client';

import {
  EventType,
  type Configuration,
  PublicClientApplication,
  type PopupRequest,
  type AuthenticationResult
} from "@azure/msal-browser";

const knownAuthorities = ["yslinks.ciamlogin.com"];

const requiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const buildMsalConfig = (): Configuration => {
  const clientId = requiredEnv("NEXT_PUBLIC_B2C_CLIENT_ID");
  const authority = requiredEnv("NEXT_PUBLIC_B2C_AUTHORITY");

  return {
    auth: {
      clientId,
      authority,
      knownAuthorities,
      redirectUri: "/auth/callback",
      postLogoutRedirectUri: "/"
    },
    cache: {
      cacheLocation: "localStorage",
      storeAuthStateInCookie: false
    }
  };
};

export const getLoginRequest = (): PopupRequest => {
  const scope = requiredEnv("NEXT_PUBLIC_B2C_SCOPE");
  return {
    scopes: [scope, "openid", "profile", "offline_access"]
  };
};

let client: PublicClientApplication | null = null;

export const getMsalInstance = (): PublicClientApplication => {
  if (client) {
    return client;
  }

  client = new PublicClientApplication(buildMsalConfig());

  client.addEventCallback((event) => {
    if (
      event.eventType === EventType.LOGIN_SUCCESS ||
      event.eventType === EventType.ACQUIRE_TOKEN_SUCCESS
    ) {
      const payload = event.payload as AuthenticationResult | undefined;
      const account = payload?.account;
      if (account) {
        client?.setActiveAccount(account);
      }
    }
  });

  return client;
};
