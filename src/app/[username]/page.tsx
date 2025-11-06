import { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchProfile } from "../../lib/api";
import { BackgroundVideoWall } from "../../components/background-video-wall";
import { ProfileHeader } from "../../components/profile-header";
import { SocialIcons } from "../../components/social-icons";
import { LinkButton } from "../../components/link-button";
import { Profile } from "../../lib/types/profile";

type ProfilePageProps = {
  params: {
    username: string;
  };
};

export const revalidate = 60;

const buildMetadata = (profile: Profile): Metadata => ({
  title: `${profile.displayName} on YourSocialLinks`,
  description: profile.bio ?? `Explore the curated links from ${profile.displayName}.`,
  openGraph: {
    title: `${profile.displayName} | YourSocialLinks`,
    description: profile.bio ?? "Discover new content and offers.",
    url: `https://yoursociallinks.com/${profile.username}`,
    images: profile.avatarUrl
      ? [
          {
            url: profile.avatarUrl,
            width: 512,
            height: 512,
            alt: `${profile.displayName} avatar`
          }
        ]
      : undefined
  }
});

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username } = params;
  const profile = await fetchProfile(username);

  if (!profile) {
    return {
      title: "Profile not found",
      description: "The profile you are looking for does not exist."
    };
  }

  return buildMetadata(profile);
}

const renderLinks = (links: Profile["links"]) => {
  if (!links.length) {
    return (
      <p className="relative z-20 mt-10 rounded-3xl border border-white/10 bg-white/5 px-6 py-10 text-center text-white/70 backdrop-blur-lg">
        No links have been published yet. Check back soon.
      </p>
    );
  }

  return (
    <div className="relative z-20 mt-10 flex w-full max-w-2xl flex-col gap-4">
      {links.map((link, index) => (
        <LinkButton key={link.id} item={link} index={index} />
      ))}
    </div>
  );
};

const renderBackground = (profile: Profile) => {
  if (profile.theme.backgroundStyle !== "video" || !profile.theme.backgroundVideos.length) {
    return null;
  }

  return <BackgroundVideoWall videos={profile.theme.backgroundVideos} overlayOpacity={profile.theme.overlayOpacity} />;
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = params;
  const profile = await fetchProfile(username);

  if (!profile) {
    notFound();
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-neutral-950 text-white">
      {renderBackground(profile)}
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center px-6 pb-24 pt-24 text-center">
        <ProfileHeader profile={profile} />
        <SocialIcons social={profile.social} />
        {renderLinks(profile.links)}
      </div>
    </div>
  );
}
