import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Hud } from './components/Hud';
import { OfflineModal } from './components/OfflineModal';
import { PropertyCard } from './components/PropertyCard';
import { ToastProvider, ToastStack, useToast } from './components/ToastProvider';
import { TechPanel } from './components/TechPanel';
import {
  advancePropertyCycle,
  applyOfflineIncome,
  buildTechContext,
  buyLevels,
  buyMaxLevels,
  buyTenLevels,
  canPrestige,
  calculateCashPerSecond,
  createInitialGameState,
  fromSaveGame,
  getPropertyCostForNextLevel,
  getPropertyCostForTen,
  getPropertyPayout,
  hireCEO,
  manualTap,
  prestige,
  purchaseTech,
  resolveManualPayout,
  toSaveGame,
  toggleNumberFormat,
  computeOfflineIncome
} from './game/logic';
import { calculateExperienceMultiplier } from './game/math';
import { CEO_PROGRESS_INTERVAL } from './game/constants';
import { PROPERTY_BLUEPRINTS, TECH_LIST } from './game/presets';
import type { OfflineReport, PropertyId } from './game/types';
import { loadGame, saveGame } from './game/save';
import { useSound } from './hooks/useSound';

const formatNumber = (value: number, mode: 'si' | 'scientific'): string => {
  if (!Number.isFinite(value)) {
    return '0';
  }
  if (mode === 'scientific') {
    return value.toExponential(2);
  }
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 2
  }).format(value);
};

const GameView: React.FC = () => {
  const [state, setState] = useState(createInitialGameState);
  const [offlineReport, setOfflineReport] = useState<OfflineReport | null>(null);
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const hasLoaded = useRef(false);
  const { push } = useToast();
  const sound = useSound();

  const techContext = useMemo(() => buildTechContext(state.purchasedTechIds), [state.purchasedTechIds]);
  const expMultiplier = useMemo(() => calculateExperienceMultiplier(state.experience), [state.experience]);
  const cashPerSecond = useMemo(() => calculateCashPerSecond(state, techContext), [state, techContext]);

  useEffect(() => {
    const save = loadGame();
    if (save) {
      const loaded = fromSaveGame(save);
      const context = buildTechContext(save.purchasedTechIds);
      const report = computeOfflineIncome(save, Date.now(), context);
      let hydrated = loaded;
      if (report.totalCash > 0) {
        hydrated = applyOfflineIncome(loaded, report);
        setOfflineReport(report);
        setShowOfflineModal(true);
        push(`offline earnings +$${formatNumber(report.totalCash, hydrated.settings.numberFormat)}`);
      }
      setState(hydrated);
      hasLoaded.current = true;
    } else {
      hasLoaded.current = true;
    }
  }, [push]);

  useEffect(() => {
    if (!hasLoaded.current) {
      return;
    }
    saveGame(toSaveGame(state));
  }, [state]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }
    const interval = window.setInterval(() => {
      let earned = 0;
      let mode: 'si' | 'scientific' = 'si';
      setState((prev) => {
        mode = prev.settings.numberFormat;
        let next = prev;
        const context = buildTechContext(prev.purchasedTechIds);
        for (const blueprint of PROPERTY_BLUEPRINTS) {
          const property = next.properties.find((item) => item.id === blueprint.id);
          if (!property || !property.hasCEO || property.level <= 0) {
            continue;
          }
          const result = advancePropertyCycle(next, blueprint.id, context);
          next = result.state;
          if (result.cashEarned > 0) {
            earned += result.cashEarned;
          }
        }
        return next;
      });
      if (earned > 0) {
        push(`+$${formatNumber(earned, mode)} from ceos`);
        sound.playPayout();
      }
    }, CEO_PROGRESS_INTERVAL * 1000);
    return () => {
      window.clearInterval(interval);
    };
  }, [push, sound]);

  const formatCash = (value: number) => formatNumber(value, state.settings.numberFormat);

  const handleBuyOne = (propertyId: PropertyId) => {
    setState((prev) => buyLevels(prev, propertyId, 1));
  };

  const handleBuyTen = (propertyId: PropertyId) => {
    setState((prev) => buyTenLevels(prev, propertyId));
  };

  const handleBuyMax = (propertyId: PropertyId) => {
    setState((prev) => buyMaxLevels(prev, propertyId));
  };

  const handleHireCEO = (propertyId: PropertyId) => {
    setState((prev) => {
      const updated = hireCEO(prev, propertyId);
      if (updated !== prev && updated.cash < prev.cash) {
        push('hired a ceo');
        sound.playUpgrade();
      }
      return updated;
    });
  };

  const handleTap = (propertyId: PropertyId) => {
    let payoutEarned = 0;
    let mode: 'si' | 'scientific' = state.settings.numberFormat;
    setState((prev) => {
      mode = prev.settings.numberFormat;
      const tapped = manualTap(prev, propertyId);
      const context = buildTechContext(tapped.purchasedTechIds);
      const property = tapped.properties.find((item) => item.id === propertyId);
      if (property && property.progress >= 1) {
        const result = resolveManualPayout(tapped, propertyId, context);
        payoutEarned = result.cashEarned;
        return result.state;
      }
      return tapped;
    });
    if (payoutEarned > 0) {
      push(`+$${formatNumber(payoutEarned, mode)}`);
      sound.playPayout();
    }
  };

  const handlePrestige = () => {
    const next = prestige(state);
    if (next !== state) {
      setState(next);
      push('prestige reset complete');
      sound.playPrestige();
    }
  };

  const handlePurchaseTech = (techId: string) => {
    setState((prev) => {
      const next = purchaseTech(prev, techId);
      if (next !== prev && next.cash < prev.cash) {
        push('tech acquired');
        sound.playUpgrade();
      }
      return next;
    });
  };

  const handleToggleFormat = () => {
    setState((prev) => toggleNumberFormat(prev));
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
      <Hud
        cash={formatCash(state.cash)}
        cashPerSecond={formatCash(cashPerSecond)}
        experience={state.experience}
        experienceMultiplier={expMultiplier}
        canPrestige={canPrestige(state)}
        onPrestige={handlePrestige}
        numberFormat={state.settings.numberFormat}
        onToggleFormat={handleToggleFormat}
      />
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          {PROPERTY_BLUEPRINTS.map((blueprint) => {
            const propertyState = state.properties.find((item) => item.id === blueprint.id)!;
            const payout = getPropertyPayout(state, blueprint.id, techContext);
            const cycleTime = techContext.propertyTimeModifiers[blueprint.id] * blueprint.baseTime;
            return (
              <PropertyCard
                key={blueprint.id}
                blueprint={blueprint}
                state={propertyState}
                payout={payout}
                cycleTime={cycleTime}
                cash={state.cash}
                nextCost={getPropertyCostForNextLevel(state, blueprint.id)}
                tenCost={getPropertyCostForTen(state, blueprint.id)}
                canBulk={techContext.bulkUnlocked}
                onBuyOne={() => handleBuyOne(blueprint.id)}
                onBuyTen={() => handleBuyTen(blueprint.id)}
                onBuyMax={() => handleBuyMax(blueprint.id)}
                onHireCEO={() => handleHireCEO(blueprint.id)}
                onTap={() => handleTap(blueprint.id)}
              />
            );
          })}
        </div>
        <TechPanel
          techs={TECH_LIST}
          purchased={state.purchasedTechIds}
          onPurchase={handlePurchaseTech}
          formatCash={formatCash}
          cash={state.cash}
        />
      </div>
      <OfflineModal
        open={showOfflineModal}
        report={offlineReport}
        onClose={() => setShowOfflineModal(false)}
        formatCash={formatCash}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <GameView />
      <ToastStack />
    </ToastProvider>
  );
};

export default App;
