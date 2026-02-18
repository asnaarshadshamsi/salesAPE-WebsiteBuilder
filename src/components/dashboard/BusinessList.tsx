"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BusinessWithSite } from "@/types";
import { deleteBusiness } from "@/actions/business";
import {
  Globe,
  ExternalLink,
  Settings,
  Users,
  Calendar,
  Edit,
  Trash2,
  MoreVertical,
  RefreshCw,
  Loader2,
} from "lucide-react";

interface BusinessCardProps {
  business: BusinessWithSite;
  appUrl: string;
}

export function BusinessCard({ business, appUrl }: BusinessCardProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const siteUrl = business.site
    ? `${appUrl}/sites/${business.site.slug}`
    : null;
  const leadCount = business.site?._count?.leads || 0;

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteBusiness(business.id);
    
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || "Failed to delete business");
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-zinc-900 rounded-xl p-6 border border-pink-500/20 hover:border-pink-500/40 transition-all hover:shadow-lg hover:shadow-pink-500/10 relative">
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-xl z-10 flex items-center justify-center">
          <div className="bg-zinc-800 border border-red-500/30 rounded-xl p-6 max-w-sm mx-4">
            <h4 className="text-lg font-semibold text-white mb-2">Delete Business?</h4>
            <p className="text-gray-400 text-sm mb-4">
              This will permanently delete &quot;{business.name}&quot; and its website. This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium flex items-center justify-center"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">
            {business.name}
          </h3>
          <p className="text-sm text-gray-400 line-clamp-2">
            {business.description}
          </p>
        </div>
        <div className="flex items-center gap-2 ml-4">
          {business.logo && (
            <img
              src={business.logo}
              alt={business.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
          )}
          {/* Action Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-zinc-800 border border-pink-500/20 rounded-lg shadow-xl z-20">
                <Link
                  href={`/dashboard/business/${business.id}`}
                  className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-zinc-700 rounded-t-lg transition-colors"
                  onClick={() => setShowMenu(false)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Business
                </Link>
                <Link
                  href={`/create?edit=${business.id}`}
                  className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-zinc-700 transition-colors"
                  onClick={() => setShowMenu(false)}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerate Website
                </Link>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setShowDeleteConfirm(true);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-zinc-700 rounded-b-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Business
                </button>
              </div>
            )}
          </div>
        </div>
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
            View Live Site
          </Link>
        )}
        <Link
          href={`/dashboard/business/${business.id}`}
          className="inline-flex items-center justify-center px-4 py-2 bg-zinc-800 text-gray-300 rounded-lg hover:bg-zinc-700 transition-colors text-sm font-medium"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit
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
