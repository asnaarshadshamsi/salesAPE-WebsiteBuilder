import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getLeadsForUser } from "@/actions/leads";
import { formatRelativeTime } from "@/lib/utils";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { LeadsTable } from "@/components/leads/LeadsTable";
import {
  ArrowLeft,
  MessageSquare,
  User,
} from "lucide-react";

export default async function LeadsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const leads = await getLeadsForUser();

  return (
    <DashboardLayout>
      <Link
        href="/dashboard"
        className="inline-flex items-center text-gray-400 hover:text-pink-400 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Link>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Leads</h1>
          <p className="text-gray-400">
            Manage your leads across all businesses
          </p>
        </div>
      </div>

      {/* Leads Table */}
      <div className="mb-8">
        <LeadsTable leads={leads} />
      </div>

      {/* Lead Messages Panel */}
      {leads.length > 0 && leads.some((l: any) => l.message) && (
        <div className="bg-zinc-900 rounded-xl shadow-lg border border-pink-500/20 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-pink-400" />
            Recent Messages
          </h2>
          <div className="space-y-4">
            {leads
              .filter((l: any) => l.message)
              .slice(0, 5)
              .map((lead: any) => (
                <div
                  key={lead.id}
                  className="p-4 bg-zinc-800 rounded-lg border border-zinc-700"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-white">
                      {lead.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatRelativeTime(lead.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">{lead.message}</p>
                </div>
              ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
