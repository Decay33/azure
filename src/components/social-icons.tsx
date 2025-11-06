import type { ReactElement } from "react";

const ICONS: Record<string, ReactElement> = {
  tiktok: (
    <svg viewBox="0 0 32 32" aria-hidden="true" className="h-6 w-6">
      <path
        d="M21.333 6.667c1.24 1.217 2.867 2.033 4.667 2.233v4.32c-1.76-.046-3.413-.546-4.667-1.377v8.224c0 4.413-3.587 8-8 8s-8-3.587-8-8 3.586-8 8-8c.227 0 .453.013.677.033v4.36a4 4 0 10.677 2.32v-14.78h6.646v2.667z"
        fill="currentColor"
      />
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 32 32" aria-hidden="true" className="h-6 w-6">
      <path
        d="M28.648 9.33A3.5 3.5 0 0026.19 7.9c-2.066-.55-10.19-.55-10.19-.55s-8.124 0-10.19.55A3.5 3.5 0 003.353 9.33C2.8 11.4 2.8 16 2.8 16s0 4.6.553 6.67a3.5 3.5 0 002.458 1.43c2.066.55 10.19.55 10.19.55s8.124 0 10.19-.55a3.5 3.5 0 002.458-1.43C29.2 20.6 29.2 16 29.2 16s0-4.6-.552-6.67zM13.6 20V12l6.667 4L13.6 20z"
        fill="currentColor"
      />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 32 32" aria-hidden="true" className="h-6 w-6">
      <path
        d="M23 4H9C6.239 4 4 6.239 4 9v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5V9c0-2.761-2.239-5-5-5zm3 19c0 1.654-1.346 3-3 3H9c-1.654 0-3-1.346-3-3V9c0-1.654 1.346-3 3-3h14c1.654 0 3 1.346 3 3v14z"
        fill="currentColor"
      />
      <path
        d="M16 10a6 6 0 106 6 6.006 6.006 0 00-6-6zm0 10a4 4 0 114-4 4.005 4.005 0 01-4 4z"
        fill="currentColor"
      />
      <circle cx="23" cy="9" r="1.5" fill="currentColor" />
    </svg>
  )
};

type SocialIconsProps = {
  social?: Record<string, string>;
};

export function SocialIcons({ social }: SocialIconsProps) {
  if (!social) {
    return null;
  }

  const entries = Object.entries(social).filter(([, value]) => Boolean(value));

  if (!entries.length) {
    return null;
  }

  return (
    <div className="relative z-20 mt-6 flex items-center justify-center gap-3 text-white/80">
      {entries.map(([key, url]) => (
        <a
          key={key}
          href={url}
          target="_blank"
          rel="noreferrer"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:text-white"
        >
          {ICONS[key.toLowerCase()] ?? <span className="text-sm font-semibold uppercase">{key.slice(0, 2)}</span>}
        </a>
      ))}
    </div>
  );
}
