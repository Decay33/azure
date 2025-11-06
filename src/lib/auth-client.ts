'use client';

import {
  InteractionRequiredAuthError,
  type AuthenticationResult,
  type IPublicClientApplication,
  type PopupRequest
} from "@azure/msal-browser";
import { getLoginRequest, getMsalInstance } from "./msal";

export const POST_LOGIN_KEY = "ysl:post-login-redirect";

export const setPostLoginRedirect = (path: string) => {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.setItem(POST_LOGIN_KEY, path);
};

export const consumePostLoginRedirect = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const value = sessionStorage.getItem(POST_LOGIN_KEY);
  if (value) {
    sessionStorage.removeItem(POST_LOGIN_KEY);
  }
  return value;
};

const getAccount = (instance: IPublicClientApplication) => {
  const active = instance.getActiveAccount();
  if (active) {
    return active;
  }

  const [firstAccount] = instance.getAllAccounts();

  if (firstAccount) {
    instance.setActiveAccount(firstAccount);
  }

  return firstAccount ?? null;
};

export const acquireToken = async (
  instance: IPublicClientApplication,
  request?: PopupRequest
): Promise<AuthenticationResult> => {
  const finalRequest = request ?? getLoginRequest();
  const account = getAccount(instance);
  if (!account) {
    throw new Error("No active account");
  }

  try {
    return await instance.acquireTokenSilent({ ...finalRequest, account });
  } catch (error) {
    if (error instanceof InteractionRequiredAuthError) {
      return instance.acquireTokenPopup(finalRequest);
    }
    throw error;
  }
};

export const ensureAuthenticated = async (): Promise<AuthenticationResult | null> => {
  const instance = getMsalInstance();
  await instance.initialize();

  try {
    return await acquireToken(instance);
  } catch (error) {
    if (error instanceof InteractionRequiredAuthError) {
      return null;
    }
    throw error;
  }
};
