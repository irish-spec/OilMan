import React from 'react';
import type { PropertyBlueprint, PropertyState } from '../game/types';

interface PropertyCardProps {
  blueprint: PropertyBlueprint;
  state: PropertyState;
  payout: number;
  cycleTime: number;
  cash: number;
  nextCost: number;
  tenCost: number;
  canBulk: boolean;
  onBuyOne: () => void;
  onBuyTen: () => void;
  onBuyMax: () => void;
  onHireCEO: () => void;
  onTap: () => void;
}

const formatSeconds = (seconds: number): string => `${seconds.toFixed(2)}s`;

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(value);

export const PropertyCard: React.FC<PropertyCardProps> = ({
  blueprint,
  state,
  payout,
  cycleTime,
  cash,
  nextCost,
  tenCost,
  canBulk,
  onBuyOne,
  onBuyTen,
  onBuyMax,
  onHireCEO,
  onTap
}) => {
  const progressPercent = Math.min(100, Math.round(state.progress * 100));
  const ceoActive = state.hasCEO;
  const canHire = !ceoActive && cash >= blueprint.ceoCost;

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">{blueprint.name}</h3>
          <p className="text-xs text-slate-400">level {state.level}</p>
        </div>
        <div className="text-right text-sm text-slate-300">
          <p>payout: ${formatCurrency(payout)}</p>
          <p>cycle: {formatSeconds(cycleTime)}</p>
        </div>
      </div>
      <div
        className="mt-3 h-3 w-full cursor-pointer overflow-hidden rounded bg-slate-800"
        onClick={onTap}
      >
        <div
          className="h-full rounded bg-emerald-500 transition-all"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
        <span>{progressPercent}% progress</span>
        {ceoActive ? (
          <span className="rounded bg-emerald-600/80 px-2 py-0.5 text-xs text-white">CEO active</span>
        ) : (
          <button
            type="button"
            onClick={onHireCEO}
            disabled={!canHire}
            className="rounded bg-amber-500/20 px-2 py-0.5 text-amber-300 hover:bg-amber-500/30 disabled:cursor-not-allowed disabled:opacity-40"
          >
            hire ceo (${formatCurrency(blueprint.ceoCost)})
          </button>
        )}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-xs uppercase">
        <button
          type="button"
          onClick={onBuyOne}
          disabled={cash < nextCost}
          className="rounded bg-emerald-600/80 px-2 py-2 font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          buy 1 (${formatCurrency(nextCost)})
        </button>
        <button
          type="button"
          onClick={onBuyTen}
          disabled={!canBulk || cash < tenCost}
          className="rounded bg-emerald-600/60 px-2 py-2 font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          buy 10 (${formatCurrency(tenCost)})
        </button>
        <button
          type="button"
          onClick={onBuyMax}
          disabled={!canBulk}
          className="rounded bg-emerald-600/40 px-2 py-2 font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          buy max
        </button>
      </div>
    </div>
  );
};
