import type { PlayerLifeState } from '@/entities/player/playerState'

export const TILE_INDEX = {
  empty: 0,
  groundA: 1,
  groundB: 2,
  questionCoin: 3,
  brick: 4,
  questionPowerup: 5,
  pipeBody: 6,
  pipeTop: 7,
} as const

export type BlockHitAction =
  | 'none'
  | 'bounce'
  | 'break'
  | 'reveal-coin'
  | 'reveal-powerup'

export interface BlockHitResolution {
  action: BlockHitAction
  nextTileIndex?: number
}

export function resolveBlockHit(
  tileIndex: number,
  playerPowerState: PlayerLifeState,
): BlockHitResolution {
  if (tileIndex === TILE_INDEX.brick) {
    if (playerPowerState === 'big' || playerPowerState === 'fire') {
      return { action: 'break', nextTileIndex: TILE_INDEX.empty }
    }

    return { action: 'bounce' }
  }

  if (tileIndex === TILE_INDEX.questionCoin) {
    return {
      action: 'reveal-coin',
      nextTileIndex: TILE_INDEX.groundB,
    }
  }

  if (tileIndex === TILE_INDEX.questionPowerup) {
    return {
      action: 'reveal-powerup',
      nextTileIndex: TILE_INDEX.groundB,
    }
  }

  return { action: 'none' }
}
