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
