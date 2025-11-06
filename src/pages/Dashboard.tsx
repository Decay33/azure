import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, GripVertical, ExternalLink, Crown, LogOut, Check, X } from 'lucide-react';
import { validateHandle } from '@/lib/utils';

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
  id: string;
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
  status: string;
}

interface Subscription {
  tier: 'free' | 'creator';
  status: 'active' | 'past_due' | 'canceled';
}

export default function Dashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<Subscription>({ tier: 'free', status: 'active' });
  const [loading, setLoading] = useState(true);
  
  // Handle claim state
  const [handleInput, setHandleInput] = useState('');
  const [handleError, setHandleError] = useState('');
  const [handleAvailable, setHandleAvailable] = useState<boolean | null>(null);
  
  // Link editing
  const [editingLinks, setEditingLinks] = useState<Link[]>([]);
  const [editingVideos, setEditingVideos] = useState<VideoLink[]>([]);
  
  // UI state
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (user) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user, authLoading]);

  async function fetchData() {
    setLoading(true);
    try {
      const [profileRes, subRes] = await Promise.all([
        fetch('/api/me'),
        fetch('/api/subscription-status'),
      ]);

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData);
        setEditingLinks(profileData.links || []);
        setEditingVideos(profileData.videoLinks || []);
      }

      if (subRes.ok) {
        const subData = await subRes.json();
        setSubscription(subData);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleLogin = (provider: 'google' | 'aad') => {
    window.location.href = `/.auth/login/${provider}?post_login_redirect_uri=/dashboard`;
  };

  async function checkHandleAvailability(handle: string) {
    const validation = validateHandle(handle);
    if (!validation.valid) {
      setHandleError(validation.error || '');
      setHandleAvailable(false);
      return;
    }

    try {
      const response = await fetch(`/api/check-handle/${handle}`);
      const data = await response.json();
      setHandleAvailable(data.available);
      setHandleError(data.available ? '' : 'Handle is already taken');
    } catch (error) {
      setHandleError('Failed to check availability');
    }
  }

  async function claimHandle() {
    if (!handleAvailable) return;

    try {
      const response = await fetch('/api/claimHandle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handle: handleInput,
          displayName: user?.userDetails || handleInput,
        }),
      });

      if (response.ok) {
        await fetchData();
      } else {
        const error = await response.json();
        setHandleError(error.message || 'Failed to claim handle');
      }
    } catch (error) {
      setHandleError('Failed to claim handle');
    }
  }

  async function saveProfile(updates: Partial<Profile>) {
    if (!profile) return;

    try {
      setSaveStatus('Saving...');
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updates, handle: profile.handle }),
      });

      if (response.ok) {
        setSaveStatus('Saved!');
        await fetchData();
        setTimeout(() => setSaveStatus(''), 2000);
      } else {
        setSaveStatus('Failed to save');
      }
    } catch (error) {
      setSaveStatus('Failed to save');
    }
  }

  async function saveLinks() {
    if (!profile) return;

    const maxLinks = subscription.tier === 'creator' ? 25 : 4;
    if (editingLinks.length > maxLinks) {
      alert(`You can only have ${maxLinks} links on the ${subscription.tier} plan`);
      return;
    }

    await saveProfile({ links: editingLinks });
  }

  async function saveVideoLinks() {
    if (!profile) return;

    const maxVideos = subscription.tier === 'creator' ? 8 : 3;
    if (editingVideos.length > maxVideos) {
      alert(`You can only have ${maxVideos} video links on the ${subscription.tier} plan`);
      return;
    }

    await saveProfile({ videoLinks: editingVideos });
  }

  function addLink() {
    const maxLinks = subscription.tier === 'creator' ? 25 : 4;
    if (editingLinks.length >= maxLinks) {
      alert(`Upgrade to Creator to add more than ${maxLinks} links`);
      return;
    }

    setEditingLinks([
      ...editingLinks,
      {
        id: `l_${Date.now()}`,
        label: '',
        url: '',
        icon: '',
        order: editingLinks.length,
      },
    ]);
  }

  function addVideoLink() {
    const maxVideos = subscription.tier === 'creator' ? 8 : 3;
    if (editingVideos.length >= maxVideos) {
      alert(`Upgrade to Creator to add more than ${maxVideos} video links`);
      return;
    }

    setEditingVideos([
      ...editingVideos,
      {
        id: `v_${Date.now()}`,
        platform: 'tiktok',
        url: '',
        thumb: '',
        order: editingVideos.length,
      },
    ]);
  }

  async function upgradeToCreator() {
    try {
      const response = await fetch('/api/stripe/createCheckoutSession', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: 'creator' }),
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.url;
      }
    } catch (error) {
      alert('Failed to start checkout');
    }
  }

  async function manageBilling() {
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.url;
      }
    } catch (error) {
      alert('Failed to open billing portal');
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen animated-gradient flex items-center justify-center">
        <div className="text-white text-xl">Loading your dashboard...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen animated-gradient flex items-center justify-center">
        <Card className="glass max-w-md w-full">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-white text-2xl">Sign in to continue</CardTitle>
            <CardDescription className="text-white/70">
              Create your page or sign in to manage your YourSocialLinks account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="gradient" className="w-full" onClick={() => handleLogin('google')}>
              Continue with Google
            </Button>
            <Button variant="glass" className="w-full" onClick={() => handleLogin('aad')}>
              Sign in with Email
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    // Handle claim flow
    return (
      <div className="min-h-screen animated-gradient">
        <div className="container max-w-2xl mx-auto px-4 py-12">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-white text-2xl">Claim Your Handle</CardTitle>
              <CardDescription className="text-white/70">
                Choose a unique handle for your YourSocialLinks page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="handle" className="text-white">Your Handle</Label>
                <div className="flex gap-2 mt-2">
                  <span className="flex items-center glass px-4 rounded-xl text-white/80">
                    yoursociallinks.com/
                  </span>
                  <Input
                    id="handle"
                    value={handleInput}
                    onChange={(e) => {
                      setHandleInput(e.target.value.toLowerCase());
                      setHandleAvailable(null);
                      setHandleError('');
                    }}
                    onBlur={() => handleInput && checkHandleAvailability(handleInput)}
                    placeholder="yourhandle"
                    className="flex-1"
                  />
                  {handleAvailable === true && <Check className="text-green-400 w-6 h-6" />}
                  {handleAvailable === false && <X className="text-red-400 w-6 h-6" />}
                </div>
                {handleError && <p className="text-red-400 text-sm mt-1">{handleError}</p>}
              </div>
              <Button
                onClick={claimHandle}
                disabled={!handleAvailable}
                className="w-full"
                variant="gradient"
              >
                Claim Handle
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const maxLinks = subscription.tier === 'creator' ? 25 : 4;
  const maxVideos = subscription.tier === 'creator' ? 8 : 3;

  return (
    <div className="min-h-screen animated-gradient">
      {/* Header */}
      <div className="border-b border-white/10 glass">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold gradient-text">YourSocialLinks</div>
          <div className="flex gap-3 items-center">
            <a
              href={`/${profile.handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/80 hover:text-white flex items-center gap-2"
            >
              View Page <ExternalLink className="w-4 h-4" />
            </a>
            <Button variant="ghost" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 py-8">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="glass">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="links">Links ({editingLinks.length}/{maxLinks})</TabsTrigger>
            <TabsTrigger value="videos">Videos ({editingVideos.length}/{maxVideos})</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-white">Profile Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-white">Your URL</Label>
                  <Input
                    value={`yoursociallinks.com/${profile.handle}`}
                    readOnly
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-white">Display Name</Label>
                  <Input
                    value={profile.displayName}
                    onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-white">Bio</Label>
                  <Input
                    value={profile.bio || ''}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="Tell people about yourself"
                    className="mt-2"
                  />
                </div>
                <Button onClick={() => saveProfile({ displayName: profile.displayName, bio: profile.bio })} variant="gradient">
                  Save Profile
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Links Tab */}
          <TabsContent value="links" className="space-y-4">
            <Card className="glass">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-white">Your Links</CardTitle>
                    <CardDescription className="text-white/70">
                      {editingLinks.length}/{maxLinks} links used
                    </CardDescription>
                  </div>
                  <Button onClick={addLink} variant="gradient" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Link
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {editingLinks.map((link, index) => (
                  <div key={link.id} className="flex gap-2 items-start glass p-4 rounded-xl">
                    <GripVertical className="text-white/50 w-5 h-5 mt-2" />
                    <div className="flex-1 space-y-2">
                      <Input
                        value={link.label}
                        onChange={(e) => {
                          const updated = [...editingLinks];
                          updated[index].label = e.target.value;
                          setEditingLinks(updated);
                        }}
                        placeholder="Link Label"
                      />
                      <Input
                        value={link.url}
                        onChange={(e) => {
                          const updated = [...editingLinks];
                          updated[index].url = e.target.value;
                          setEditingLinks(updated);
                        }}
                        placeholder="https://..."
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingLinks(editingLinks.filter((_, i) => i !== index))}
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                ))}
                <Button onClick={saveLinks} variant="gradient" className="w-full">
                  {saveStatus || 'Save Links'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Video Links Tab */}
          <TabsContent value="videos" className="space-y-4">
            <Card className="glass">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-white">Video Links</CardTitle>
                    <CardDescription className="text-white/70">
                      {editingVideos.length}/{maxVideos} video links used
                    </CardDescription>
                  </div>
                  <Button onClick={addVideoLink} variant="gradient" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Video
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {editingVideos.map((video, index) => (
                  <div key={video.id} className="flex gap-2 items-start glass p-4 rounded-xl">
                    <div className="flex-1 space-y-2">
                      <select
                        value={video.platform}
                        onChange={(e) => {
                          const updated = [...editingVideos];
                          updated[index].platform = e.target.value;
                          setEditingVideos(updated);
                        }}
                        className="w-full h-11 rounded-xl border border-input bg-background/50 px-4 text-sm"
                      >
                        <option value="tiktok">TikTok</option>
                        <option value="youtube">YouTube</option>
                        <option value="other">Other</option>
                      </select>
                      <Input
                        value={video.url}
                        onChange={(e) => {
                          const updated = [...editingVideos];
                          updated[index].url = e.target.value;
                          setEditingVideos(updated);
                        }}
                        placeholder="https://..."
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingVideos(editingVideos.filter((_, i) => i !== index))}
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                ))}
                <Button onClick={saveVideoLinks} variant="gradient" className="w-full">
                  {saveStatus || 'Save Video Links'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className={`glass ${subscription.tier === 'free' ? 'border-2 border-white/20' : ''}`}>
                <CardHeader>
                  <CardTitle className="text-white">Free</CardTitle>
                  <div className="text-3xl font-bold text-white">$0</div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-white/80 space-y-2">
                    <div>✓ 4 links</div>
                    <div>✓ 3 video links</div>
                    <div>✓ Basic themes</div>
                    <div>✓ YSL branding</div>
                  </div>
                  {subscription.tier === 'free' && (
                    <div className="text-green-400 font-semibold">Current Plan</div>
                  )}
                </CardContent>
              </Card>

              <Card className={`glass ${subscription.tier === 'creator' ? 'border-2 border-purple-500' : ''}`}>
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-400" />
                    Creator
                  </CardTitle>
                  <div className="text-3xl font-bold text-white">$8<span className="text-xl">/mo</span></div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-white/80 space-y-2">
                    <div>✓ 25 links</div>
                    <div>✓ 8 video links</div>
                    <div>✓ Custom themes</div>
                    <div>✓ Analytics</div>
                    <div>✓ No branding</div>
                  </div>
                  {subscription.tier === 'creator' ? (
                    <Button onClick={manageBilling} variant="outline" className="w-full">
                      Manage Billing
                    </Button>
                  ) : (
                    <Button onClick={upgradeToCreator} variant="gradient" className="w-full">
                      Upgrade Now
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}


