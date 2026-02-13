"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { Rocket, Globe, Share2, X, ExternalLink, BarChart, Copy, Check } from "lucide-react";
import { Button } from "./ui";

interface WebsiteLaunchCelebrationProps {
  businessName: string;
  siteSlug: string;
  primaryColor?: string;
}

export function WebsiteLaunchCelebration({ 
  businessName, 
  siteSlug,
  primaryColor = "#ec4899" 
}: WebsiteLaunchCelebrationProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isNew = searchParams.get('new') === 'true';
  
  const [isVisible, setIsVisible] = useState(isNew);
  const [copied, setCopied] = useState(false);
  const [siteUrl, setSiteUrl] = useState('');

  useEffect(() => {
    // Set site URL on client side only
    if (typeof window !== 'undefined') {
      setSiteUrl(`${window.location.origin}/sites/${siteSlug}`);
    }
  }, [siteSlug]);

  useEffect(() => {
    if (!isNew) return;

    // Trigger confetti animation
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#ec4899', '#f472b6', '#db2777', '#fbbf24', '#f59e0b'],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#ec4899', '#f472b6', '#db2777', '#fbbf24', '#f59e0b'],
      });
    }, 250);

    return () => clearInterval(interval);
  }, [isNew]);

  const handleCopyUrl = async () => {
    if (!siteUrl) return;
    try {
      await navigator.clipboard.writeText(siteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async () => {
    if (!siteUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${businessName} - Website`,
          text: `Check out my new website!`,
          url: siteUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      handleCopyUrl();
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    // Remove the ?new=true from URL without refresh
    router.replace(`/sites/${siteSlug}`, { scroll: false });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative max-w-2xl w-full bg-gradient-to-br from-zinc-900 to-black border-2 border-pink-500/30 rounded-3xl shadow-2xl shadow-pink-500/20 p-6 sm:p-12 animate-in zoom-in duration-500 max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10 touch-manipulation z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div 
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center shadow-lg animate-bounce"
              style={{ 
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`,
                boxShadow: `0 10px 40px ${primaryColor}80`
              }}
            >
              <Rocket className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-2xl">🎉</span>
            </div>
          </div>
        </div>

        {/* Headline */}
        <h2 className="text-2xl sm:text-4xl font-bold text-center text-white mb-4">
          🎊 Your Website is Live! 🎊
        </h2>
        
        <p className="text-center text-gray-300 text-base sm:text-lg mb-8">
          <span className="text-pink-400 font-semibold">{businessName}</span> is now online and ready to capture leads!
        </p>

        {/* URL Display */}
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-3 sm:p-4 mb-6 flex items-center gap-3">
          <Globe className="w-5 h-5 text-pink-400 flex-shrink-0" />
          <code className="flex-1 text-xs sm:text-sm text-gray-300 break-all">{siteUrl}</code>
          <button
            onClick={handleCopyUrl}
            className="flex-shrink-0 p-2 hover:bg-zinc-700 rounded-lg transition-colors touch-manipulation"
            aria-label="Copy URL"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4 text-gray-400" />
            )}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          <Button
            onClick={handleShare}
            className="!bg-pink-500 hover:!bg-pink-600 !text-white flex items-center justify-center gap-2 !min-h-[48px] sm:!min-h-[56px]"
          >
            <Share2 className="w-4 h-4" />
            <span className="text-sm sm:text-base">Share Your Site</span>
          </Button>
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl transition-all min-h-[48px] sm:min-h-[56px] touch-manipulation"
          >
            <BarChart className="w-4 h-4" />
            <span className="text-sm sm:text-base">View Dashboard</span>
          </a>
        </div>

        {/* Next Steps */}
        <div className="bg-pink-500/10 border border-pink-500/20 rounded-xl p-4 sm:p-6">
          <h3 className="font-semibold text-pink-400 mb-3 flex items-center gap-2 text-sm sm:text-base">
            <ExternalLink className="w-4 h-4" />
            What's Next?
          </h3>
          <ul className="space-y-2 text-xs sm:text-sm text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-pink-400 mt-0.5 flex-shrink-0">✓</span>
              <span>Your website is already optimized for mobile and SEO</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-pink-400 mt-0.5 flex-shrink-0">✓</span>
              <span>Lead capture form is active - start getting inquiries!</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-pink-400 mt-0.5 flex-shrink-0">✓</span>
              <span>Share your new website on social media</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-pink-400 mt-0.5 flex-shrink-0">✓</span>
              <span>Monitor your leads in the dashboard</span>
            </li>
          </ul>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleClose}
          className="w-full mt-6 px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-all border border-white/10 min-h-[48px] touch-manipulation"
        >
          Continue to Website
        </button>
      </div>
    </div>
  );
}
