import { describe, expect, it } from 'vitest'

import {
  MAX_ACTIVE_FIREBALLS,
  resolveFireballDirection,
} from '@/fireball'

describe('resolveFireballDirection', () => {
  it('fires left when the player is facing left', () => {
    expect(resolveFireballDirection('left')).toBe(-1)
  })

  it('fires right when the player is facing right', () => {
    expect(resolveFireballDirection('right')).toBe(1)
  })
})

describe('fireball limits', () => {
  it('keeps the active-fireball cap at two projectiles', () => {
    expect(MAX_ACTIVE_FIREBALLS).toBe(2)
  })
})
