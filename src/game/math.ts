import { MILESTONE_CADENCE, MILESTONE_MULTIPLIER, EXPERIENCE_LOG_BASE } from './constants';
import type { PropertyBlueprint, TechContext } from './types';

export const calculateMilestoneMultiplier = (level: number): number => {
  if (level <= 0) {
    return 1;
  }
  const milestones = Math.floor(level / MILESTONE_CADENCE);
  return Math.pow(MILESTONE_MULTIPLIER, milestones);
};

export const calculateExperienceMultiplier = (experience: number): number => {
  if (experience <= 0) {
    return 1;
  }
  const logBase = Math.log(EXPERIENCE_LOG_BASE);
  return Math.pow(2, Math.log(Math.max(experience, 1)) / logBase);
};

export const calculatePropertyMultiplier = (
  level: number,
  blueprint: PropertyBlueprint,
  context: TechContext,
  globalMultiplier: number
): number => {
  const milestoneMultiplier = calculateMilestoneMultiplier(level);
  const techMultiplier = context.propertyMultipliers[blueprint.id] ?? 1;
  return blueprint.baseMultiplier * milestoneMultiplier * techMultiplier * globalMultiplier;
};

export const calculatePayout = (
  level: number,
  blueprint: PropertyBlueprint,
  context: TechContext,
  globalMultiplier: number
): number => {
  if (level <= 0) {
    return 0;
  }
  return blueprint.basePayout * level * calculatePropertyMultiplier(level, blueprint, context, globalMultiplier);
};

export const calculateLevelCost = (blueprint: PropertyBlueprint, level: number): number => {
  return blueprint.baseCost * Math.pow(blueprint.costGrowth, level);
};

export const calculateBulkCost = (
  blueprint: PropertyBlueprint,
  startLevel: number,
  levelsToBuy: number
): number => {
  let total = 0;
  for (let i = 0; i < levelsToBuy; i += 1) {
    total += calculateLevelCost(blueprint, startLevel + i);
  }
  return total;
};

export const calculateEffectiveTime = (
  blueprint: PropertyBlueprint,
  context: TechContext
): number => {
  const modifier = context.propertyTimeModifiers[blueprint.id] ?? 1;
  return blueprint.baseTime * modifier;
};

export const calculateOfflineCycles = (deltaSeconds: number, cycleTime: number): number => {
  if (cycleTime <= 0) {
    return 0;
  }
  return Math.floor(deltaSeconds / cycleTime);
};
