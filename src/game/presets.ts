import type { PropertyBlueprint, PropertyId, Tech, TechContext } from './types';

export const PROPERTY_BLUEPRINTS: PropertyBlueprint[] = [
  {
    id: 'gas-royalties',
    name: 'Gas Royalties',
    basePayout: 2,
    baseCost: 4,
    costGrowth: 1.15,
    baseTime: 2.5,
    baseMultiplier: 1,
    ceoCost: 1_000,
    tags: ['gas']
  },
  {
    id: 'oil-royalties',
    name: 'Oil Royalties',
    basePayout: 6,
    baseCost: 20,
    costGrowth: 1.16,
    baseTime: 3,
    baseMultiplier: 1,
    ceoCost: 5_000,
    tags: ['oil']
  },
  {
    id: 'gas-wells',
    name: 'Gas Wells',
    basePayout: 15,
    baseCost: 120,
    costGrowth: 1.18,
    baseTime: 4.2,
    baseMultiplier: 1,
    ceoCost: 25_000,
    tags: ['gas']
  },
  {
    id: 'oil-wells',
    name: 'Oil Wells',
    basePayout: 40,
    baseCost: 420,
    costGrowth: 1.2,
    baseTime: 6.5,
    baseMultiplier: 1,
    ceoCost: 150_000,
    tags: ['oil']
  },
  {
    id: 'offshore-rigs',
    name: 'Offshore Rigs',
    basePayout: 120,
    baseCost: 1_200,
    costGrowth: 1.22,
    baseTime: 9,
    baseMultiplier: 1,
    ceoCost: 750_000,
    tags: ['oil']
  },
  {
    id: 'refineries',
    name: 'Refineries',
    basePayout: 320,
    baseCost: 4_000,
    costGrowth: 1.24,
    baseTime: 12,
    baseMultiplier: 1,
    ceoCost: 2_500_000,
    tags: ['oil']
  }
];

export const TECH_LIST: Tech[] = [
  {
    id: 'pipeline-logistics',
    name: 'Pipeline Logistics',
    description: '+15% global income',
    cost: 25_000,
    apply: (context: TechContext) => ({
      ...context,
      globalMultiplier: context.globalMultiplier * 1.15
    })
  },
  {
    id: 'rig-automation',
    name: 'Rig Automation',
    description: '-10% cycle time for Oil Wells',
    cost: 60_000,
    apply: (context: TechContext) => ({
      ...context,
      propertyTimeModifiers: {
        ...context.propertyTimeModifiers,
        'oil-wells': (context.propertyTimeModifiers['oil-wells'] ?? 1) * 0.9
      }
    })
  },
  {
    id: 'advanced-drills',
    name: 'Advanced Drills',
    description: '+25% payout for Oil properties',
    cost: 95_000,
    apply: (context: TechContext) => {
      const oilTags: PropertyId[] = ['oil-royalties', 'oil-wells', 'offshore-rigs', 'refineries'];
      const propertyMultipliers = { ...context.propertyMultipliers };
      oilTags.forEach((id) => {
        propertyMultipliers[id] = (propertyMultipliers[id] ?? 1) * 1.25;
      });
      return {
        ...context,
        propertyMultipliers
      };
    }
  },
  {
    id: 'bulk-purchasing',
    name: 'Bulk Purchasing',
    description: 'unlock buy ×10 and buy max',
    cost: 10_000,
    apply: (context: TechContext) => ({
      ...context,
      bulkUnlocked: true
    })
  }
];

export const createDefaultTechContext = (): TechContext => ({
  globalMultiplier: 1,
  propertyMultipliers: {
    'gas-royalties': 1,
    'oil-royalties': 1,
    'gas-wells': 1,
    'oil-wells': 1,
    'offshore-rigs': 1,
    'refineries': 1
  },
  propertyTimeModifiers: {
    'gas-royalties': 1,
    'oil-royalties': 1,
    'gas-wells': 1,
    'oil-wells': 1,
    'offshore-rigs': 1,
    'refineries': 1
  },
  bulkUnlocked: false
});
