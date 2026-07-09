import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color?: 'violet' | 'green' | 'amber' | 'fuchsia' | 'teal';
}

const iconBgMap = {
  violet: 'from-violet-500 to-purple-600',
  green: 'from-emerald-500 to-teal-600',
  amber: 'from-amber-500 to-orange-500',
  fuchsia: 'from-fuchsia-500 to-pink-600',
  teal: 'from-teal-500 to-cyan-500',
};

export default function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  color = 'violet',
}: StatsCardProps) {
  return (
    <div className="glass-card rounded-2xl p-5 card-hover group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-violet-300/60">{title}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1 group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors duration-300">
            {value}
          </p>
          {trend && (
            <p className="text-xs text-slate-500 dark:text-violet-400/50 mt-1">{trend}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${iconBgMap[color]} shadow-lg shadow-violet-500/20 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}
