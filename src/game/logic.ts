import {
  BASE_TAP_PROGRESS,
  PRESTIGE_MIN_LEVEL,
  CEO_PROGRESS_INTERVAL
} from './constants';
import {
  calculateBulkCost,
  calculateEffectiveTime,
  calculateExperienceMultiplier,
  calculateLevelCost,
  calculateOfflineCycles,
  calculatePayout
} from './math';
import { createDefaultTechContext, PROPERTY_BLUEPRINTS, TECH_LIST } from './presets';
import type {
  OfflineReport,
  PropertyBlueprint,
  PropertyId,
  PropertyState,
  SaveGame,
  TechContext
} from './types';

export interface GameState {
  cash: number;
  experience: number;
  properties: PropertyState[];
  purchasedTechIds: string[];
  settings: {
    numberFormat: 'si' | 'scientific';
  };
}

const findBlueprint = (propertyId: PropertyId): PropertyBlueprint => {
  const blueprint = PROPERTY_BLUEPRINTS.find((item) => item.id === propertyId);
  if (!blueprint) {
    throw new Error(`missing blueprint for ${propertyId}`);
  }
  return blueprint;
};

export const createInitialGameState = (): GameState => ({
  cash: 50,
  experience: 0,
  properties: PROPERTY_BLUEPRINTS.map((blueprint) => ({
    id: blueprint.id,
    level: 0,
    progress: 0,
    hasCEO: false
  })),
  purchasedTechIds: [],
  settings: {
    numberFormat: 'si'
  }
});

export const buildTechContext = (purchasedTechIds: string[]): TechContext => {
  return purchasedTechIds.reduce((context, techId) => {
    const tech = TECH_LIST.find((item) => item.id === techId);
    if (!tech) {
      return context;
    }
    return tech.apply(context);
  }, createDefaultTechContext());
};

export const getEffectiveGlobalMultiplier = (
  experience: number,
  techContext: TechContext
): number => {
  return calculateExperienceMultiplier(experience) * techContext.globalMultiplier;
};

export const buyLevels = (
  state: GameState,
  propertyId: PropertyId,
  levels: number
): GameState => {
  if (levels <= 0) {
    return state;
  }
  const blueprint = findBlueprint(propertyId);
  const property = state.properties.find((item) => item.id === propertyId);
  if (!property) {
    return state;
  }
  let totalCost = 0;
  let purchasable = 0;
  for (let i = 0; i < levels; i += 1) {
    const price = calculateLevelCost(blueprint, property.level + i);
    if (state.cash >= totalCost + price) {
      totalCost += price;
      purchasable += 1;
    } else {
      break;
    }
  }
  if (purchasable === 0) {
    return state;
  }
  const updatedProperties = state.properties.map((item) =>
    item.id === propertyId
      ? {
          ...item,
          level: item.level + purchasable
        }
      : item
  );
  return {
    ...state,
    cash: state.cash - totalCost,
    properties: updatedProperties
  };
};

export const buyTenLevels = (state: GameState, propertyId: PropertyId): GameState => {
  return buyLevels(state, propertyId, 10);
};

export const buyMaxLevels = (state: GameState, propertyId: PropertyId): GameState => {
  const blueprint = findBlueprint(propertyId);
  const property = state.properties.find((item) => item.id === propertyId);
  if (!property) {
    return state;
  }
  let totalCost = 0;
  let purchasable = 0;
  while (true) {
    const price = calculateLevelCost(blueprint, property.level + purchasable);
    if (state.cash >= totalCost + price) {
      totalCost += price;
      purchasable += 1;
    } else {
      break;
    }
  }
  if (purchasable === 0) {
    return state;
  }
  const updatedState = buyLevels(state, propertyId, purchasable);
  return updatedState;
};

export const hireCEO = (state: GameState, propertyId: PropertyId): GameState => {
  const blueprint = findBlueprint(propertyId);
  const property = state.properties.find((item) => item.id === propertyId);
  if (!property || property.hasCEO) {
    return state;
  }
  if (state.cash < blueprint.ceoCost) {
    return state;
  }
  const updatedProperties = state.properties.map((item) =>
    item.id === propertyId
      ? {
          ...item,
          hasCEO: true
        }
      : item
  );
  return {
    ...state,
    cash: state.cash - blueprint.ceoCost,
    properties: updatedProperties
  };
};

export const manualTap = (state: GameState, propertyId: PropertyId): GameState => {
  const property = state.properties.find((item) => item.id === propertyId);
  if (!property || property.hasCEO) {
    return state;
  }
  const updatedProperties = state.properties.map((item) =>
    item.id === propertyId
      ? {
          ...item,
          progress: Math.min(1, item.progress + BASE_TAP_PROGRESS)
        }
      : item
  );
  return {
    ...state,
    properties: updatedProperties
  };
};

interface TickResult {
  state: GameState;
  cashEarned: number;
}

export const advancePropertyCycle = (
  state: GameState,
  propertyId: PropertyId,
  techContext: TechContext
): TickResult => {
  const blueprint = findBlueprint(propertyId);
  const property = state.properties.find((item) => item.id === propertyId);
  if (!property || property.level <= 0) {
    return { state, cashEarned: 0 };
  }
  let cashEarned = 0;
  const updatedProperties = state.properties.map((item) => {
    if (item.id !== propertyId) {
      return item;
    }
    let progress = item.progress;
    if (item.hasCEO) {
      const cycleTime = calculateEffectiveTime(blueprint, techContext);
      progress += CEO_PROGRESS_INTERVAL / cycleTime;
    }
    if (progress >= 1) {
      const globalMultiplier = getEffectiveGlobalMultiplier(state.experience, techContext);
      cashEarned = calculatePayout(item.level, blueprint, techContext, globalMultiplier);
      return {
        ...item,
        progress: progress - 1
      };
    }
    return {
      ...item,
      progress
    };
  });
  return {
    state: {
      ...state,
      cash: state.cash + cashEarned,
      properties: updatedProperties
    },
    cashEarned
  };
};

export const resolveManualPayout = (
  state: GameState,
  propertyId: PropertyId,
  techContext: TechContext
): TickResult => {
  const blueprint = findBlueprint(propertyId);
  const property = state.properties.find((item) => item.id === propertyId);
  if (!property || property.level <= 0 || property.progress < 1) {
    return { state, cashEarned: 0 };
  }
  const globalMultiplier = getEffectiveGlobalMultiplier(state.experience, techContext);
  const payout = calculatePayout(property.level, blueprint, techContext, globalMultiplier);
  const updatedProperties = state.properties.map((item) =>
    item.id === propertyId
      ? {
          ...item,
          progress: item.progress - 1
        }
      : item
  );
  return {
    state: {
      ...state,
      cash: state.cash + payout,
      properties: updatedProperties
    },
    cashEarned: payout
  };
};

export const computeOfflineIncome = (
  save: SaveGame,
  now: number,
  techContext: TechContext
): OfflineReport => {
  const elapsedSeconds = (now - save.lastSavedAt) / 1000;
  if (elapsedSeconds <= 0) {
    return { totalCash: 0, entries: [] };
  }
  const globalMultiplier = getEffectiveGlobalMultiplier(save.experience, techContext);
  const entries = save.properties.map((property) => {
    const blueprint = findBlueprint(property.id);
    if (!property.hasCEO || property.level <= 0) {
      return {
        propertyId: property.id,
        propertyName: blueprint.name,
        cycles: 0,
        cashEarned: 0
      };
    }
    const cycleTime = calculateEffectiveTime(blueprint, techContext);
    const cycles = calculateOfflineCycles(elapsedSeconds, cycleTime);
    const payout = calculatePayout(property.level, blueprint, techContext, globalMultiplier);
    return {
      propertyId: property.id,
      propertyName: blueprint.name,
      cycles,
      cashEarned: cycles * payout
    };
  });
  const totalCash = entries.reduce((sum, entry) => sum + entry.cashEarned, 0);
  return {
    totalCash,
    entries
  };
};

export const applyOfflineIncome = (state: GameState, report: OfflineReport): GameState => {
  return {
    ...state,
    cash: state.cash + report.totalCash
  };
};

export const prestige = (state: GameState): GameState => {
  const totalLevels = state.properties.reduce((sum, property) => sum + property.level, 0);
  const canPrestige = totalLevels >= PRESTIGE_MIN_LEVEL;
  if (!canPrestige) {
    return state;
  }
  const experienceGain = Math.floor(totalLevels / PRESTIGE_MIN_LEVEL) || 1;
  return {
    ...state,
    cash: 50,
    experience: state.experience + experienceGain,
    properties: state.properties.map((property) => ({
      ...property,
      level: 0,
      progress: 0,
      hasCEO: false
    }))
  };
};

export const toggleNumberFormat = (state: GameState): GameState => ({
  ...state,
  settings: {
    numberFormat: state.settings.numberFormat === 'si' ? 'scientific' : 'si'
  }
});

export const toSaveGame = (state: GameState): SaveGame => ({
  version: 1,
  cash: state.cash,
  experience: state.experience,
  properties: state.properties.map((property) => ({ ...property })),
  purchasedTechIds: [...state.purchasedTechIds],
  lastSavedAt: Date.now(),
  settings: { ...state.settings }
});

export const fromSaveGame = (save: SaveGame): GameState => ({
  cash: save.cash,
  experience: save.experience,
  properties: PROPERTY_BLUEPRINTS.map((blueprint) => {
    const saved = save.properties.find((item) => item.id === blueprint.id);
    return (
      saved ?? {
        id: blueprint.id,
        level: 0,
        progress: 0,
        hasCEO: false
      }
    );
  }),
  purchasedTechIds: [...save.purchasedTechIds],
  settings: save.settings
});

export const purchaseTech = (state: GameState, techId: string): GameState => {
  if (state.purchasedTechIds.includes(techId)) {
    return state;
  }
  const tech = TECH_LIST.find((item) => item.id === techId);
  if (!tech || state.cash < tech.cost) {
    return state;
  }
  if (tech.prerequisite && !state.purchasedTechIds.includes(tech.prerequisite)) {
    return state;
  }
  return {
    ...state,
    cash: state.cash - tech.cost,
    purchasedTechIds: [...state.purchasedTechIds, techId]
  };
};

export const calculateCashPerSecond = (
  state: GameState,
  techContext: TechContext
): number => {
  const globalMultiplier = getEffectiveGlobalMultiplier(state.experience, techContext);
  return state.properties.reduce((sum, property) => {
    if (!property.hasCEO || property.level <= 0) {
      return sum;
    }
    const blueprint = findBlueprint(property.id);
    const payout = calculatePayout(property.level, blueprint, techContext, globalMultiplier);
    const cycleTime = calculateEffectiveTime(blueprint, techContext);
    return sum + payout / cycleTime;
  }, 0);
};

export const canPrestige = (state: GameState): boolean => {
  const totalLevels = state.properties.reduce((sum, property) => sum + property.level, 0);
  return totalLevels >= PRESTIGE_MIN_LEVEL;
};

export const getPropertyPayout = (
  state: GameState,
  propertyId: PropertyId,
  techContext: TechContext
): number => {
  const blueprint = findBlueprint(propertyId);
  const property = state.properties.find((item) => item.id === propertyId);
  if (!property) {
    return 0;
  }
  const globalMultiplier = getEffectiveGlobalMultiplier(state.experience, techContext);
  return calculatePayout(property.level, blueprint, techContext, globalMultiplier);
};

export const getPropertyCostForNextLevel = (
  state: GameState,
  propertyId: PropertyId
): number => {
  const blueprint = findBlueprint(propertyId);
  const property = state.properties.find((item) => item.id === propertyId);
  if (!property) {
    return 0;
  }
  return calculateLevelCost(blueprint, property.level);
};

export const getPropertyCostForTen = (
  state: GameState,
  propertyId: PropertyId
): number => {
  const blueprint = findBlueprint(propertyId);
  const property = state.properties.find((item) => item.id === propertyId);
  if (!property) {
    return 0;
  }
  return calculateBulkCost(blueprint, property.level, 10);
};
