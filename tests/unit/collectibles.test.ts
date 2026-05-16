import { describe, expect, it } from 'vitest'

import {
  applyCollectiblePickupEffect,
  COLLECTIBLE_KIND,
  resolveCollectiblePickup,
} from '@/collectibles'

describe('resolveCollectiblePickup', () => {
  it('grants score and a coin for coin pickups', () => {
    expect(resolveCollectiblePickup(COLLECTIBLE_KIND.coin)).toEqual({
      score: 200,
      coins: 1,
    })
  })

  it('upgrades the player to big with a mushroom', () => {
    expect(resolveCollectiblePickup(COLLECTIBLE_KIND.mushroom)).toEqual({
      score: 1000,
      coins: 0,
      powerState: 'big',
    })
  })

  it('upgrades the player to fire with a fire flower', () => {
    expect(resolveCollectiblePickup(COLLECTIBLE_KIND.fireFlower)).toEqual({
      score: 1000,
      coins: 0,
      powerState: 'fire',
    })
  })

  it('grants temporary invulnerability with a star', () => {
    const effect = resolveCollectiblePickup(COLLECTIBLE_KIND.star)

    expect(effect.score).toBe(1000)
    expect(effect.coins).toBe(0)
    expect(effect.starInvulnerabilityMs).toBeGreaterThan(0)
  })
})

describe('applyCollectiblePickupEffect', () => {
  it('applies coin pickups to score and coin targets without changing player power', () => {
    const calls = {
      addScore: [] as number[],
      addCoins: [] as number[],
      applyPowerState: [] as Array<'big' | 'fire'>,
      grantStarInvulnerability: [] as number[],
    }
    const effect = resolveCollectiblePickup(COLLECTIBLE_KIND.coin)

    applyCollectiblePickupEffect(effect, {
      scoreTarget: {
        addScore(points) {
          calls.addScore.push(points)
        },
        addCoins(amount) {
          calls.addCoins.push(amount)
        },
      },
      playerTarget: {
        applyPowerState(state) {
          calls.applyPowerState.push(state)
        },
        grantStarInvulnerability(durationMs) {
          calls.grantStarInvulnerability.push(durationMs)
        },
      },
    })

    expect(calls).toEqual({
      addScore: [200],
      addCoins: [1],
      applyPowerState: [],
      grantStarInvulnerability: [],
    })
  })

  it('applies mushrooms and fire flowers as score plus power upgrades', () => {
    const powerStates: Array<'big' | 'fire'> = []
    const scores: number[] = []

    for (const kind of [
      COLLECTIBLE_KIND.mushroom,
      COLLECTIBLE_KIND.fireFlower,
    ] as const) {
      applyCollectiblePickupEffect(resolveCollectiblePickup(kind), {
        scoreTarget: {
          addScore(points) {
            scores.push(points)
          },
          addCoins() {},
        },
        playerTarget: {
          applyPowerState(state) {
            powerStates.push(state)
          },
          grantStarInvulnerability() {},
        },
      })
    }

    expect(scores).toEqual([1000, 1000])
    expect(powerStates).toEqual(['big', 'fire'])
  })

  it('applies stars as score plus temporary invulnerability', () => {
    const effect = resolveCollectiblePickup(COLLECTIBLE_KIND.star)
    const scores: number[] = []
    const starDurations: number[] = []

    applyCollectiblePickupEffect(effect, {
      scoreTarget: {
        addScore(points) {
          scores.push(points)
        },
        addCoins() {},
      },
      playerTarget: {
        applyPowerState() {},
        grantStarInvulnerability(durationMs) {
          starDurations.push(durationMs)
        },
      },
    })

    expect(scores).toEqual([1000])
    expect(starDurations).toEqual([effect.starInvulnerabilityMs ?? 0])
  })
})
