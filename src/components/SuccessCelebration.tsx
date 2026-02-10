"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import confetti from "canvas-confetti";
import { X, ExternalLink, Download, Copy, CheckCircle, Share2 } from "lucide-react";
import { Button } from "@/components/ui";

interface SuccessCelebrationProps {
  appUrl: string;
}

export function SuccessCelebration({ appUrl }: SuccessCelebrationProps) {
  const searchParams = useSearchParams();
  const createdSlug = searchParams.get("created");
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const siteUrl = `${appUrl}/sites/${createdSlug}`;

  useEffect(() => {
    if (createdSlug) {
      setShowModal(true);
      // Trigger confetti!
      const duration = 3000;
      const animationEnd = Date.now() + duration;

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
          particleCount,
          startVelocity: 30,
          spread: 360,
          origin: {
            x: randomInRange(0.1, 0.3),
            y: Math.random() - 0.2,
          },
          colors: ["#6366f1", "#8b5cf6", "#a855f7", "#ec4899", "#f43f5e"],
        });

        confetti({
          particleCount,
          startVelocity: 30,
          spread: 360,
          origin: {
            x: randomInRange(0.7, 0.9),
            y: Math.random() - 0.2,
          },
          colors: ["#6366f1", "#8b5cf6", "#a855f7", "#ec4899", "#f43f5e"],
        });
      }, 250);

      // Clean up URL without refresh
      window.history.replaceState({}, "", "/dashboard");

      return () => clearInterval(interval);
    }
  }, [createdSlug]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(siteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDownloadQR = () => {
    const canvas = document.getElementById("qr-code-canvas") as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `${createdSlug}-qr-code.png`;
      link.href = url;
      link.click();
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out my new business website!",
          text: "I just created my business website with HackSquad",
          url: siteUrl,
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      handleCopy();
    }
  };

  if (!showModal || !createdSlug) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-in zoom-in-95 duration-300">
        <button
          onClick={() => setShowModal(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            🎉 Your Site is Live!
          </h2>
          <p className="text-gray-600 mb-6">
            Congratulations! Your business website is now ready to collect leads.
          </p>

          {/* Site URL */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-500 mb-2">Your site URL</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm bg-white px-3 py-2 rounded-lg border border-gray-200 truncate text-indigo-600">
                {siteUrl}
              </code>
              <button
                onClick={handleCopy}
                className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="Copy URL"
              >
                {copied ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* QR Code */}
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-3">QR Code for sharing</p>
            <div className="flex justify-center mb-3">
              <div className="p-3 bg-white rounded-xl border-2 border-dashed border-gray-200">
                <QRCodeCanvas
                  id="qr-code-canvas"
                  value={siteUrl}
                  size={150}
                  level="H"
                  includeMargin={true}
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
              </div>
            </div>
            <button
              onClick={handleDownloadQR}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center gap-1"
            >
              <Download className="w-4 h-4" />
              Download QR Code
            </button>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <a
              href={siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button className="w-full">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Your Site
              </Button>
            </a>
            <Button variant="outline" onClick={handleShare} className="w-full">
              <Share2 className="w-4 h-4 mr-2" />
              Share with Friends
            </Button>
          </div>

          {/* Tips */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-400">
              💡 Tip: Add this QR code to your business cards or flyers!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
