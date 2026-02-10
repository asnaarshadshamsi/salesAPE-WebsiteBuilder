"use client";

import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download, Copy, CheckCircle, QrCode } from "lucide-react";

interface QRCodeCardProps {
  siteUrl: string;
  businessName: string;
}

export function QRCodeCard({ siteUrl, businessName }: QRCodeCardProps) {
  const [copied, setCopied] = useState(false);

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
    const canvas = document.getElementById("qr-code-card") as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `${businessName.toLowerCase().replace(/\s+/g, "-")}-qr-code.png`;
      link.href = url;
      link.click();
    }
  };

  return (
    <div className="bg-zinc-900 rounded-xl shadow-lg border border-pink-500/20 p-6">
      <div className="flex items-center gap-2 mb-4">
        <QrCode className="w-5 h-5 text-pink-400" />
        <h2 className="text-lg font-semibold text-white">QR Code</h2>
      </div>
      
      <p className="text-sm text-gray-400 mb-4">
        Use this QR code on business cards, flyers, or in your store window.
      </p>

      <div className="flex flex-col items-center">
        <div className="p-4 bg-white rounded-xl border-2 border-dashed border-pink-500/30 mb-4">
          <QRCodeCanvas
            id="qr-code-card"
            value={siteUrl}
            size={180}
            level="H"
            includeMargin={true}
            bgColor="#ffffff"
            fgColor="#000000"
          />
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={handleDownloadQR}
            className="inline-flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm font-medium shadow-lg shadow-pink-500/25"
          >
            <Download className="w-4 h-4" />
            Download PNG
          </button>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 text-gray-300 rounded-lg hover:bg-zinc-700 transition-colors text-sm font-medium"
          >
            {copied ? (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy URL
              </>
            )}
          </button>
        </div>

        <div className="text-xs text-gray-500 text-center">
          <code className="bg-zinc-800 px-2 py-1 rounded text-gray-400">{siteUrl}</code>
        </div>
      </div>
    </div>
  );
}
