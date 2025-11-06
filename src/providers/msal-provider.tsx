'use client';

import { useEffect, useState, type ReactNode } from "react";
import { MsalProvider } from "@azure/msal-react";
import type { PublicClientApplication } from "@azure/msal-browser";
import { getMsalInstance } from "../lib/msal";

export function MsalClientProvider({ children }: { children: ReactNode }) {
  const [instance, setInstance] = useState<PublicClientApplication | null>(null);

  useEffect(() => {
    const msal = getMsalInstance();

    msal
      .initialize()
      .then(() => {
        const activeAccount = msal.getActiveAccount();
        if (!activeAccount) {
          const [firstAccount] = msal.getAllAccounts();
          if (firstAccount) {
            msal.setActiveAccount(firstAccount);
          }
        }

        setInstance(msal);
      })
      .catch((error) => {
        console.error("MSAL initialization failed", error);
      });
  }, []);

  if (!instance) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-white">
        <span className="text-sm text-white/70">Preparing secure session…</span>
      </div>
    );
  }

  return <MsalProvider instance={instance}>{children}</MsalProvider>;
}
