import React from 'react';
import type { Tech } from '../game/types';

interface TechPanelProps {
  techs: Tech[];
  purchased: string[];
  onPurchase: (id: string) => void;
  formatCash: (value: number) => string;
  cash: number;
}

export const TechPanel: React.FC<TechPanelProps> = ({ techs, purchased, onPurchase, formatCash, cash }) => {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg">
      <h2 className="text-lg font-semibold text-white">technology</h2>
      <p className="text-xs text-slate-400">invest in upgrades to speed up your empire.</p>
      <div className="mt-4 space-y-3">
        {techs.map((tech) => {
          const isPurchased = purchased.includes(tech.id);
          const affordable = cash >= tech.cost;
          return (
            <div
              key={tech.id}
              className="flex items-center justify-between rounded border border-slate-800 bg-slate-900/80 px-3 py-2"
            >
              <div>
                <p className="font-medium text-white">{tech.name}</p>
                <p className="text-xs text-slate-400">{tech.description}</p>
              </div>
              <button
                type="button"
                onClick={() => onPurchase(tech.id)}
                disabled={isPurchased || !affordable}
                className="rounded bg-slate-800 px-3 py-1 text-xs uppercase text-slate-200 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPurchased ? 'owned' : `buy (${formatCash(tech.cost)})`}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};
