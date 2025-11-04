import { describe, expect, it } from 'vitest';
import { CEO_PROGRESS_INTERVAL } from '../../game/constants';
import {
  advancePropertyCycle,
  applyOfflineIncome,
  buildTechContext,
  computeOfflineIncome,
  createInitialGameState,
  getPropertyPayout,
  hireCEO,
  manualTap,
  prestige,
  resolveManualPayout
} from '../../game/logic';
import { PROPERTY_BLUEPRINTS } from '../../game/presets';
import { calculateExperienceMultiplier } from '../../game/math';

const blueprint = PROPERTY_BLUEPRINTS[0];

const levelUp = (state = createInitialGameState(), level = 1) => ({
  ...state,
  properties: state.properties.map((item) =>
    item.id === blueprint.id
      ? {
          ...item,
          level,
          hasCEO: false,
          progress: 0
        }
      : item
  )
});

describe('core game loops', () => {
  it('no taps and no ceo means no income', () => {
    const state = levelUp(undefined, 1);
    const context = buildTechContext(state.purchasedTechIds);
    const result = advancePropertyCycle(state, blueprint.id, context);
    expect(result.state.cash).toBe(state.cash);
    expect(result.cashEarned).toBe(0);
  });

  it('manual tap to 100% pays exactly once', () => {
    let state = levelUp(undefined, 1);
    const context = buildTechContext(state.purchasedTechIds);
    state = manualTap(state, blueprint.id);
    state = manualTap(state, blueprint.id);
    state = manualTap(state, blueprint.id);
    state = manualTap(state, blueprint.id);
    const resolved = resolveManualPayout(state, blueprint.id, context);
    expect(resolved.cashEarned).toBeGreaterThan(0);
    expect(resolved.state.cash - state.cash).toBe(resolved.cashEarned);
    const afterSecond = resolveManualPayout(resolved.state, blueprint.id, context);
    expect(afterSecond.cashEarned).toBe(0);
  });

  it('ceo auto cycles generate predictable cash', () => {
    let state = levelUp(undefined, 1);
    state = {
      ...state,
      cash: 1_000_000
    };
    state = hireCEO(state, blueprint.id);
    const context = buildTechContext(state.purchasedTechIds);
    const payout = getPropertyPayout(state, blueprint.id, context);
    const cycleTime = blueprint.baseTime * context.propertyTimeModifiers[blueprint.id];
    const ticksPerCycle = Math.ceil(cycleTime / CEO_PROGRESS_INTERVAL);
    let totalEarned = 0;
    for (let i = 0; i < ticksPerCycle * 3; i += 1) {
      const result = advancePropertyCycle(state, blueprint.id, context);
      state = result.state;
      totalEarned += result.cashEarned;
    }
    expect(totalEarned).toBeCloseTo(payout * 3, 6);
  });

  it('offline income only counts ceo properties', () => {
    let state = levelUp(undefined, 1);
    state = {
      ...state,
      cash: 1_000_000
    };
    state = hireCEO(state, blueprint.id);
    const save = {
      version: 1,
      cash: state.cash,
      experience: state.experience,
      properties: state.properties,
      purchasedTechIds: state.purchasedTechIds,
      lastSavedAt: Date.now() - 600_000,
      settings: state.settings
    };
    const context = buildTechContext(state.purchasedTechIds);
    const report = computeOfflineIncome(save, Date.now(), context);
    expect(report.totalCash).toBeGreaterThan(0);
    const applied = applyOfflineIncome(state, report);
    expect(applied.cash).toBe(state.cash + report.totalCash);
  });

  it('offline income is zero without ceo', () => {
    const state = levelUp(undefined, 1);
    const save = {
      version: 1,
      cash: state.cash,
      experience: state.experience,
      properties: state.properties,
      purchasedTechIds: state.purchasedTechIds,
      lastSavedAt: Date.now() - 600_000,
      settings: state.settings
    };
    const context = buildTechContext(state.purchasedTechIds);
    const report = computeOfflineIncome(save, Date.now(), context);
    expect(report.totalCash).toBe(0);
  });

  it('prestige grants multiplier and resets roster', () => {
    const state = levelUp(undefined, 200);
    const before = calculateExperienceMultiplier(state.experience);
    const prestiged = prestige({
      ...state,
      properties: state.properties.map((property) => ({
        ...property,
        level: 200,
        hasCEO: true
      }))
    });
    const after = calculateExperienceMultiplier(prestiged.experience);
    expect(after).toBeGreaterThan(before);
    expect(prestiged.properties.every((property) => property.level === 0 && !property.hasCEO)).toBe(true);
  });
});
