import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Link {
  id: string;
  label: string;
  url: string;
  icon?: string;
  order: number;
}

interface VideoLink {
  id: string;
  platform: string;
  url: string;
  thumb?: string;
  order: number;
}

interface Profile {
  handle: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  theme: {
    style: string;
    accent: string;
  };
  links: Link[];
  videoLinks: VideoLink[];
}

export default function PublicProfile() {
  const { handle } = useParams<{ handle: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (handle) {
      fetchProfile();
      trackView();
    }
  }, [handle]);

  async function fetchProfile() {
    try {
      const response = await fetch(`/api/profile/${handle}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      } else if (response.status === 404) {
        setError('Profile not found');
      } else {
        setError('Failed to load profile');
      }
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }

  async function trackView() {
    try {
      await fetch('/api/trackView', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle }),
      });
    } catch (err) {
      // Silent fail
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen animated-gradient flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen animated-gradient flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Profile Not Found</h1>
          <p className="text-white/80">This page doesn't exist or has been deactivated.</p>
        </div>
      </div>
    );
  }

  const backgroundStyle = profile.theme.style === 'stripes' 
    ? { background: `repeating-linear-gradient(45deg, ${profile.theme.accent}20, ${profile.theme.accent}20 10px, transparent 10px, transparent 20px), linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #4facfe)`, backgroundSize: '400% 400%' }
    : { background: 'linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #4facfe)', backgroundSize: '400% 400%' };

  return (
    <div className="min-h-screen animated-gradient" style={backgroundStyle}>
      <div className="container max-w-2xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Profile Header */}
          <div className="text-center">
            {profile.avatarUrl && (
              <motion.img
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                src={profile.avatarUrl}
                alt={profile.displayName}
                className="w-24 h-24 md:w-32 md:h-32 rounded-full mx-auto mb-4 border-4 border-white shadow-2xl object-cover"
              />
            )}
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {profile.displayName}
            </h1>
            {profile.bio && (
              <p className="text-white/80 text-lg max-w-md mx-auto">
                {profile.bio}
              </p>
            )}
          </div>

          {/* Video Links */}
          {profile.videoLinks && profile.videoLinks.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              {profile.videoLinks.map((video, index) => (
                <motion.a
                  key={video.id}
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="block p-4 rounded-2xl glass glass-hover shadow-lg text-white font-semibold flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    {video.thumb && (
                      <img 
                        src={video.thumb} 
                        alt="" 
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                    <span>
                      {video.platform === 'tiktok' && '🎵 TikTok Video'}
                      {video.platform === 'youtube' && '▶️ YouTube Video'}
                      {video.platform === 'other' && '🎬 Video'}
                    </span>
                  </div>
                  <ExternalLink className="w-5 h-5" />
                </motion.a>
              ))}
            </motion.div>
          )}

          {/* Links */}
          {profile.links && profile.links.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              {profile.links.map((link, index) => (
                <motion.a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * (profile.videoLinks.length + index) }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="block p-5 rounded-2xl shadow-lg text-white text-center font-semibold flex items-center justify-center gap-3"
                  style={{
                    background: `linear-gradient(135deg, ${profile.theme.accent} 0%, ${profile.theme.accent}dd 100%)`
                  }}
                >
                  {link.icon && <span className="text-2xl">{link.icon}</span>}
                  <span>{link.label}</span>
                </motion.a>
              ))}
            </motion.div>
          )}

          {/* Footer branding */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center pt-8"
          >
            <a
              href="/"
              className="text-white/60 hover:text-white text-sm transition-colors inline-flex items-center gap-2"
            >
              Create your own with <span className="font-semibold">YourSocialLinks</span>
            </a>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}


