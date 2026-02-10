import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getLeadsForUser, LeadWithRelations } from "@/actions/leads";
import { signOut } from "@/actions/auth";
import { formatRelativeTime } from "@/lib/utils";
import { LeadStatusBadge } from "@/components/LeadStatusBadge";
import { LeadActions } from "@/components/LeadActions";
import {
  Rocket,
  ArrowLeft,
  LogOut,
  Mail,
  Phone,
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
    <div className="min-h-screen bg-black">
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

        {/* Leads List */}
        <div className="bg-zinc-900 rounded-xl shadow-lg border border-pink-500/20">
          {leads.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                No leads yet
              </h3>
              <p className="text-gray-400">
                Leads from your websites will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-800/50 border-b border-pink-500/10">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">
                      Contact
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">
                      Business
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">
                      Status
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">
                      Date
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {leads.map((lead: LeadWithRelations) => (
                    <tr key={lead.id} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-white">
                            {lead.name}
                          </p>
                          <div className="flex items-center text-sm text-gray-400 mt-1">
                            <Mail className="w-4 h-4 mr-1" />
                            {lead.email}
                          </div>
                          {lead.phone && (
                            <div className="flex items-center text-sm text-gray-400">
                              <Phone className="w-4 h-4 mr-1" />
                              {lead.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-300">
                          {lead.site.business.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <LeadStatusBadge status={lead.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {formatRelativeTime(lead.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <LeadActions leadId={lead.id} currentStatus={lead.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Lead Details Panel - Could expand on click */}
        {leads.length > 0 && leads.some((l: LeadWithRelations) => l.message) && (
          <div className="mt-8 bg-zinc-900 rounded-xl shadow-lg border border-pink-500/20 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-pink-400" />
              Recent Messages
            </h2>
            <div className="space-y-4">
              {leads
                .filter((l: LeadWithRelations) => l.message)
                .slice(0, 5)
                .map((lead: LeadWithRelations) => (
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
      </main>
    </div>
  );
}
