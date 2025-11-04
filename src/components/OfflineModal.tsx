import React from 'react';
import type { OfflineReport } from '../game/types';

interface OfflineModalProps {
  open: boolean;
  report: OfflineReport | null;
  onClose: () => void;
  formatCash: (value: number) => string;
}

export const OfflineModal: React.FC<OfflineModalProps> = ({ open, report, onClose, formatCash }) => {
  if (!open || !report) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4">
      <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <h2 className="text-xl font-semibold text-white">welcome back</h2>
        <p className="text-sm text-slate-400">your ceos kept things running while you were away.</p>
        <div className="mt-4 max-h-64 overflow-y-auto space-y-2">
          {report.entries.map((entry) => (
            <div
              key={entry.propertyId}
              className="flex items-center justify-between rounded border border-slate-800/60 bg-slate-900/60 px-3 py-2 text-sm text-slate-200"
            >
              <div>
                <p className="font-medium">{entry.propertyName}</p>
                <p className="text-xs text-slate-400">cycles: {entry.cycles}</p>
              </div>
              <p className="font-semibold text-emerald-300">${formatCash(entry.cashEarned)}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-slate-200">total earned: ${formatCash(report.totalCash)}</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
          >
            claim cash
          </button>
        </div>
      </div>
    </div>
  );
};
