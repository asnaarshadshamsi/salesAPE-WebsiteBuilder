"use client";

import { useState } from "react";
import { 
  Instagram, 
  Facebook, 
  Twitter, 
  Linkedin,
  Copy,
  RefreshCw,
  CheckCircle,
  Sparkles,
  Image as ImageIcon,
  Download
} from "lucide-react";

interface SocialPostGeneratorProps {
  businessName: string;
  businessType: string;
  description: string;
  services: string[];
  primaryColor: string;
  siteUrl: string;
}

type Platform = "instagram" | "facebook" | "twitter" | "linkedin";

interface PostTemplate {
  platform: Platform;
  icon: React.ReactNode;
  maxLength: number;
  label: string;
}

const platforms: PostTemplate[] = [
  { platform: "instagram", icon: <Instagram className="w-5 h-5" />, maxLength: 2200, label: "Instagram" },
  { platform: "facebook", icon: <Facebook className="w-5 h-5" />, maxLength: 63206, label: "Facebook" },
  { platform: "twitter", icon: <Twitter className="w-5 h-5" />, maxLength: 280, label: "X (Twitter)" },
  { platform: "linkedin", icon: <Linkedin className="w-5 h-5" />, maxLength: 3000, label: "LinkedIn" },
];

const postTemplates: Record<Platform, string[]> = {
  instagram: [
    "🚀 Exciting news! We just launched our new website! \n\nCheck out what {businessName} has to offer:\n✨ {service1}\n✨ {service2}\n✨ {service3}\n\nLink in bio! 👆\n\n#SmallBusiness #NewWebsite #{businessType} #SupportLocal",
    "✨ Looking for {service1}? Look no further!\n\nAt {businessName}, we're passionate about helping you {benefit}.\n\n📱 Visit our website (link in bio)\n📞 DM us for inquiries\n\n##{businessType} #LocalBusiness #QualityService",
    "🎉 We're online! {businessName} is now just a click away.\n\nWhat we offer:\n• {service1}\n• {service2}\n• {service3}\n\nTap the link in our bio to learn more!\n\n#{businessType} #NowOnline #ShopLocal",
  ],
  facebook: [
    "🎉 Big announcement! \n\n{businessName} now has a brand new website! We're thrilled to share our {businessType} services with you in a whole new way.\n\nExplore our offerings:\n👉 {service1}\n👉 {service2}\n👉 {service3}\n\nVisit us at: {siteUrl}\n\nWe can't wait to serve you! 💙",
    "Hello, friends! 👋\n\n{businessName} is excited to announce our new online presence! Whether you need {service1} or {service2}, we've got you covered.\n\n🌐 Check out our website: {siteUrl}\n\nDrop a comment if you have any questions - we'd love to hear from you!",
  ],
  twitter: [
    "🚀 {businessName} is now online! Check out our new website for {service1}, {service2} & more. {siteUrl} #{businessType}",
    "✨ Need {service1}? {businessName} has got you covered! Visit our new site 👉 {siteUrl}",
    "Big news! 🎉 {businessName}'s website is LIVE! Explore our {businessType} services: {siteUrl}",
  ],
  linkedin: [
    "I'm thrilled to announce that {businessName} has launched its new website! 🚀\n\nAs a {businessType} business, we're committed to providing exceptional services including:\n\n• {service1}\n• {service2}\n• {service3}\n\nThis new platform will help us better serve our clients and community.\n\nVisit us at: {siteUrl}\n\nI'd love to connect with others in the industry. Feel free to reach out!\n\n#BusinessGrowth #{businessType} #NewWebsite #Entrepreneurship",
  ],
};

export function SocialPostGenerator({
  businessName,
  businessType,
  description,
  services,
  primaryColor,
  siteUrl,
}: SocialPostGeneratorProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("instagram");
  const [currentPostIndex, setCurrentPostIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [editedPost, setEditedPost] = useState("");

  const generatePost = (template: string): string => {
    const service1 = services[0] || "quality services";
    const service2 = services[1] || "expert solutions";
    const service3 = services[2] || "personalized attention";
    const benefit = "achieve your goals";

    return template
      .replace(/{businessName}/g, businessName)
      .replace(/{businessType}/g, businessType)
      .replace(/{service1}/g, service1)
      .replace(/{service2}/g, service2)
      .replace(/{service3}/g, service3)
      .replace(/{benefit}/g, benefit)
      .replace(/{siteUrl}/g, siteUrl);
  };

  const templates = postTemplates[selectedPlatform];
  const currentPost = editedPost || generatePost(templates[currentPostIndex]);
  const currentPlatform = platforms.find((p) => p.platform === selectedPlatform)!;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(currentPost);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefresh = () => {
    const nextIndex = (currentPostIndex + 1) % templates.length;
    setCurrentPostIndex(nextIndex);
    setEditedPost("");
  };

  const handlePlatformChange = (platform: Platform) => {
    setSelectedPlatform(platform);
    setCurrentPostIndex(0);
    setEditedPost("");
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-pink-100 rounded-lg">
            <Sparkles className="w-5 h-5 text-pink-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Social Media Post Generator</h2>
            <p className="text-sm text-gray-500">Create ready-to-post content for your channels</p>
          </div>
        </div>
      </div>

      {/* Platform Selector */}
      <div className="flex border-b border-gray-200">
        {platforms.map((platform) => (
          <button
            key={platform.platform}
            onClick={() => handlePlatformChange(platform.platform)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
              selectedPlatform === platform.platform
                ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            {platform.icon}
            <span className="hidden sm:inline">{platform.label}</span>
          </button>
        ))}
      </div>

      {/* Post Content */}
      <div className="p-6">
        <div className="relative">
          <textarea
            value={currentPost}
            onChange={(e) => setEditedPost(e.target.value)}
            className="w-full h-48 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            placeholder="Your post will appear here..."
          />
          <div className="absolute bottom-3 right-3 text-xs text-gray-400">
            {currentPost.length} / {currentPlatform.maxLength}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Another
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Post
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tip */}
      <div className="px-6 pb-6">
        <div className="bg-amber-50 rounded-lg p-3 text-sm text-amber-800">
          💡 <strong>Pro tip:</strong> Post consistently at peak hours. For Instagram, try 11am-1pm or 7pm-9pm!
        </div>
      </div>
    </div>
  );
}

// Quick social share buttons
interface QuickShareProps {
  url: string;
  title: string;
}

export function QuickShare({ url, title }: QuickShareProps) {
  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500">Share:</span>
      <a
        href={shareUrls.twitter}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-50 rounded-lg transition-colors"
      >
        <Twitter className="w-4 h-4" />
      </a>
      <a
        href={shareUrls.facebook}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
      >
        <Facebook className="w-4 h-4" />
      </a>
      <a
        href={shareUrls.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 text-gray-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
      >
        <Linkedin className="w-4 h-4" />
      </a>
    </div>
  );
}
