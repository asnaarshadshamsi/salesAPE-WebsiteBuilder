import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getUserBusinesses, BusinessWithSite } from "@/actions/business";
import { signOut } from "@/actions/auth";
import { Button } from "@/components/ui";
import { SuccessCelebration } from "@/components/SuccessCelebration";
import {
  Rocket,
  Plus,
  Globe,
  Users,
  ExternalLink,
  Settings,
  LogOut,
  BarChart3,
} from "lucide-react";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const businesses = await getUserBusinesses();
  
  // Calculate total leads
  let totalLeads = 0;
  for (const business of businesses) {
    totalLeads += business.site?._count?.leads || 0;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return (
    <div className="min-h-screen bg-black">
      {/* Success Celebration Modal */}
      <SuccessCelebration appUrl={appUrl} />
      {/* Header */}
      <header className="bg-zinc-950 border-b border-pink-500/20">
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
              <span className="text-sm text-gray-400">
                {user.name || user.email}
              </span>
              <form action={signOut}>
                <button
                  type="submit"
                  className="text-gray-400 hover:text-pink-400 p-2 rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={<Globe className="w-6 h-6" />}
            label="Active Sites"
            value={businesses.length.toString()}
          />
          <StatCard
            icon={<Users className="w-6 h-6" />}
            label="Total Leads"
            value={totalLeads.toString()}
          />
          <StatCard
            icon={<BarChart3 className="w-6 h-6" />}
            label="Conversion Rate"
            value="--"
          />
        </div>

        {/* Businesses List */}
        <div className="bg-zinc-900/50 rounded-xl shadow-xl border border-pink-500/10">
          <div className="p-6 border-b border-pink-500/10">
            <h2 className="text-lg font-semibold text-white">
              Your Businesses
            </h2>
          </div>

          {businesses.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                No businesses yet
              </h3>
              <p className="text-gray-400 mb-6">
                Create your first business website and start collecting leads.
              </p>
              <Link href="/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Business
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-pink-500/10">
              {businesses.map((business: BusinessWithSite) => (
                <div
                  key={business.id}
                  className="p-6 flex items-center justify-between hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: business.primaryColor }}
                    >
                      {business.logo ? (
                        <img
                          src={business.logo}
                          alt={business.name}
                          className="w-8 h-8 object-contain"
                        />
                      ) : (
                        business.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">
                        {business.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {business.site?._count?.leads || 0} leads •{" "}
                        {business.city || "No location"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {business.site && (
                      <>
                        <Link
                          href={`/sites/${business.site.slug}`}
                          target="_blank"
                          className="p-2 text-gray-400 hover:text-pink-400 hover:bg-pink-500/10 rounded-lg transition-colors"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </Link>
                        <Link
                          href={`/dashboard/leads?business=${business.id}`}
                          className="p-2 text-gray-400 hover:text-pink-400 hover:bg-pink-500/10 rounded-lg transition-colors"
                        >
                          <Users className="w-5 h-5" />
                        </Link>
                      </>
                    )}
                    <Link
                      href={`/dashboard/business/${business.id}`}
                      className="p-2 text-gray-400 hover:text-pink-400 hover:bg-pink-500/10 rounded-lg transition-colors"
                    >
                      <Settings className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Leads Quick View */}
        {businesses.length > 0 && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white">
                Recent Leads
              </h2>
              <Link
                href="/dashboard/leads"
                className="text-pink-400 hover:text-pink-300 text-sm font-medium"
              >
                View all →
              </Link>
            </div>
            <div className="bg-zinc-900/50 rounded-xl shadow-xl border border-pink-500/10 p-6">
              <p className="text-gray-500 text-center py-4">
                Your recent leads will appear here
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-zinc-900/50 rounded-xl shadow-xl border border-pink-500/10 p-6">
      <div className="flex items-center justify-between">
        <div className="text-pink-500">{icon}</div>
        <span className="text-3xl font-bold text-white">{value}</span>
      </div>
      <p className="text-gray-400 mt-2">{label}</p>
    </div>
  );
}
