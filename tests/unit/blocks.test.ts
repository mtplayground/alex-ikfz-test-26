import { describe, expect, it } from 'vitest'

import { resolveBlockHit, TILE_INDEX } from '@/blocks'

describe('resolveBlockHit', () => {
  it('lets small players bump bricks without breaking them', () => {
    expect(resolveBlockHit(TILE_INDEX.brick, 'small')).toEqual({
      action: 'bounce',
    })
  })

  it('lets powered players break bricks', () => {
    expect(resolveBlockHit(TILE_INDEX.brick, 'big')).toEqual({
      action: 'break',
      nextTileIndex: TILE_INDEX.empty,
    })
    expect(resolveBlockHit(TILE_INDEX.brick, 'fire')).toEqual({
      action: 'break',
      nextTileIndex: TILE_INDEX.empty,
    })
  })

  it('reveals a coin from coin question blocks and replaces them', () => {
    expect(resolveBlockHit(TILE_INDEX.questionCoin, 'small')).toEqual({
      action: 'reveal-coin',
      nextTileIndex: TILE_INDEX.groundB,
    })
  })

  it('reveals a powerup from power question blocks and replaces them', () => {
    expect(resolveBlockHit(TILE_INDEX.questionPowerup, 'small')).toEqual({
      action: 'reveal-powerup',
      nextTileIndex: TILE_INDEX.groundB,
    })
  })

  it('ignores non-interactive tiles', () => {
    expect(resolveBlockHit(TILE_INDEX.pipeBody, 'big')).toEqual({
      action: 'none',
    })
  })
})
