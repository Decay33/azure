import Image from "next/image";
import { Profile } from "../lib/types/profile";

type ProfileHeaderProps = {
  profile: Profile;
};

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <div className="relative z-20 flex flex-col items-center gap-4 text-center">
      {profile.avatarUrl ? (
        <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-white/40 shadow-2xl">
          <Image
            src={profile.avatarUrl}
            alt={`${profile.displayName} avatar`}
            fill
            priority
            sizes="112px"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white/20 bg-white/10 text-3xl font-bold uppercase text-white/70">
          {profile.username.slice(0, 2)}
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-lg md:text-4xl lg:text-5xl">
          {profile.displayName}
        </h1>
        {profile.bio ? (
          <p className="mt-2 max-w-xl text-base text-white/80 md:text-lg">{profile.bio}</p>
        ) : null}
      </div>
    </div>
  );
}
