"use client";

import { ChangeEvent, Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { AuthButtons } from "../../components/auth-buttons";
import { setPostLoginRedirect } from "../../lib/auth-client";
import { callAuthorizedApi } from "../../lib/protected-fetch";
import { LINK_ACCENT_CLASSES, MAX_BACKGROUND_VIDEOS, MAX_LINKS } from "../../lib/constants";
import type { LinkAccent, LinkItem, Profile } from "../../lib/types/profile";

type UploadResponse = {
  uploadUrl: string;
  blobUrl: string;
  expiresInMinutes: number;
  headers?: Record<string, string>;
};

const accentOptions = Object.keys(LINK_ACCENT_CLASSES) as LinkAccent[];

const emptyLink = (): LinkItem => ({
  id: crypto.randomUUID(),
  label: "",
  url: "",
  accent: "magenta"
});

export default function DashboardPage() {
  const { instance } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [linksSaving, setLinksSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setPostLoginRedirect("/dashboard");
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    callAuthorizedApi<Profile>(instance, "/api/profile")
      .then((data) => {
        if (cancelled) {
          return;
        }
        setProfile(data);
        setLinks(data.links ?? []);
      })
      .catch((err) => {
        if (cancelled) {
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to load profile");
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [instance, isAuthenticated]);

  const updateProfile = useCallback(
    (updater: (current: Profile) => Profile) => {
      setProfile((prev) => {
        if (!prev) {
          return prev;
        }
        return updater(prev);
      });
    },
    [setProfile]
  );

  const updateThemeVideos = useCallback(
    (videos: string[]) => {
      updateProfile((current) => ({
        ...current,
        theme: {
          ...current.theme,
          backgroundVideos: videos.slice(0, MAX_BACKGROUND_VIDEOS)
        }
      }));
    },
    [updateProfile]
  );

  const handleProfileFieldChange = (field: keyof Profile) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value;
    updateProfile((current) => ({
      ...current,
      [field]: value
    }));
  };

  const handleBackgroundInputChange = (index: number, value: string) => {
    if (!profile) {
      return;
    }
    const videos = [...(profile.theme.backgroundVideos ?? [])];
    videos[index] = value;
    updateThemeVideos(videos);
  };

  const addBackgroundSlot = () => {
    if (!profile) {
      return;
    }
    const videos = profile.theme.backgroundVideos ?? [];
    if (videos.length >= MAX_BACKGROUND_VIDEOS) {
      setMessage(`You can only store ${MAX_BACKGROUND_VIDEOS} background videos.`);
      return;
    }
    updateThemeVideos([...videos, ""]);
  };

  const removeBackgroundAt = (index: number) => {
    if (!profile) {
      return;
    }
    const videos = [...(profile.theme.backgroundVideos ?? [])];
    videos.splice(index, 1);
    updateThemeVideos(videos);
  };

  const handleProfileSave = async () => {
    if (!profile) {
      return;
    }

    setProfileSaving(true);
    setMessage(null);
    setError(null);

    try {
      const payload = {
        displayName: profile.displayName,
        bio: profile.bio,
        username: profile.username,
        backdrops: profile.theme.backgroundVideos ?? [],
        theme: {
          backgroundStyle: profile.theme.backgroundStyle,
          overlayOpacity: profile.theme.overlayOpacity,
          gradientFrom: profile.theme.gradientFrom,
          gradientTo: profile.theme.gradientTo
        }
      };

      const updated = await callAuthorizedApi<Profile>(instance, "/api/profile", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      setProfile(updated);
      setLinks(updated.links ?? links);
      setMessage("Profile saved successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleLinkChange = (index: number, field: keyof LinkItem, value: string) => {
    setLinks((current) => {
      const clone = [...current];
      clone[index] = {
        ...clone[index],
        [field]: field === "accent" ? (value as LinkAccent) : value
      };
      return clone;
    });
  };

  const addLink = () => {
    setLinks((current) => {
      if (current.length >= MAX_LINKS) {
        setMessage(`You can only publish up to ${MAX_LINKS} links.`);
        return current;
      }

      return [...current, emptyLink()];
    });
  };

  const removeLink = (index: number) => {
    setLinks((current) => {
      const clone = [...current];
      clone.splice(index, 1);
      return clone;
    });
  };

  const handleLinksSave = async () => {
    setLinksSaving(true);
    setError(null);
    setMessage(null);

    try {
      const trimmed = links
        .map((link) => ({
          ...link,
          label: link.label.trim(),
          url: link.url.trim()
        }))
        .filter((link) => link.label.length > 0 && link.url.length > 0);

      const response = await callAuthorizedApi<{ links: LinkItem[] }>(instance, "/api/links", {
        method: "POST",
        body: JSON.stringify(trimmed)
      });

      setLinks(response.links);
      setMessage("Links updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save links.");
    } finally {
      setLinksSaving(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploading(true);
    setError(null);
    setMessage(null);

    try {
    const response = await callAuthorizedApi<UploadResponse>(instance, "/api/videos/sign-upload", {
      method: "POST",
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type || "video/mp4"
      })
    });

      const headers = {
        "x-ms-blob-type": "BlockBlob",
        "Content-Type": file.type || "video/mp4",
        ...(response.headers ?? {})
      };

      const uploadResult = await fetch(response.uploadUrl, {
        method: "PUT",
        headers,
        body: file
      });

      if (!uploadResult.ok) {
        throw new Error(`Upload failed with status ${uploadResult.status}`);
      }

      updateThemeVideos([...(profile?.theme.backgroundVideos ?? []), response.blobUrl]);
      setMessage("Video uploaded. Save your profile to publish the background.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const hasProfile = Boolean(profile);
  const backgroundVideos = profile?.theme.backgroundVideos ?? [];

  const statusMessage = useMemo(() => {
    if (error) {
      return { tone: "error" as const, text: error };
    }
    if (message) {
      return { tone: "info" as const, text: message };
    }
    return null;
  }, [error, message]);

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 px-6 text-center text-white">
        <div className="max-w-md space-y-6 rounded-3xl border border-white/10 bg-white/5 p-10 shadow-xl backdrop-blur-lg">
          <h1 className="text-3xl font-semibold">Sign in to build your link hub</h1>
          <p className="text-base text-white/70">
            Create an account or sign back in to manage your profile, links, and cinematic backgrounds.
          </p>
          <div className="flex justify-center">
            <AuthButtons />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-16 text-white md:px-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <header className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-semibold md:text-4xl">Creator Dashboard</h1>
            <p className="mt-2 text-sm text-white/60">
              Update your profile, upload background videos, and curate up to {MAX_LINKS} premium links.
            </p>
          </div>
          <AuthButtons />
        </header>

        {statusMessage ? (
          <div
            className={`rounded-2xl border px-6 py-4 text-sm backdrop-blur-md ${
              statusMessage.tone === "error"
                ? "border-red-400/40 bg-red-500/10 text-red-100"
                : "border-emerald-400/40 bg-emerald-500/10 text-emerald-50"
            }`}
          >
            {statusMessage.text}
          </div>
        ) : null}

        {isLoading || !hasProfile ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 px-8 py-12 text-center text-white/70 backdrop-blur-lg">
            {isLoading ? "Loading your creator profile…" : "No profile data yet. Start by saving your first details."}
          </div>
        ) : (
          <Fragment>
            <section className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-lg">
              <header className="mb-6">
                <h2 className="text-2xl font-semibold">Profile details</h2>
                <p className="mt-2 text-sm text-white/70">
                  This information powers your public page at yoursociallinks.com/{profile?.username ?? "yourname"}.
                </p>
              </header>
              <div className="grid gap-6 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm">
                  <span className="text-white/70">Display name</span>
                  <input
                    type="text"
                    value={profile?.displayName ?? ""}
                    onChange={handleProfileFieldChange("displayName")}
                    className="rounded-2xl border border-white/20 bg-black/20 px-4 py-3 text-white shadow-inner focus:border-white/50 focus:outline-none"
                    placeholder="Blue Crew"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm">
                  <span className="text-white/70">Username</span>
                  <input
                    type="text"
                    value={profile?.username ?? ""}
                    onChange={handleProfileFieldChange("username")}
                    className="rounded-2xl border border-white/20 bg-black/20 px-4 py-3 text-white shadow-inner focus:border-white/50 focus:outline-none"
                    placeholder="yourhandle"
                  />
                </label>
              </div>
              <label className="mt-6 flex flex-col gap-2 text-sm">
                <span className="text-white/70">Bio</span>
                <textarea
                  value={profile?.bio ?? ""}
                  onChange={handleProfileFieldChange("bio")}
                  rows={4}
                  className="rounded-2xl border border-white/20 bg-black/20 px-4 py-3 text-white shadow-inner focus:border-white/50 focus:outline-none"
                  placeholder="Tell visitors what to expect when they land on your cinematic link hub."
                />
              </label>

              <div className="mt-8 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleProfileSave}
                  disabled={profileSaving}
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-fuchsia-400 via-purple-500 to-indigo-500 px-6 py-2 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.02] disabled:cursor-wait disabled:opacity-60"
                >
                  {profileSaving ? "Saving…" : "Save profile"}
                </button>
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-lg">
              <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">Background videos</h2>
                  <p className="text-sm text-white/70">
                    Looping videos that play behind your buttons. Upload MP4 clips up to {MAX_BACKGROUND_VIDEOS} per page.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={addBackgroundSlot}
                    className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 transition hover:border-white/40 hover:text-white"
                  >
                    Add link slot
                  </button>
                  <button
                    type="button"
                    onClick={handleUploadClick}
                    disabled={uploading || (backgroundVideos.length >= MAX_BACKGROUND_VIDEOS && !uploading)}
                    className="rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.02] disabled:cursor-wait disabled:opacity-60"
                  >
                    {uploading ? "Uploading…" : "Upload MP4"}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/mp4"
                    className="hidden"
                    onChange={handleFileSelected}
                  />
                </div>
              </header>

              <div className="flex flex-col gap-4">
                {backgroundVideos.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/20 px-4 py-6 text-center text-white/60">
                    Drop in your first looping clip to see it behind your buttons.
                  </div>
                ) : (
                  backgroundVideos.map((video, index) => (
                    <div
                      key={`${video}-${index}`}
                      className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 sm:flex-row sm:items-center"
                    >
                      <div className="flex-1">
                        <label className="flex flex-col gap-2 text-xs uppercase tracking-wide text-white/40">
                          Video URL
                          <input
                            type="url"
                            value={video}
                            onChange={(event) => handleBackgroundInputChange(index, event.target.value)}
                            className="rounded-xl border border-white/20 bg-black/30 px-4 py-2 text-sm text-white focus:border-white/40 focus:outline-none"
                          />
                        </label>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeBackgroundAt(index)}
                        className="self-start rounded-full border border-red-400/40 px-4 py-2 text-xs font-semibold text-red-200 transition hover:border-red-300 hover:text-red-50"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>

              <p className="mt-4 text-xs text-white/50">
                Upload MP4 files up to ~50MB for best results. Videos are stored privately until referenced on your public
                profile.
              </p>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-lg">
              <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">Links</h2>
                  <p className="text-sm text-white/70">Curate up to {MAX_LINKS} buttons with custom gradients.</p>
                </div>
                <button
                  type="button"
                  onClick={addLink}
                  className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 transition hover:border-white/40 hover:text-white"
                >
                  Add link
                </button>
              </header>

              <div className="flex flex-col gap-4">
                {links.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/20 px-4 py-6 text-center text-white/60">
                    Add your first link to preview gradients and styling.
                  </div>
                ) : (
                  links.map((link, index) => (
                    <div key={link.id ?? index} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="flex flex-col gap-2 text-xs uppercase tracking-wide text-white/40">
                          Label
                          <input
                            type="text"
                            value={link.label}
                            onChange={(event) => handleLinkChange(index, "label", event.target.value)}
                            className="rounded-xl border border-white/20 bg-black/30 px-4 py-2 text-sm text-white focus:border-white/40 focus:outline-none"
                            placeholder="Follow on TikTok"
                          />
                        </label>
                        <label className="flex flex-col gap-2 text-xs uppercase tracking-wide text-white/40">
                          URL
                          <input
                            type="url"
                            value={link.url}
                            onChange={(event) => handleLinkChange(index, "url", event.target.value)}
                            className="rounded-xl border border-white/20 bg-black/30 px-4 py-2 text-sm text-white focus:border-white/40 focus:outline-none"
                            placeholder="https://"
                          />
                        </label>
                      </div>
                      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <label className="flex items-center gap-3 text-xs uppercase tracking-wide text-white/40">
                          Accent
                          <select
                            value={link.accent ?? "magenta"}
                            onChange={(event) => handleLinkChange(index, "accent", event.target.value)}
                            className="rounded-full border border-white/20 bg-black/30 px-4 py-2 text-sm text-white focus:border-white/40 focus:outline-none"
                          >
                            {accentOptions.map((accent) => (
                              <option key={accent} value={accent}>
                                {accent}
                              </option>
                            ))}
                          </select>
                        </label>
                        <button
                          type="button"
                          onClick={() => removeLink(index)}
                          className="self-start rounded-full border border-red-400/40 px-4 py-2 text-xs font-semibold text-red-200 transition hover:border-red-300 hover:text-red-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-6 flex items-center justify-end">
                <button
                  type="button"
                  onClick={handleLinksSave}
                  disabled={linksSaving}
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 px-6 py-2 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.02] disabled:cursor-wait disabled:opacity-60"
                >
                  {linksSaving ? "Saving…" : "Save links"}
                </button>
              </div>
            </section>
          </Fragment>
        )}
      </div>
    </main>
  );
}
