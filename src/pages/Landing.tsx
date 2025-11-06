import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Link as LinkIcon, Video, Palette, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Landing() {
  const handleLogin = (provider: 'google' | 'aadb2c') => {
    const route = provider === 'aadb2c' ? 'aad' : provider;
    window.location.href = `/.auth/login/${route}?post_login_redirect_uri=/dashboard`;
  };

  return (
    <div className="min-h-screen animated-gradient">
      {/* Navigation */}
      <nav className="border-b border-white/10 glass">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold gradient-text">YourSocialLinks</div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => handleLogin('aadb2c')}>
              Sign In with Email
            </Button>
            <Button variant="gradient" onClick={() => handleLogin('google')}>
              Sign In with Google
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white">
            Your Links, <span className="gradient-text">One Place</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-2xl mx-auto">
            Share all your social profiles, content, and important links in one beautiful, mobile-friendly page.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" variant="gradient" onClick={() => handleLogin('aadb2c')}>
              Create Your YSL Page
            </Button>
            <Button size="lg" variant="glass" asChild>
              <a href="#features">Learn More</a>
            </Button>
          </div>
        </motion.div>

        {/* Example Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-20 max-w-md mx-auto"
        >
          <Card className="glass overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-pink-500" />
                <div>
                  <h3 className="font-bold text-xl text-white">@yourhandle</h3>
                  <p className="text-white/70">Your bio goes here</p>
                </div>
              </div>
              <div className="space-y-2">
                {['My Website', 'TikTok Shop', 'YouTube Channel'].map((label, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center font-semibold shadow-lg"
                  >
                    {label}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-12 text-white">Everything You Need</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: <LinkIcon className="w-8 h-8" />,
              title: 'Up to 25 Links',
              description: 'Share all your important links in one place',
            },
            {
              icon: <Video className="w-8 h-8" />,
              title: '8 Video Links',
              description: 'Showcase your TikTok, YouTube, and other videos',
            },
            {
              icon: <Palette className="w-8 h-8" />,
              title: 'Custom Themes',
              description: 'Personalize with colors and animated backgrounds',
            },
            {
              icon: <BarChart3 className="w-8 h-8" />,
              title: 'Analytics',
              description: 'Track views and engagement on your page',
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="glass h-full">
                <CardHeader>
                  <div className="text-purple-400 mb-2">{feature.icon}</div>
                  <CardTitle className="text-white">{feature.title}</CardTitle>
                  <CardDescription className="text-white/70">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-12 text-white">Simple Pricing</h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Free</CardTitle>
              <div className="text-4xl font-bold text-white">$0</div>
              <CardDescription className="text-white/70">Perfect to get started</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {['4 links', '3 video links', 'Basic themes', 'YSL branding'].map((feature, i) => (
                <div key={i} className="flex gap-2 items-center text-white/80">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>{feature}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="glass border-2 border-purple-500">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Creator</CardTitle>
              <div className="text-4xl font-bold text-white">$8<span className="text-xl">/mo</span></div>
              <CardDescription className="text-white/70">For serious creators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {['25 links', '8 video links', 'Custom themes', 'Analytics', 'No branding', 'Priority support'].map((feature, i) => (
                <div key={i} className="flex gap-2 items-center text-white/80">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>{feature}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl font-bold mb-6 text-white">Ready to Get Started?</h2>
        <p className="text-xl text-white/80 mb-8">Create your personalized link page in minutes</p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Button size="lg" variant="gradient" onClick={() => handleLogin('aadb2c')}>
            Create Your Page Now
          </Button>
          <Button size="lg" variant="ghost" onClick={() => handleLogin('google')}>
            Or Sign In with Google
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 glass">
        <div className="container mx-auto px-4 py-8 text-center text-white/60">
          <p>&copy; 2025 YourSocialLinks. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}


