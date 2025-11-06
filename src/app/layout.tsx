import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://yoursociallinks.com"),
  title: {
    default: "YourSocialLinks",
    template: "%s | YourSocialLinks"
  },
  description:
    "Build a cinematic link-in-bio in minutes. YourSocialLinks makes your links feel alive with looping video backdrops and premium themes.",
  openGraph: {
    title: "YourSocialLinks",
    description:
      "Launch a cinematic link-in-bio with background video loops, Stripe billing, and customizable themes.",
    url: "https://yoursociallinks.com",
    siteName: "YourSocialLinks",
    type: "website",
    images: [
      {
        url: "https://yoursociallinks.com/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "YourSocialLinks preview"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "YourSocialLinks",
    description:
      "Create stunning bio link hubs with looping video backgrounds and premium styling.",
    images: ["https://yoursociallinks.com/og-default.jpg"]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-neutral-950 text-white">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-neutral-950 text-white`}
      >
        {children}
      </body>
    </html>
  );
}
