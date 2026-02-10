"use client";

import { useState } from "react";
import { Monitor, Smartphone, Tablet, Maximize2, Minimize2 } from "lucide-react";

interface LivePreviewProps {
  siteUrl: string;
  className?: string;
}

type DeviceType = "desktop" | "tablet" | "mobile";

const deviceSizes: Record<DeviceType, { width: string; height: string }> = {
  desktop: { width: "100%", height: "600px" },
  tablet: { width: "768px", height: "600px" },
  mobile: { width: "375px", height: "667px" },
};

export function LivePreview({ siteUrl, className = "" }: LivePreviewProps) {
  const [device, setDevice] = useState<DeviceType>("desktop");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const devices: { type: DeviceType; icon: React.ReactNode; label: string }[] = [
    { type: "desktop", icon: <Monitor className="w-4 h-4" />, label: "Desktop" },
    { type: "tablet", icon: <Tablet className="w-4 h-4" />, label: "Tablet" },
    { type: "mobile", icon: <Smartphone className="w-4 h-4" />, label: "Mobile" },
  ];

  return (
    <div className={`bg-gray-900 rounded-xl overflow-hidden ${className}`}>
      {/* Browser Chrome */}
      <div className="bg-gray-800 px-4 py-3 flex items-center justify-between">
        {/* Traffic lights */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>

        {/* URL Bar */}
        <div className="flex-1 mx-4">
          <div className="bg-gray-700 rounded-lg px-4 py-1.5 text-sm text-gray-300 truncate max-w-md mx-auto">
            {siteUrl}
          </div>
        </div>

        {/* Device Toggle */}
        <div className="flex items-center gap-1">
          {devices.map(({ type, icon, label }) => (
            <button
              key={type}
              onClick={() => setDevice(type)}
              className={`p-2 rounded-lg transition-colors ${
                device === type
                  ? "bg-indigo-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
              title={label}
            >
              {icon}
            </button>
          ))}
          <div className="w-px h-6 bg-gray-700 mx-2" />
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Preview Frame */}
      <div 
        className="bg-white flex items-start justify-center p-4 overflow-auto"
        style={{ height: isFullscreen ? "80vh" : "500px" }}
      >
        <div
          className="bg-white shadow-2xl rounded-lg overflow-hidden transition-all duration-300"
          style={{
            width: deviceSizes[device].width,
            maxWidth: "100%",
            height: device === "desktop" ? "100%" : deviceSizes[device].height,
          }}
        >
          <iframe
            src={siteUrl}
            className="w-full h-full border-0"
            title="Site Preview"
          />
        </div>
      </div>
    </div>
  );
}

// Mini preview card for dashboard
interface MiniPreviewProps {
  siteUrl: string;
  businessName: string;
}

export function MiniPreview({ siteUrl, businessName }: MiniPreviewProps) {
  return (
    <div className="group relative bg-gray-100 rounded-lg overflow-hidden aspect-video">
      <iframe
        src={siteUrl}
        className="w-full h-full border-0 pointer-events-none scale-50 origin-top-left"
        style={{ width: "200%", height: "200%" }}
        title={`${businessName} Preview`}
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
        <span className="opacity-0 group-hover:opacity-100 text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full transition-opacity">
          Click to view
        </span>
      </div>
    </div>
  );
}
