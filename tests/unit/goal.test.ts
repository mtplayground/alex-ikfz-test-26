import { describe, expect, it } from 'vitest'

import { resolveFlagpoleBonus, resolveNextStage } from '@/goal'

describe('resolveFlagpoleBonus', () => {
  it('awards the highest bonus near the top of the pole', () => {
    expect(resolveFlagpoleBonus(0.05)).toBe(5000)
  })

  it('steps down through lower bonus bands', () => {
    expect(resolveFlagpoleBonus(0.3)).toBe(2000)
    expect(resolveFlagpoleBonus(0.6)).toBe(800)
    expect(resolveFlagpoleBonus(0.95)).toBe(400)
  })

  it('clamps values outside the normalized range', () => {
    expect(resolveFlagpoleBonus(-1)).toBe(5000)
    expect(resolveFlagpoleBonus(9)).toBe(400)
  })
})

describe('resolveNextStage', () => {
  it('returns the next configured stage when available', () => {
    expect(resolveNextStage(['1-1', '1-2'], '1-1')).toBe('1-2')
  })

  it('returns null on the final configured stage', () => {
    expect(resolveNextStage(['1-1', '1-2'], '1-2')).toBeNull()
  })
})
