import { useState, Fragment } from 'react';
import { Star, Globe, Phone, Clock, Trash2, ChevronUp, ExternalLink, Sparkles, Loader2, MapPin, Award } from 'lucide-react';
import { LEAD_TIER_COLORS } from '../utils/constants';
import placeService from '../services/placeService';


const ResultsTable = ({ places = [], onDelete, deletingId }) => {
  const [expandedHours, setExpandedHours] = useState({});
  const [localSummaries, setLocalSummaries] = useState({});
  const [summarizingId, setSummarizingId] = useState(null);

  const toggleHours = (id) => {
    setExpandedHours(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getTierBadge = (tier) => {
    const baseStyle = 'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border capitalize';
    const colorStyle = LEAD_TIER_COLORS[tier] || LEAD_TIER_COLORS.low;
    return <span className={`${baseStyle} ${colorStyle}`}>{tier || 'low'}</span>;
  };

  const handleGenerateSummary = async (placeId) => {
    if (summarizingId) return;
    setSummarizingId(placeId);
    try {
      const res = await placeService.generateSummary(placeId);
      if (res.success) {
        setLocalSummaries(prev => ({
          ...prev,
          [placeId]: res.summary
        }));
      } else {
        alert(res.message || 'Failed to generate summary');
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Error generating AI summary');
    } finally {
      setSummarizingId(null);
    }
  };

  const renderContact = (place, isMobile = false) => (
    <div className={isMobile ? 'space-y-2' : 'space-y-1'}>
      {place.phone ? (
        <a
          href={`tel:${place.phone}`}
          className={`${isMobile ? 'text-sm' : 'text-xs'} flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 transition`}
        >
          <Phone className={`${isMobile ? 'w-4 h-4' : 'w-3.5 h-3.5'} shrink-0`} />
          <span className="break-words">{place.phone}</span>
        </a>
      ) : (
        <div className={`${isMobile ? 'text-sm' : 'text-xs'} text-slate-400 dark:text-slate-600 flex items-center gap-2`}>
          <Phone className={`${isMobile ? 'w-4 h-4' : 'w-3.5 h-3.5'} shrink-0`} />
          <span>No phone</span>
        </div>
      )}

      {place.website ? (
        <a
          href={place.website}
          target="_blank"
          rel="noopener noreferrer"
          className={`${isMobile ? 'text-sm' : 'text-xs'} flex items-center gap-2 text-violet-600 dark:text-violet-400 hover:underline min-w-0`}
        >
          <Globe className={`${isMobile ? 'w-4 h-4' : 'w-3.5 h-3.5'} shrink-0`} />
          <span className="truncate">{place.website}</span>
          <ExternalLink className={`${isMobile ? 'w-3 h-3' : 'w-2.5 h-2.5'} shrink-0`} />
        </a>
      ) : (
        <div className={`${isMobile ? 'text-sm' : 'text-xs'} text-slate-400 dark:text-slate-600 flex items-center gap-2`}>
          <Globe className={`${isMobile ? 'w-4 h-4' : 'w-3.5 h-3.5'} shrink-0`} />
          <span>No website</span>
        </div>
      )}
    </div>
  );

  const renderRating = (place) => (
    <div>
      <div className="flex items-center gap-1.5">
        <span className="font-bold text-slate-800 dark:text-slate-100">
          {typeof place.rating === 'number' ? place.rating.toFixed(1) : '0.0'}
        </span>
        <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
      </div>
      <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
        {place.reviewCount || 0} reviews
      </div>
    </div>
  );

  const ActionButtons = ({ place, hasHours, isHoursExpanded, isMobile = false }) => (
    <div className={`flex items-center ${isMobile ? 'justify-between gap-2 pt-4 border-t border-slate-100 dark:border-slate-800' : 'justify-end gap-2'}`}>
      {hasHours && (
        <button
          onClick={() => toggleHours(place._id)}
          className={`${isMobile ? 'flex-1 px-3 py-2.5 text-xs font-semibold gap-2' : 'p-2'} hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl transition inline-flex items-center justify-center cursor-pointer`}
          title="View opening hours"
        >
          {isHoursExpanded ? <ChevronUp className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
          {isMobile && <span>{isHoursExpanded ? 'Hide hours' : 'Hours'}</span>}
        </button>
      )}

      <button
        onClick={() => handleGenerateSummary(place._id)}
        disabled={summarizingId === place._id}
        className={`${isMobile ? 'flex-1 px-3 py-2.5 text-xs font-semibold gap-2' : 'p-2'} hover:bg-violet-50 dark:hover:bg-violet-950/20 text-violet-600 dark:text-violet-400 rounded-xl transition inline-flex items-center justify-center disabled:opacity-50 cursor-pointer`}
        title="Generate AI Summary"
      >
        {summarizingId === place._id ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
        {isMobile && <span>{summarizingId === place._id ? 'Writing' : 'AI summary'}</span>}
      </button>

      <button
        onClick={() => onDelete(place._id)}
        disabled={deletingId === place._id}
        className={`${isMobile ? 'px-3 py-2.5' : 'p-2'} hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition inline-flex items-center justify-center disabled:opacity-50 cursor-pointer`}
        title="Delete place"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );

  const HoursPanel = ({ place, isMobile = false }) => (
    <div className={`${isMobile ? 'mt-4' : 'py-1'} flex flex-col gap-2`}>
      <span className={`${isMobile ? 'text-sm' : 'text-xs'} font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2`}>
        <Clock className="w-4 h-4" />
        Opening Hours Schedule
      </span>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 mt-1">
        {place.openingHours.map((hour, idx) => (
          <div
            key={idx}
            className={`${isMobile ? 'text-sm px-3 py-2' : 'text-xs px-2.5 py-1.5'} bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700/30`}
          >
            {hour}
          </div>
        ))}
      </div>
    </div>
  );

  const SummaryPanel = ({ summaryText, isMobile = false }) => (
    <div className={`${isMobile ? 'mt-4' : ''} rounded-2xl border border-violet-200/80 dark:border-violet-900/50 bg-violet-50/70 dark:bg-violet-950/20 p-4 sm:p-5`}>
      <div className="flex items-center gap-2 text-sm font-extrabold text-violet-700 dark:text-violet-300">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-violet-100 dark:border-violet-900/50">
          <Sparkles className="w-4 h-4" />
        </span>
        AI Intelligence Summary
      </div>
      <p className="mt-3 text-sm sm:text-base leading-7 text-slate-700 dark:text-slate-200 whitespace-pre-line">
        {summaryText}
      </p>
    </div>
  );

  return (
    <div className="my-6">
      {/* Mobile card layout */}
      <div className="lg:hidden space-y-4">
        {places.map((place) => {
          const hasHours = place.openingHours && place.openingHours.length > 0;
          const isHoursExpanded = expandedHours[place._id];
          const summaryText = localSummaries[place._id] || place.aiSummary;

          return (
            <article
              key={place._id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden"
            >
              <div className="p-4 sm:p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-slate-900 dark:text-white leading-snug text-base break-words">
                      {place.name}
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed flex gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-slate-400" />
                      <span>{place.address || 'No address provided'}</span>
                    </p>
                  </div>
                  <div className="shrink-0">
                    {renderRating(place)}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700/60">
                    {place.category || 'Local Business'}
                  </span>
                  {getTierBadge(place.leadTier)}
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-full px-2.5 py-1">
                    <Award className="w-3.5 h-3.5" />
                    {place.leadScore || 0} pts
                  </span>
                </div>

                <div className="rounded-2xl bg-slate-50/80 dark:bg-slate-950/35 border border-slate-200 dark:border-slate-800 p-3">
                  {renderContact(place, true)}
                </div>

                <ActionButtons place={place} hasHours={hasHours} isHoursExpanded={isHoursExpanded} isMobile />

                {hasHours && isHoursExpanded && <HoursPanel place={place} isMobile />}
                {summaryText && <SummaryPanel summaryText={summaryText} isMobile />}
              </div>
            </article>
          );
        })}
      </div>

      {/* Desktop table layout */}
      <div className="hidden lg:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                <th className="py-4 px-6">Place Info</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Contact info</th>
                <th className="py-4 px-6">Rating</th>
                <th className="py-4 px-6">Status / Lead</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
              {places.map((place) => {
                const hasHours = place.openingHours && place.openingHours.length > 0;
                const isHoursExpanded = expandedHours[place._id];
                const summaryText = localSummaries[place._id] || place.aiSummary;

                return (
                  <Fragment key={place._id}>
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="py-4 px-6 max-w-xs">
                        <div className="font-bold text-slate-800 dark:text-slate-100 leading-snug">
                          {place.name}
                        </div>
                        <div className="text-xs text-slate-400 dark:text-slate-500 mt-1 truncate" title={place.address}>
                          {place.address || 'N/A'}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="inline-block px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700/60">
                          {place.category || 'Local Business'}
                        </span>
                      </td>

                      <td className="py-4 px-6 max-w-[220px]">
                        {renderContact(place)}
                      </td>

                      <td className="py-4 px-6">
                        {renderRating(place)}
                      </td>

                      <td className="py-4 px-6 space-y-1">
                        <div className="flex items-center gap-1.5">
                          {getTierBadge(place.leadTier)}
                          <span className="text-xs text-slate-400 dark:text-slate-500">
                            ({place.leadScore || 0} pts)
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap">
                        <ActionButtons place={place} hasHours={hasHours} isHoursExpanded={isHoursExpanded} />
                      </td>
                    </tr>

                    {hasHours && isHoursExpanded && (
                      <tr className="bg-slate-50/40 dark:bg-slate-800/10">
                        <td colSpan="6" className="py-4 px-6 border-b border-slate-200 dark:border-slate-800">
                          <HoursPanel place={place} />
                        </td>
                      </tr>
                    )}

                    {summaryText && (
                      <tr className="bg-white dark:bg-slate-900">
                        <td colSpan="6" className="py-5 px-6 border-b border-slate-200 dark:border-slate-800">
                          <SummaryPanel summaryText={summaryText} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ResultsTable;
