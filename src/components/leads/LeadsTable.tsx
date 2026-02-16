"use client";

import { Button } from "@/components/ui/button";
import { Mail, Phone, Calendar, ExternalLink, Star } from "lucide-react";
import Link from "next/link";
import { Lead } from "@/types";

interface LeadsTableProps {
  leads: Lead[];
}

export function LeadsTable({ leads }: LeadsTableProps) {
  if (leads.length === 0) {
    return (
      <div className="bg-zinc-900 rounded-xl border border-pink-500/20 p-12 text-center">
        <p className="text-gray-400">No leads yet</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 rounded-xl border border-pink-500/20 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-zinc-800/50 border-b border-pink-500/10">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Lead
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Business
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Score
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-pink-500/10">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-zinc-800/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-white">{lead.name}</div>
                  {lead.email && (
                    <div className="text-sm text-gray-400">{lead.email}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-white">
                    {/* @ts-ignore - relation optional */}
                    {lead.site?.business?.name || "N/A"}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    {lead.email && (
                      <a
                        href={`mailto:${lead.email}`}
                        className="text-sm text-gray-400 hover:text-pink-400 flex items-center gap-1"
                      >
                        <Mail className="w-3 h-3" />
                        {lead.email}
                      </a>
                    )}
                    {lead.phone && (
                      <a
                        href={`tel:${lead.phone}`}
                        className="text-sm text-gray-400 hover:text-pink-400 flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" />
                        {lead.phone}
                      </a>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-pink-500/20 text-pink-400 capitalize">
                    {lead.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-white">
                      {/* @ts-ignore - optional field */}
                      {lead.score || "N/A"}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1 text-sm text-gray-400">
                    <Calendar className="w-3 h-3" />
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <Link href={`/dashboard/leads/${lead.id}`}>
                    <Button>
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
