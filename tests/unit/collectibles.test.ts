import { describe, expect, it } from 'vitest'

import {
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
