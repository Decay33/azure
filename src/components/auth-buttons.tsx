'use client';

import { useCallback, useState } from "react";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { getLoginRequest } from "../lib/msal";

const POST_LOGIN_KEY = "ysl:post-login-redirect";

const storePostLoginRedirect = () => {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.setItem(POST_LOGIN_KEY, window.location.pathname + window.location.search);
};

const consumePostLoginRedirect = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const value = sessionStorage.getItem(POST_LOGIN_KEY);
  if (value) {
    sessionStorage.removeItem(POST_LOGIN_KEY);
  }
  return value;
};

export function usePostLoginRedirect() {
  return { storePostLoginRedirect, consumePostLoginRedirect };
}

export function AuthButtons() {
  const { instance } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [isProcessing, setProcessing] = useState(false);

  const handleLogin = useCallback(async () => {
    try {
      setProcessing(true);
      storePostLoginRedirect();
      const result = await instance.loginPopup(getLoginRequest());
      instance.setActiveAccount(result.account);
    } catch (error) {
      console.error("Login failed", error);
    } finally {
      setProcessing(false);
    }
  }, [instance]);

  const handleLogout = useCallback(async () => {
    try {
      setProcessing(true);
      await instance.logoutPopup({
        postLogoutRedirectUri: "/"
      });
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setProcessing(false);
    }
  }, [instance]);

  return (
    <div className="flex items-center gap-3">
      {isAuthenticated ? (
        <button
          type="button"
          onClick={handleLogout}
          disabled={isProcessing}
          className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white/85 transition hover:border-white/40 hover:text-white disabled:cursor-wait disabled:opacity-60"
        >
          {isProcessing ? "Signing out…" : "Sign out"}
        </button>
      ) : (
        <button
          type="button"
          onClick={handleLogin}
          disabled={isProcessing}
          className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-200 disabled:cursor-wait disabled:opacity-60"
        >
          {isProcessing ? "Opening…" : "Sign in"}
        </button>
      )}
    </div>
  );
}
