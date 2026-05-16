import { describe, expect, it } from 'vitest'

import {
  resolveDamageState,
  resolvePowerStateUpgrade,
  type PlayerLifeState,
} from '@/entities/player/playerState'

describe('player state upgrades', () => {
  it('upgrades small to big', () => {
    expect(resolvePowerStateUpgrade('small', 'big')).toBe('big')
  })

  it('upgrades any living state to fire', () => {
    expect(resolvePowerStateUpgrade('small', 'fire')).toBe('fire')
    expect(resolvePowerStateUpgrade('big', 'fire')).toBe('fire')
  })

  it('does not downgrade or revive through the upgrade helper', () => {
    expect(resolvePowerStateUpgrade('fire', 'big')).toBe('fire')
    expect(resolvePowerStateUpgrade('dead', 'fire')).toBe('dead')
  })
})

describe('player damage transitions', () => {
  it('walks the full damage downgrade chain from fire to death', () => {
    const visitedStates: PlayerLifeState[] = []
    let currentState: PlayerLifeState = 'fire'

    while (currentState !== 'dead') {
      const result = resolveDamageState(currentState, false)

      expect(result.accepted).toBe(true)
      visitedStates.push(result.nextState)
      currentState = result.nextState
    }

    expect(visitedStates).toEqual(['big', 'small', 'dead'])
  })

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

  it('keeps dead players dead when damage is processed again', () => {
    expect(resolveDamageState('dead', false)).toEqual({
      accepted: false,
      defeated: true,
      nextState: 'dead',
      grantsInvulnerability: false,
    })
  })
})
