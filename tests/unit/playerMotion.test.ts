import { describe, expect, it } from 'vitest'

import {
  resolveHorizontalMotion,
  resolveVerticalMotion,
  type PlayerControls,
} from '@/entities/player/playerMotion'

function controlsFrom(partial: Partial<PlayerControls>): PlayerControls {
  return {
    left: false,
    right: false,
    run: false,
    jumpPressed: false,
    jumpHeld: false,
    ...partial,
  }
}

describe('player horizontal motion', () => {
  it('returns idle when no horizontal input is active', () => {
    expect(resolveHorizontalMotion(controlsFrom({}), 'right')).toEqual({
      animation: 'idle',
      facing: 'right',
      velocityX: 0,
    })
  })

  it('returns running motion to the right when run is held', () => {
    const motion = resolveHorizontalMotion(
      controlsFrom({ right: true, run: true }),
      'left',
    )

    expect(motion.animation).toBe('run')
    expect(motion.facing).toBe('right')
    expect(motion.velocityX).toBeGreaterThan(0)
  })
})

describe('player vertical motion', () => {
  it('starts a jump when jump is pressed while grounded', () => {
    const motion = resolveVerticalMotion(
      controlsFrom({ jumpPressed: true, jumpHeld: true }),
      0,
      true,
    )

    expect(motion.justJumped).toBe(true)
    expect(motion.grounded).toBe(false)
    expect(motion.jumpState).toBe('rising')
    expect(motion.velocityY).toBeLessThan(0)
  })

  it('cuts jump height when the jump key is released early', () => {
    const motion = resolveVerticalMotion(
      controlsFrom({ jumpHeld: false }),
      -320,
      false,
    )

    expect(motion.justJumped).toBe(false)
    expect(motion.jumpState).toBe('rising')
    expect(motion.velocityY).toBe(-190)
  })

  it('reports grounded once the player has landed', () => {
    const motion = resolveVerticalMotion(controlsFrom({}), 0, true)

    expect(motion.grounded).toBe(true)
    expect(motion.jumpState).toBe('grounded')
  })
})
