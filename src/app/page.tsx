import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { Rocket, Zap, Users, BarChart3, Globe, Calendar, Sparkles, Mic, ArrowRight } from "lucide-react";

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-pink-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-linear-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg shadow-pink-500/25">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-linear-to-r from-pink-400 to-pink-600 bg-clip-text text-transparent">
                HackSquad
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              {user ? (
                <Link
                  href="/dashboard"
                  className="px-4 py-2 bg-linear-to-r from-pink-500 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-pink-500/25 transition-all"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 text-gray-300 hover:text-pink-400 font-medium transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-2 bg-linear-to-r from-pink-500 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-pink-500/25 transition-all"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background gradient effects */}
        <div className="absolute inset-0 bg-linear-to-b from-pink-500/10 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-64 h-64 bg-pink-600/10 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-pink-500/10 border border-pink-500/20 text-pink-400 rounded-full text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4 mr-2" />
              Powered by APE AI
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6">
              Just Talk About Your Business
              <span className="block bg-linear-to-r from-pink-400 via-pink-500 to-pink-600 bg-clip-text text-transparent">
                We'll Build Your Website
              </span>
            </h1>
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
              Use voice or text to describe your business. Our AI instantly creates a branded website
              with lead capture, booking, and CRM. Or paste your Instagram/website URL for even faster setup.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href={user ? "/create" : "/signup"}
                className="group px-8 py-4 bg-linear-to-r from-pink-500 to-pink-600 text-white rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-pink-500/25 transition-all flex items-center gap-2"
              >
                <Rocket className="w-5 h-5" />
                {user ? "Create Your Website" : "Get Started Free"}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              {!user && (
                <Link
                  href="/login"
                  className="px-8 py-4 bg-zinc-900 text-white rounded-xl font-bold text-lg hover:bg-zinc-800 transition-all border border-pink-500/20"
                >
                  Sign In
                </Link>
              )}
            </div>

            {/* Feature badges */}
            <div className="flex flex-wrap gap-4 justify-center mt-12 text-sm">
              <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900/50 border border-pink-500/10 rounded-full text-gray-300">
                <Mic className="w-4 h-4 text-pink-400" />
                Voice & Text Input
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900/50 border border-pink-500/10 rounded-full text-gray-300">
                <Globe className="w-4 h-4 text-pink-400" />
                URL Scraping
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900/50 border border-pink-500/10 rounded-full text-gray-300">
                <Sparkles className="w-4 h-4 text-pink-400" />
                AI-Powered
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-950 border-t border-pink-500/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything You Need to Launch
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Get a complete business presence online in minutes, not months.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Mic className="w-6 h-6" />}
              title="Voice-First Creation"
              description="Just talk about your business. Our AI understands and extracts everything needed—name, services, colors, and more."
            />
            <FeatureCard
              icon={<Globe className="w-6 h-6" />}
              title="Instant Website"
              description="Auto-generated branded website with your colors, logo, and content. SEO-optimized and mobile-ready."
            />
            <FeatureCard
              icon={<Users className="w-6 h-6" />}
              title="Lead Capture"
              description="Built-in contact forms that capture leads directly to your dashboard. Never miss a potential customer."
            />
            <FeatureCard
              icon={<Calendar className="w-6 h-6" />}
              title="Booking Integration"
              description="Connect your Calendly or Google Calendar. Let customers book calls directly from your site."
            />
            <FeatureCard
              icon={<BarChart3 className="w-6 h-6" />}
              title="Mini CRM"
              description="Track all your leads in one place. Update statuses, see contact history, and close more deals."
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              title="AI-Powered"
              description="Our AI analyzes your existing presence and generates compelling copy, headlines, and CTAs."
            />
            <FeatureCard
              icon={<Rocket className="w-6 h-6" />}
              title="Instant Deploy"
              description="Your site goes live immediately. Share your unique link and start collecting leads today."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-400">
              Three simple steps to your new business website
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number="1"
              title="Speak or Type"
              description="Describe your business with voice or text. Or paste your website/Instagram URL for instant extraction."
            />
            <StepCard
              number="2"
              title="AI Generates Everything"
              description="Our AI creates your website, extracts services, picks colors, and writes compelling copy."
            />
            <StepCard
              number="3"
              title="Launch"
              description="Your website goes live instantly. Start collecting leads and booking calls."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-r from-pink-600 via-pink-500 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="max-w-4xl mx-auto text-center relative">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Launch Your Business?
          </h2>
          <p className="text-xl text-pink-100 mb-8">
            Join hundreds of businesses already using HackSquad to grow online.
          </p>
          <Link
            href={user ? "/dashboard" : "/signup"}
            className="inline-flex items-center px-8 py-4 bg-black text-pink-400 rounded-xl font-bold text-lg hover:bg-zinc-900 hover:shadow-xl transition-all border border-pink-500/20"
          >
            <Rocket className="w-5 h-5 mr-2" />
            {user ? "Go to Dashboard" : "Get Started Free"}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-zinc-950 text-gray-400 border-t border-pink-500/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-8 h-8 bg-linear-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold">HackSquad</span>
          </div>
          <p className="text-sm">
            © 2026 HackSquad. Built with <span className="text-pink-500">❤️</span> for hackathons.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 bg-zinc-900/50 border border-pink-500/10 rounded-2xl hover:border-pink-500/30 hover:shadow-lg hover:shadow-pink-500/5 transition-all group">
      <div className="w-12 h-12 bg-linear-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-pink-500/25 transition-all">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-linear-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg shadow-pink-500/25">
        {number}
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}
