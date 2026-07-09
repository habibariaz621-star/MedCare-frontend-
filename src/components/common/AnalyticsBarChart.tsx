'use client';

interface ChartItem {
  label: string;
  value: number;
}

interface AnalyticsBarChartProps {
  title: string;
  data: ChartItem[];
  colorClass?: string;
}

export default function AnalyticsBarChart({
  title,
  data,
  colorClass = 'bg-violet-600',
}: AnalyticsBarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="glass-card rounded-xl p-6">
      <h2 className="font-semibold text-slate-900 dark:text-white mb-6">{title}</h2>
      {data.length === 0 ? (
        <p className="text-sm text-slate-500">No data available.</p>
      ) : (
        <div className="space-y-3">
          {data.map((item) => (
            <div key={item.label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600 dark:text-slate-300">{item.label}</span>
                <span className="font-medium text-slate-900 dark:text-white">{item.value}</span>
              </div>
              <div className="h-2.5 bg-violet-100 dark:bg-violet-950/60 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
                  style={{ width: `${(item.value / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
