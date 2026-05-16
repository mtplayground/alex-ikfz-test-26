import { describe, expect, it } from 'vitest'

import {
  resolveDamageState,
  resolvePowerStateUpgrade,
} from '@/entities/player/playerState'

describe('player state upgrades', () => {
  it('upgrades small to big', () => {
    expect(resolvePowerStateUpgrade('small', 'big')).toBe('big')
  })

  it('upgrades any living state to fire', () => {
    expect(resolvePowerStateUpgrade('small', 'fire')).toBe('fire')
    expect(resolvePowerStateUpgrade('big', 'fire')).toBe('fire')
  })
})

describe('player damage transitions', () => {
  it('downgrades fire to big and grants invulnerability', () => {
    expect(resolveDamageState('fire', false)).toEqual({
      accepted: true,
      defeated: false,
      nextState: 'big',
      grantsInvulnerability: true,
    })
  })

  it('downgrades big to small and grants invulnerability', () => {
    expect(resolveDamageState('big', false)).toEqual({
      accepted: true,
      defeated: false,
      nextState: 'small',
      grantsInvulnerability: true,
    })
  })

  it('defeats small form on damage', () => {
    expect(resolveDamageState('small', false)).toEqual({
      accepted: true,
      defeated: true,
      nextState: 'dead',
      grantsInvulnerability: false,
    })
  })

  it('ignores damage while invulnerable', () => {
    expect(resolveDamageState('big', true)).toEqual({
      accepted: false,
      defeated: false,
      nextState: 'big',
      grantsInvulnerability: false,
    })
  })
})
