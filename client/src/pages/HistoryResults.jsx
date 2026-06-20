import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import placeService from '../services/placeService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import ResultsTable from '../components/ResultsTable';
import ExportButton from '../components/ExportButton';
import { ArrowLeft, Calendar, Search, Layers, Compass } from 'lucide-react';

const HistoryResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [historyItem, setHistoryItem] = useState(null);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await placeService.getHistoryResults(id);
        if (res.success) {
          setHistoryItem(res.data.history);
          // Map populated search result places
          const mappedPlaces = (res.data.results || [])
            .map(r => r.place)
            .filter(Boolean);
          setPlaces(mappedPlaces);
        } else {
          setError(res.message || 'Failed to load search results');
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load search results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [id]);

  const handleDelete = async (placeId) => {
    if (window.confirm('Are you sure you want to remove this place from database?')) {
      setDeletingId(placeId);
      try {
        const res = await placeService.deletePlace(placeId);
        if (res.success) {
          setPlaces(prev => prev.filter(p => p._id !== placeId));
          setSuccessMsg('Place removed successfully.');
          setTimeout(() => setSuccessMsg(''), 3000);
        } else {
          alert(res.message || 'Failed to delete place');
        }
      } catch (err) {
        alert(err.message || 'Error occurred while deleting place');
      } finally {
        setDeletingId(null);
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

  if (loading) {
    return <LoadingSpinner message="Loading search results..." />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate('/history')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to History
        </button>
        <ErrorMessage message={error} onClose={() => setError(null)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/history')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to History
      </button>

      {/* Header Info Card */}
      {historyItem && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-50 dark:bg-violet-950/40 border border-violet-100 dark:border-violet-900/40 rounded-full text-xs font-bold text-violet-600 dark:text-violet-400">
                <Search className="w-3.5 h-3.5" />
                <span>Search Query Log</span>
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-white flex flex-wrap items-center gap-2">
                <span>{historyItem.keyword}</span>
                <span className="text-slate-400 dark:text-slate-600 font-normal">in</span>
                <span>{historyItem.location}</span>
              </h2>
            </div>
            
            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{formatDateShort(historyItem.createdAt)}</span>
              </div>
              {historyItem.radius && (
                <div className="flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-slate-400" />
                  <span>{historyItem.radius / 1000} km radius</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/80">
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Leads Found</p>
              <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-1">{historyItem.resultsCount}</h4>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Newly Added</p>
              <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-1">{historyItem.newCount}</h4>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Duplicates Filtered</p>
              <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-1">{historyItem.duplicateCount}</h4>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Google API Calls</p>
              <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-1">{historyItem.apiCalls}</h4>
            </div>
          </div>
        </div>
      )}

      {/* Success notification banner */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-900/50 dark:text-emerald-300 rounded-xl text-sm font-semibold">
          {successMsg}
        </div>
      )}

      {/* Export Options */}
      <ExportButton filters={{ historyId: id }} />

      {/* Results Table Section */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Query Leads List ({places.length})
        </h3>
        {places.length > 0 ? (
          <ResultsTable 
            places={places} 
            onDelete={handleDelete} 
            deletingId={deletingId} 
          />
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm">
            <Layers className="w-8 h-8 text-slate-400 mx-auto mb-4" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">No leads associated with this search</h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">This query might have returned zero results or duplicates that were filtered out.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryResults;
