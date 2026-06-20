import { useState } from 'react';
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import placeService from '../services/placeService';

const ExportButton = ({ filters = {} }) => {
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  const handleExportCsv = async () => {
    if (isExportingCsv || isExportingExcel) return;
    setIsExportingCsv(true);
    try {
      const blob = await placeService.exportCsv(filters);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `places-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    } finally {
      setIsExportingCsv(false);
    }
  };

  const handleExportExcel = async () => {
    if (isExportingCsv || isExportingExcel) return;
    setIsExportingExcel(true);
    try {
      const blob = await placeService.exportExcel(filters);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `places-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting Excel:', error);
    } finally {
      setIsExportingExcel(false);
    }
  };

  const isAnyExporting = isExportingCsv || isExportingExcel;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm my-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400 rounded-xl">
          <Download className="w-5 h-5" />
        </div>
        <div className="text-center sm:text-left">
          <h4 className="text-sm font-bold text-slate-800 dark:text-white">
            Export Intelligence Data
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Download current search results directly as spreadsheet files.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto">
        <button
          onClick={handleExportCsv}
          disabled={isAnyExporting}
          className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 rounded-xl transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExportingCsv ? (
            <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />
          ) : (
            <FileText className="w-4 h-4 text-slate-500" />
          )}
          <span>{isExportingCsv ? 'Exporting...' : 'Export CSV'}</span>
        </button>

        <button
          onClick={handleExportExcel}
          disabled={isAnyExporting}
          className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 rounded-xl shadow-md shadow-violet-500/10 hover:shadow-violet-500/20 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExportingExcel ? (
            <Loader2 className="w-4 h-4 text-white animate-spin" />
          ) : (
            <FileSpreadsheet className="w-4 h-4" />
          )}
          <span>{isExportingExcel ? 'Exporting...' : 'Export Excel'}</span>
        </button>
      </div>
    </div>
  );
};

export default ExportButton;

