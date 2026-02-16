import Link from "next/link";
import { BusinessWithSite } from "@/types";
import {
  Globe,
  ExternalLink,
  Settings,
  Users,
  Calendar,
} from "lucide-react";

interface BusinessCardProps {
  business: BusinessWithSite;
  appUrl: string;
}

export function BusinessCard({ business, appUrl }: BusinessCardProps) {
  const siteUrl = business.site
    ? `${appUrl}/sites/${business.site.slug}`
    : null;
  const leadCount = business.site?._count?.leads || 0;

  return (
    <div className="bg-zinc-900 rounded-xl p-6 border border-pink-500/20 hover:border-pink-500/40 transition-all hover:shadow-lg hover:shadow-pink-500/10">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">
            {business.name}
          </h3>
          <p className="text-sm text-gray-400 line-clamp-2">
            {business.description}
          </p>
        </div>
        {business.logo && (
          <img
            src={business.logo}
            alt={business.name}
            className="w-12 h-12 rounded-lg object-cover ml-4"
          />
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            <span>{leadCount} leads</span>
          </div>
          <div className="flex items-center">
            <Globe className="w-4 h-4 mr-1" />
            <span className="capitalize">{business.businessType}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {siteUrl && (
          <Link
            href={siteUrl}
            target="_blank"
            className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm font-medium"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View Site
          </Link>
        )}
        <Link
          href={`/dashboard/business/${business.id}`}
          className="inline-flex items-center justify-center px-4 py-2 bg-zinc-800 text-gray-300 rounded-lg hover:bg-zinc-700 transition-colors text-sm font-medium"
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Link>
      </div>
    </div>
  );
}

interface BusinessListProps {
  businesses: BusinessWithSite[];
  appUrl: string;
}

export function BusinessList({ businesses, appUrl }: BusinessListProps) {
  if (businesses.length === 0) {
    return (
      <div className="bg-zinc-900 rounded-xl p-12 text-center border border-pink-500/20">
        <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-gray-500" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">
          No businesses yet
        </h3>
        <p className="text-gray-400">
          Create your first business to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {businesses.map((business) => (
        <BusinessCard
          key={business.id}
          business={business}
          appUrl={appUrl}
        />
      ))}
    </div>
  );
}
