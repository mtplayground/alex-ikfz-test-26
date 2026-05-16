import { describe, expect, it } from 'vitest'

import {
  isGoombaStompCollision,
  resolveGoombaPatrolDirection,
} from '@/enemies/goombaLogic'

describe('resolveGoombaPatrolDirection', () => {
  it('reverses right when the goomba hits a left wall', () => {
    expect(
      resolveGoombaPatrolDirection({
        direction: -1,
        blockedLeft: true,
        blockedRight: false,
      }),
    ).toBe(1)
  })

  it('reverses left when the goomba hits a right wall', () => {
    expect(
      resolveGoombaPatrolDirection({
        direction: 1,
        blockedLeft: false,
        blockedRight: true,
      }),
    ).toBe(-1)
  })

  it('keeps its current direction while unobstructed', () => {
    expect(
      resolveGoombaPatrolDirection({
        direction: -1,
        blockedLeft: false,
        blockedRight: false,
      }),
    ).toBe(-1)
  })

  it('prioritizes reversing away from the left wall when pinned on both sides', () => {
    expect(
      resolveGoombaPatrolDirection({
        direction: -1,
        blockedLeft: true,
        blockedRight: true,
      }),
    ).toBe(1)
  })
})

describe('isGoombaStompCollision', () => {
  it('treats a descending player contacting near the top as a stomp', () => {
    expect(
      isGoombaStompCollision({
        playerBottom: 100,
        enemyTop: 92,
        playerVelocityY: 180,
      }),
    ).toBe(true)
  })

  it('rejects side collisions when the player is not descending from above', () => {
    expect(
      isGoombaStompCollision({
        playerBottom: 120,
        enemyTop: 92,
        playerVelocityY: 0,
      }),
    ).toBe(false)

    expect(
      isGoombaStompCollision({
        playerBottom: 120,
        enemyTop: 92,
        playerVelocityY: 200,
      }),
    ).toBe(false)
  })
})
