export type PropertyId =
  | 'gas-royalties'
  | 'oil-royalties'
  | 'gas-wells'
  | 'oil-wells'
  | 'offshore-rigs'
  | 'refineries';

export interface PropertyBlueprint {
  id: PropertyId;
  name: string;
  basePayout: number; // B_i
  baseCost: number; // C_i
  costGrowth: number; // r_i
  baseTime: number; // T_i in seconds
  baseMultiplier: number;
  ceoCost: number;
  tags: string[];
}

export interface PropertyState {
  id: PropertyId;
  level: number;
  progress: number; // 0-1 progress bar
  hasCEO: boolean;
}

export interface Tech {
  id: string;
  name: string;
  description: string;
  cost: number;
  apply: (context: TechContext) => TechContext;
  prerequisite?: string;
}

export interface TechState {
  id: string;
  purchased: boolean;
}

export interface TechContext {
  globalMultiplier: number;
  propertyMultipliers: Record<PropertyId, number>;
  propertyTimeModifiers: Record<PropertyId, number>;
  bulkUnlocked: boolean;
}

export interface SavePropertyState {
  id: PropertyId;
  level: number;
  progress: number;
  hasCEO: boolean;
}

export interface SaveGame {
  version: number;
  cash: number;
  experience: number;
  properties: SavePropertyState[];
  purchasedTechIds: string[];
  lastSavedAt: number;
  settings: {
    numberFormat: 'si' | 'scientific';
  };
}

export interface OfflineReportEntry {
  propertyId: PropertyId;
  propertyName: string;
  cycles: number;
  cashEarned: number;
}

export interface OfflineReport {
  totalCash: number;
  entries: OfflineReportEntry[];
}
