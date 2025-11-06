type BackgroundVideoWallProps = {
  videos: string[];
  overlayOpacity?: number;
};

export function BackgroundVideoWall({ videos, overlayOpacity = 0.55 }: BackgroundVideoWallProps) {
  if (!videos.length) {
    return null;
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="grid h-full w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {videos.map((videoUrl, index) => (
          <div key={`${videoUrl}-${index}`} className="group relative overflow-hidden rounded-3xl border border-white/5 bg-black/40">
            <video
              className="h-full w-full object-cover transition-transform duration-[4000ms] group-hover:scale-105"
              src={videoUrl}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/60" />
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0 bg-black" style={{ opacity: overlayOpacity }} />
    </div>
  );
}
