import { DatabaseZap, MapPin, ShieldAlert, Sparkles, Star } from 'lucide-react';
import { formatRating } from '../utils/helpers';


const AnalyticsCards = ({ total = 0, averageRating = 0, duplicatesRemoved = 0, newCount = 0, apiCalls = 0 }) => {
  const stats = [
    {
      id: 'total-places',
      label: 'Places Found',
      value: total,
      icon: MapPin,
      accentClass: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/25 border-violet-100 dark:border-violet-900/40'
    },
    {
      id: 'avg-rating',
      label: 'Average Rating',
      value: formatRating(averageRating),
      icon: Star,
      accentClass: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/25 border-amber-100 dark:border-amber-900/40'
    },
    {
      id: 'new-records',
      label: 'New Records',
      value: newCount,
      icon: Sparkles,
      accentClass: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/25 border-cyan-100 dark:border-cyan-900/40'
    },
    {
      id: 'duplicates-removed',
      label: 'Duplicates Removed',
      value: duplicatesRemoved,
      icon: ShieldAlert,
      accentClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/25 border-emerald-100 dark:border-emerald-900/40'
    },
    {
      id: 'api-calls',
      label: 'API Calls',
      value: apiCalls,
      icon: DatabaseZap,
      accentClass: 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 my-6">
      {stats.map((stat) => {
        const IconComponent = stat.icon;
        return (
          <div 
            key={stat.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/60 dark:hover:shadow-slate-950/40 transition duration-300"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {stat.label}
                </p>
                <h4 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
                  {stat.value}
                </h4>
              </div>
              <div className={`p-3 rounded-xl border ${stat.accentClass} shrink-0`}>
                <IconComponent className="w-5 h-5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AnalyticsCards;
