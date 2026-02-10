"use client";

import { useState } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  MousePointer, 
  Users, 
  Clock,
  ArrowUpRight,
  BarChart3
} from "lucide-react";

interface AnalyticsStat {
  label: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: React.ReactNode;
}

interface AnalyticsCardProps {
  businessId: string;
  siteName: string;
}

export function AnalyticsCard({ businessId, siteName }: AnalyticsCardProps) {
  // In production, these would come from an API
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("7d");

  // Mock data - replace with real analytics
  const stats: AnalyticsStat[] = [
    {
      label: "Page Views",
      value: "1,234",
      change: 12.5,
      changeLabel: "vs last period",
      icon: <Eye className="w-5 h-5" />,
    },
    {
      label: "Unique Visitors",
      value: "856",
      change: 8.2,
      changeLabel: "vs last period",
      icon: <Users className="w-5 h-5" />,
    },
    {
      label: "Lead Conversion",
      value: "4.2%",
      change: -2.1,
      changeLabel: "vs last period",
      icon: <MousePointer className="w-5 h-5" />,
    },
    {
      label: "Avg. Time on Site",
      value: "2m 34s",
      change: 15.3,
      changeLabel: "vs last period",
      icon: <Clock className="w-5 h-5" />,
    },
  ];

  // Mock chart data
  const chartData = [
    { day: "Mon", views: 120 },
    { day: "Tue", views: 180 },
    { day: "Wed", views: 150 },
    { day: "Thu", views: 220 },
    { day: "Fri", views: 280 },
    { day: "Sat", views: 190 },
    { day: "Sun", views: 140 },
  ];

  const maxViews = Math.max(...chartData.map((d) => d.views));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Site Analytics</h2>
              <p className="text-sm text-gray-500">{siteName}</p>
            </div>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {(["7d", "30d", "90d"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  timeRange === range
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : "90 Days"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
        {stats.map((stat, i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center gap-2 text-gray-500">
              {stat.icon}
              <span className="text-sm">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <div className="flex items-center gap-1">
              {stat.change >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span
                className={`text-sm font-medium ${
                  stat.change >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {stat.change >= 0 ? "+" : ""}
                {stat.change}%
              </span>
              <span className="text-xs text-gray-400">{stat.changeLabel}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Mini Chart */}
      <div className="px-6 pb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Daily Page Views</p>
          <div className="flex items-end justify-between gap-2 h-24">
            {chartData.map((data, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-indigo-500 rounded-t transition-all hover:bg-indigo-600"
                  style={{
                    height: `${(data.views / maxViews) * 100}%`,
                    minHeight: "4px",
                  }}
                />
                <span className="text-xs text-gray-500">{data.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-6 pb-6">
        <a
          href="#"
          className="flex items-center justify-center gap-2 w-full py-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
        >
          View Full Analytics
          <ArrowUpRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}

// Simple stat card for overview
interface SimpleStatProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  color?: "indigo" | "green" | "blue" | "orange";
}

export function SimpleStat({ label, value, icon, trend, color = "indigo" }: SimpleStatProps) {
  const colors = {
    indigo: "bg-indigo-100 text-indigo-600",
    green: "bg-green-100 text-green-600",
    blue: "bg-blue-100 text-blue-600",
    orange: "bg-orange-100 text-orange-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${colors[color]}`}>{icon}</div>
        {trend !== undefined && (
          <span
            className={`text-sm font-medium ${
              trend >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend >= 0 ? "+" : ""}
            {trend}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}
