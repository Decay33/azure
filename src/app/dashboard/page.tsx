"use client";

import { useEffect } from "react";

export default function DashboardPage() {
  useEffect(() => {
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/.auth")) {
      fetch("/.auth/me")
        .then((response) => response.json())
        .then((payload) => {
          const clientPrincipal = payload?.clientPrincipal;

          if (!clientPrincipal) {
            window.location.href = "/.auth/login/aadb2c?post_login_redirect_uri=/dashboard";
          }
        })
        .catch(() => {
          window.location.href = "/.auth/login/aadb2c?post_login_redirect_uri=/dashboard";
        });
    }
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neutral-950 px-6 text-center text-white">
      <h1 className="text-3xl font-semibold md:text-4xl">Creator dashboard is under construction</h1>
      <p className="max-w-lg text-base text-white/70">
        You&apos;re signed in via Azure AD B2C. We&apos;ll add link management, video uploads, and plan details in the
        upcoming stages.
      </p>
    </main>
  );
}
