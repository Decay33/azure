import Link from "next/link";
import { BackgroundVideoWall } from "../components/background-video-wall";

const featureList = [
  {
    title: "Cinematic video backdrops",
    description: "Upload up to eight looping videos that pulse behind your buttons in full HD."
  },
  {
    title: "Premium link styling",
    description: "Gradient buttons, glow effects, and responsive layouts that look great on every device."
  },
  {
    title: "Stripe subscriptions",
    description: "Sell access to premium content with Stripe Billing and automatic customer portals."
  },
  {
    title: "Custom domains",
    description: "Route yoursociallinks.com/username or connect your own branded domains."
  }
];

const previewVideos = [
  "https://cdn.coverr.co/videos/coverr-delivery-day-4164/1080p.mp4",
  "https://cdn.coverr.co/videos/coverr-blue-paint-smoke-4066/1080p.mp4",
  "https://cdn.coverr.co/videos/coverr-porch-dropoff-5014/1080p.mp4",
  "https://cdn.coverr.co/videos/coverr-knock-knock-4788/1080p.mp4"
];

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center overflow-hidden bg-neutral-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.25),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(244,114,182,0.24),transparent_55%)]" />

      <section className="relative z-10 flex w-full max-w-6xl flex-col items-center gap-10 px-6 pb-32 pt-32 text-center md:px-12">
        <div className="mx-auto max-w-3xl space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm uppercase tracking-wider text-white/80 backdrop-blur-md">
            Link-in-bio, elevated
          </span>
          <h1 className="text-balance text-4xl font-bold leading-tight md:text-6xl">
            Bring your links to life with immersive video backgrounds.
          </h1>
          <p className="text-balance text-lg text-white/70 md:text-xl">
            YourSocialLinks lets creators build beautiful, branded landing pages with looping video walls,
            gradient buttons, and Stripe-powered memberships all in a few clicks.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/dashboard"
            className="group inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 px-8 py-3 text-base font-semibold text-white shadow-2xl transition-transform hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-200"
          >
            Get started - $8/mo
          </Link>
          <Link
            href="/.auth/login/aadb2c?post_login_redirect_uri=/dashboard"
            className="inline-flex items-center justify-center rounded-full border border-white/20 px-8 py-3 text-base font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
            prefetch={false}
          >
            Sign in with email
          </Link>
        </div>

        <div className="relative w-full max-w-5xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 p-1 shadow-[0_40px_120px_rgba(0,0,0,0.45)] backdrop-blur-lg">
          <div className="relative h-[420px] w-full overflow-hidden rounded-[2.3rem]">
            <BackgroundVideoWall videos={previewVideos} overlayOpacity={0.55} />
            <div className="relative z-10 flex h-full flex-col items-center justify-center gap-6 bg-gradient-to-b from-black/20 via-black/40 to-black/70 px-6 text-center">
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                yoursociallinks.com/yourname
              </h2>
              <p className="max-w-xl text-base text-white/75">
                Eight looping video columns, dynamic gradient link buttons, and custom branding that feels
                premium out of the box.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 w-full max-w-5xl px-6 pb-28 md:px-12">
        <header className="mb-12 text-center">
          <h2 className="text-3xl font-semibold md:text-4xl">Why creators switch to YourSocialLinks</h2>
          <p className="mt-4 text-lg text-white/70">
            Built for modern brands that want more than a list of boring buttons.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          {featureList.map((feature) => (
            <div
              key={feature.title}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition hover:border-white/30"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative space-y-3 text-left">
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-base text-white/70">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 w-full max-w-4xl px-6 pb-36 md:px-12">
        <div className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-10 text-center backdrop-blur-xl">
          <h2 className="text-3xl font-semibold md:text-4xl">Ready for launch?</h2>
          <p className="mt-4 text-lg text-white/70">
            Create your account, connect Stripe, drop in your videos, and share your new cinematic link hub in
            under 10 minutes.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-fuchsia-400 via-purple-500 to-indigo-500 px-8 py-3 text-base font-semibold text-white shadow-xl transition-transform hover:scale-[1.02]"
            >
              Start building now
            </Link>
            <Link
              href="mailto:support@yoursociallinks.com"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-8 py-3 text-base font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
            >
              Talk with a human
            </Link>
          </div>
        </div>
      </section>

      <footer className="relative z-10 w-full border-t border-white/10 py-8 text-center text-sm text-white/50">
        &copy; {new Date().getFullYear()} YourSocialLinks. All rights reserved.
      </footer>
    </main>
  );
}


