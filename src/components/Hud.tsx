import React from 'react';

interface HudProps {
  cash: string;
  cashPerSecond: string;
  experience: number;
  experienceMultiplier: number;
  canPrestige: boolean;
  onPrestige: () => void;
  numberFormat: 'si' | 'scientific';
  onToggleFormat: () => void;
}

export const Hud: React.FC<HudProps> = ({
  cash,
  cashPerSecond,
  experience,
  experienceMultiplier,
  canPrestige,
  onPrestige,
  numberFormat,
  onToggleFormat
}) => {
  return (
    <header className="sticky top-0 z-40 mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg backdrop-blur">
      <div>
        <p className="text-xl font-semibold text-white">${cash}</p>
        <p className="text-xs uppercase text-slate-400">cash on hand</p>
      </div>
      <div>
        <p className="text-sm text-emerald-300">${cashPerSecond} / sec</p>
        <p className="text-xs uppercase text-slate-400">ceo income</p>
      </div>
      <div>
        <p className="text-sm text-sky-300">exp: {experience}</p>
        <p className="text-xs uppercase text-slate-400">multiplier ×{experienceMultiplier.toFixed(2)}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleFormat}
          className="rounded bg-slate-800 px-3 py-2 text-xs uppercase text-slate-200 hover:bg-slate-700"
        >
          numbers: {numberFormat}
        </button>
        <button
          type="button"
          onClick={onPrestige}
          disabled={!canPrestige}
          className="rounded bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          prestige
        </button>
      </div>
    </header>
  );
};
