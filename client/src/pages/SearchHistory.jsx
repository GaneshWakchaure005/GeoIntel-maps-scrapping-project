import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import usePlaces from '../hooks/usePlaces';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import placeService from '../services/placeService';
import { History, Play, CheckCircle2, XCircle, Loader2, Trash2, Eye } from 'lucide-react';

const SearchHistory = () => {
  const { loading, error, fetchHistory, setError, setPlaces } = usePlaces();
  const [localHistory, setLocalHistory] = useState([]);
  const [clearing, setClearing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory().then(res => {
      if (res && res.success) {
        setLocalHistory(res.data || []);
      }
    });
  }, [fetchHistory]);

  const handleRunAgain = (item) => {
    const params = new URLSearchParams();
    params.append('keyword', item.keyword);
    params.append('location', item.location);
    if (item.radius) params.append('radius', item.radius);
    navigate(`/dashboard?${params.toString()}`);
  };

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to clear your entire search history? This will remove all query logs and results association from the database.')) {
      setClearing(true);
      try {
        const res = await placeService.clearHistory();
        if (res.success) {
          setLocalHistory([]);
          // Also clear the main places list locally
          setPlaces([]);
        } else {
          alert(res.message || 'Failed to clear history');
        }
      } catch (err) {
        alert(err.response?.data?.message || err.message || 'Error clearing history');
      } finally {
        setClearing(false);
      }
    }
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    const day = d.getDate();
    const month = d.toLocaleString('en-US', { month: 'short' });
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'done':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400">
            <CheckCircle2 className="w-3 h-3" />
            Done
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-400">
            <XCircle className="w-3 h-3" />
            Failed
          </span>
        );
      case 'processing':
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 border border-blue-200 text-blue-700 dark:bg-blue-950/20 dark:border-blue-900/50 dark:text-blue-400 animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Running
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 border border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section with Clear History button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            <History className="w-7 h-7 text-violet-600 dark:text-violet-400" />
            Scouting Search History
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Browse and manage previous search history jobs, evaluative leads count, and clear records.
          </p>
        </div>
        
        {localHistory.length > 0 && (
          <button
            onClick={handleClearHistory}
            disabled={clearing}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-red-600 hover:text-white bg-red-50 hover:bg-red-600 border border-red-200 hover:border-red-600 rounded-xl shadow-sm transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

      {loading && localHistory.length === 0 ? (
        <LoadingSpinner message="Retrieving search query logs..." />
      ) : localHistory.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm max-w-xl mx-auto">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-full w-fit mx-auto text-slate-400 mb-4">
            <History className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">
            No history recorded yet
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
            You haven't run any prospecting scans. Head over to the Dashboard to search and build location intelligence lists.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                  <th className="py-4 px-6">Area Searched</th>
                  <th className="py-4 px-6">Leads Found</th>
                  <th className="py-4 px-6">Search Date</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
                {localHistory.map((item) => (
                  <tr 
                    key={item._id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                  >
                    {/* Area Searched */}
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-800 dark:text-slate-100">
                        {item.location}
                      </div>
                      <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 font-medium flex items-center gap-1">
                        <span>Keyword:</span>
                        <span className="text-violet-600 dark:text-violet-400 font-semibold">{item.keyword}</span>
                        {item.radius && (
                          <>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span>{(item.radius / 1000).toFixed(1)} km radius</span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Leads Found / Status */}
                    <td className="py-4 px-6">
                      {item.status === 'done' ? (
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {item.resultsCount} leads
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">
                            ({item.newCount} new / {item.duplicateCount} dup)
                          </span>
                        </div>
                      ) : item.status === 'failed' ? (
                        <div className="flex items-center gap-1.5">
                          {getStatusBadge(item.status)}
                          <span className="text-xs text-red-500 font-medium max-w-[130px] block truncate" title={item.errorMessage}>
                            {item.errorMessage || 'Job failed'}
                          </span>
                        </div>
                      ) : (
                        getStatusBadge(item.status)
                      )}
                    </td>

                    {/* Search Date */}
                    <td className="py-4 px-6 font-medium text-slate-600 dark:text-slate-400">
                      {formatDateShort(item.createdAt)}
                    </td>

                    {/* Action Buttons */}
                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center gap-2">
                        {item.status === 'done' && (
                          <button
                            onClick={() => navigate(`/history/${item._id}`)}
                            className="inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 rounded-xl shadow-md shadow-violet-500/10 hover:shadow-violet-500/20 transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Leads</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleRunAgain(item)}
                          className="inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/60 rounded-xl transition cursor-pointer"
                          title="Run this prospecting search query again on the Dashboard"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Run Again</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchHistory;
