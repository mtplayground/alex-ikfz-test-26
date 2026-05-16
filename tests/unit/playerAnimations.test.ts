import { describe, expect, it, vi } from 'vitest'

import {
  ensurePlayerAnimations,
  PLAYER_ANIMATION_DEFINITIONS,
  PLAYER_ANIMATION_KEYS,
} from '@/entities/player/playerAnimations'

describe('ensurePlayerAnimations', () => {
  it('registers idle, walk, and run animations with the player atlas', () => {
    const create = vi.fn()
    const exists = vi.fn(() => false)

    ensurePlayerAnimations(
      {
        create,
        exists,
      },
      'player-atlas',
    )

    expect(exists).toHaveBeenCalledTimes(PLAYER_ANIMATION_DEFINITIONS.length)
    expect(create).toHaveBeenCalledTimes(PLAYER_ANIMATION_DEFINITIONS.length)
    expect(create).toHaveBeenNthCalledWith(1, {
      key: PLAYER_ANIMATION_KEYS.idle,
      frames: [{ key: 'player-atlas', frame: 'player-idle-0' }],
      frameRate: 1,
      repeat: -1,
    })
    expect(create).toHaveBeenNthCalledWith(2, {
      key: PLAYER_ANIMATION_KEYS.walk,
      frames: [
        { key: 'player-atlas', frame: 'player-walk-0' },
        { key: 'player-atlas', frame: 'player-walk-1' },
      ],
      frameRate: 6,
      repeat: -1,
    })
    expect(create).toHaveBeenNthCalledWith(3, {
      key: PLAYER_ANIMATION_KEYS.run,
      frames: [
        { key: 'player-atlas', frame: 'player-walk-0' },
        { key: 'player-atlas', frame: 'player-walk-1' },
        { key: 'player-atlas', frame: 'player-jump-0' },
      ],
      frameRate: 10,
      repeat: -1,
    })
  })

  it('skips animations that already exist', () => {
    const create = vi.fn()
    const existingKeys = new Set([PLAYER_ANIMATION_KEYS.idle, PLAYER_ANIMATION_KEYS.walk])
    const exists = vi.fn((key: string) => existingKeys.has(key))

    ensurePlayerAnimations(
      {
        create,
        exists,
      },
      'player-atlas',
    )

    expect(create).toHaveBeenCalledTimes(1)
    expect(create).toHaveBeenCalledWith({
      key: PLAYER_ANIMATION_KEYS.run,
      frames: [
        { key: 'player-atlas', frame: 'player-walk-0' },
        { key: 'player-atlas', frame: 'player-walk-1' },
        { key: 'player-atlas', frame: 'player-jump-0' },
      ],
      frameRate: 10,
      repeat: -1,
    })
  })
})
