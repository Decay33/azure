'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMsal } from "@azure/msal-react";
import { consumePostLoginRedirect } from "@/lib/auth-client";

export default function AuthCallbackPage() {
  const { instance } = useMsal();
  const router = useRouter();
  const [message, setMessage] = useState("Completing sign-in…");

  useEffect(() => {
    let isMounted = true;

    instance
      .handleRedirectPromise()
      .then((result) => {
        if (!isMounted) {
          return;
        }

        if (result?.account) {
          instance.setActiveAccount(result.account);
        }

        const redirectTarget = consumePostLoginRedirect() ?? "/dashboard";
        setMessage("Redirecting to your dashboard…");
        router.replace(redirectTarget);
      })
      .catch((error) => {
        console.error("Auth callback error", error);
        setMessage("We could not complete sign-in. Please close this window and try again.");
      });

    return () => {
      isMounted = false;
    };
  }, [instance, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 text-white">
      <div className="rounded-3xl border border-white/10 bg-white/5 px-8 py-6 text-center shadow-xl backdrop-blur-lg">
        <p className="text-base text-white/80">{message}</p>
      </div>
    </main>
  );
}
