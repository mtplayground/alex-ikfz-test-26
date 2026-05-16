import { describe, expect, it } from 'vitest'

import {
  createBlockHitKey,
  resolveBlockHit,
  shouldProcessBlockHit,
  TILE_INDEX,
} from '@/blocks'

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

  it('treats used question blocks as non-interactive after the first reveal', () => {
    const firstHit = resolveBlockHit(TILE_INDEX.questionCoin, 'small')

    expect(firstHit).toEqual({
      action: 'reveal-coin',
      nextTileIndex: TILE_INDEX.groundB,
    })

    expect(resolveBlockHit(firstHit.nextTileIndex ?? -1, 'small')).toEqual({
      action: 'none',
    })
  })
})

describe('shouldProcessBlockHit', () => {
  it('rejects block hits when the player is not blocked upward', () => {
    expect(
      shouldProcessBlockHit({
        blockedUp: false,
        tileX: 5,
        tileY: 6,
      }),
    ).toEqual({
      shouldProcess: false,
    })
  })

  it('accepts the first head hit for a tile and returns a stable tile key', () => {
    expect(
      shouldProcessBlockHit({
        blockedUp: true,
        tileX: 10,
        tileY: 6,
      }),
    ).toEqual({
      shouldProcess: true,
      nextHeadHitKey: createBlockHitKey(10, 6),
    })
  })

  it('suppresses duplicate head hits against the same tile until the key clears', () => {
    const headHitKey = createBlockHitKey(15, 6)

    expect(
      shouldProcessBlockHit({
        blockedUp: true,
        lastHeadHitKey: headHitKey,
        tileX: 15,
        tileY: 6,
      }),
    ).toEqual({
      shouldProcess: false,
      nextHeadHitKey: headHitKey,
    })
  })

  it('allows a new tile hit after the previous tile key changes', () => {
    expect(
      shouldProcessBlockHit({
        blockedUp: true,
        lastHeadHitKey: createBlockHitKey(15, 6),
        tileX: 16,
        tileY: 6,
      }),
    ).toEqual({
      shouldProcess: true,
      nextHeadHitKey: createBlockHitKey(16, 6),
    })
  })
})
