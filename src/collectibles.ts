import { GAME_CONFIG } from '@/config'

export const COLLECTIBLE_KIND = {
  coin: 'coin',
  mushroom: 'mushroom',
  fireFlower: 'fire-flower',
  star: 'star',
} as const

export type CollectibleKind =
  (typeof COLLECTIBLE_KIND)[keyof typeof COLLECTIBLE_KIND]

export interface CollectiblePickupEffect {
  score: number
  coins: number
  powerState?: 'big' | 'fire'
  starInvulnerabilityMs?: number
}

export interface CollectibleEffectScoreTarget {
  addScore(points: number): unknown
  addCoins(amount: number): unknown
}

export interface CollectibleEffectPlayerTarget {
  applyPowerState(state: 'big' | 'fire'): unknown
  grantStarInvulnerability(durationMs: number): unknown
}

export function resolveCollectiblePickup(
  kind: CollectibleKind,
): CollectiblePickupEffect {
  switch (kind) {
    case COLLECTIBLE_KIND.coin:
      return {
        score: 200,
        coins: 1,
      }
    case COLLECTIBLE_KIND.mushroom:
      return {
        score: 1000,
        coins: 0,
        powerState: 'big',
      }
    case COLLECTIBLE_KIND.fireFlower:
      return {
        score: 1000,
        coins: 0,
        powerState: 'fire',
      }
    case COLLECTIBLE_KIND.star:
      return {
        score: 1000,
        coins: 0,
        starInvulnerabilityMs: GAME_CONFIG.player.starInvulnerabilityDurationMs,
      }
  }
}

export function applyCollectiblePickupEffect(
  effect: CollectiblePickupEffect,
  dependencies: {
    scoreTarget: CollectibleEffectScoreTarget
    playerTarget: CollectibleEffectPlayerTarget
  },
): void {
  dependencies.scoreTarget.addScore(effect.score)

  if (effect.coins > 0) {
    dependencies.scoreTarget.addCoins(effect.coins)
  }

  if (effect.powerState !== undefined) {
    dependencies.playerTarget.applyPowerState(effect.powerState)
  }

  if (effect.starInvulnerabilityMs !== undefined) {
    dependencies.playerTarget.grantStarInvulnerability(
      effect.starInvulnerabilityMs,
    )
  }
}
