import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getUserBusinesses } from "@/actions/business";
import { Button } from "@/components/ui";
import { SuccessCelebration } from "@/components/SuccessCelebration";
import { QuickStats } from "@/components/dashboard/QuickStats";
import { BusinessList } from "@/components/dashboard/BusinessList";
import { Plus } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  // Don't redirect here - let the middleware and layout handle it
  if (!user) {
    return null; // Layout will handle the redirect
  }

  const businesses = await getUserBusinesses();
  
  // Calculate total leads
  const totalLeads = businesses.reduce(
    (sum, business) => sum + (business.site?._count?.leads || 0),
    0
  );

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return (
    <DashboardLayout>
      {/* Success Celebration Modal */}
      <SuccessCelebration appUrl={appUrl} />
      
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400">Manage your businesses and leads</p>
        </div>
        <Link href="/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Business
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="mb-8">
        <QuickStats
          stats={{
            activeSites: businesses.length,
            totalLeads,
            conversionRate: undefined,
          }}
        />
      </div>

      {/* Businesses Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-white">
            Your Businesses
          </h2>
        </div>
        <BusinessList businesses={businesses} appUrl={appUrl} />
      </div>

      {/* Recent Leads Section */}
      {businesses.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">
              Recent Leads
            </h2>
            <Link
              href="/dashboard/leads"
              className="text-pink-400 hover:text-pink-300 text-sm font-medium transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="bg-zinc-900 rounded-xl border border-pink-500/20 p-6">
            <p className="text-gray-400 text-center py-4">
              Your recent leads will appear here
            </p>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

