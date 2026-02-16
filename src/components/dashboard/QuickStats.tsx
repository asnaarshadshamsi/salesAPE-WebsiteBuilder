import { Globe, Users, BarChart3 } from "lucide-react";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  change?: string;
}

export function StatCard({ icon, label, value, change }: StatCardProps) {
  return (
    <div className="bg-zinc-900 rounded-xl p-6 border border-pink-500/20 hover:border-pink-500/40 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400">
          {icon}
        </div>
        {change && (
          <span className="text-sm text-green-400">{change}</span>
        )}
      </div>
      <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  );
}

interface QuickStatsProps {
  stats: {
    activeSites: number;
    totalLeads: number;
    conversionRate?: string;
  };
}

export function QuickStats({ stats }: QuickStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard
        icon={<Globe className="w-6 h-6" />}
        label="Active Sites"
        value={stats.activeSites.toString()}
      />
      <StatCard
        icon={<Users className="w-6 h-6" />}
        label="Total Leads"
        value={stats.totalLeads.toString()}
      />
      <StatCard
        icon={<BarChart3 className="w-6 h-6" />}
        label="Conversion Rate"
        value={stats.conversionRate || "--"}
      />
    </div>
  );
}
