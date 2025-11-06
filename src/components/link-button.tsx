import Link from "next/link";
import { LINK_ACCENT_CLASSES } from "../lib/constants";
import { LinkItem } from "../lib/types/profile";
import { cn } from "../lib/utils";

type LinkButtonProps = {
  item: LinkItem;
  index: number;
};

export function LinkButton({ item, index }: LinkButtonProps) {
  const gradient = item.accent ? LINK_ACCENT_CLASSES[item.accent] : LINK_ACCENT_CLASSES.magenta;

  return (
    <Link
      href={item.url}
      className={cn(
        "group relative flex w-full items-center justify-between gap-4 overflow-hidden rounded-full px-6 py-4 text-lg font-semibold text-white shadow-2xl transition-transform hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
        "backdrop-blur-lg"
      )}
      target="_blank"
      rel="noreferrer"
    >
      <span className="relative z-10 flex items-center gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-base font-semibold">
          {index + 1}
        </span>
        {item.label}
      </span>
      <span className="relative z-10 text-sm font-medium text-white/80">Visit</span>
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-r opacity-90 transition-opacity duration-500 group-hover:opacity-100",
          gradient
        )}
      />
      <div className="absolute inset-0 opacity-0 mix-blend-screen blur-3xl transition-opacity duration-500 group-hover:opacity-40" />
    </Link>
  );
}
