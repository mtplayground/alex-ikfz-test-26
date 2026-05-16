import { describe, expect, it } from 'vitest'

import {
  resolveKoopaPatrolDirection,
  resolveKoopaPlayerInteraction,
  resolveShellKickDirection,
} from '@/enemies/koopaLogic'

describe('resolveKoopaPatrolDirection', () => {
  it('reverses right when blocked on the left', () => {
    expect(
      resolveKoopaPatrolDirection({
        direction: -1,
        blockedLeft: true,
        blockedRight: false,
      }),
    ).toBe(1)
  })

  it('reverses left when blocked on the right', () => {
    expect(
      resolveKoopaPatrolDirection({
        direction: 1,
        blockedLeft: false,
        blockedRight: true,
      }),
    ).toBe(-1)
  })
})

describe('resolveShellKickDirection', () => {
  it('kicks shells away from the player', () => {
    expect(resolveShellKickDirection(10, 20)).toBe(1)
    expect(resolveShellKickDirection(30, 20)).toBe(-1)
  })
})

describe('resolveKoopaPlayerInteraction', () => {
  it('turns a walking koopa into a shell when stomped', () => {
    expect(
      resolveKoopaPlayerInteraction({
        state: 'walking',
        stomped: true,
        playerX: 10,
        koopaX: 20,
      }),
    ).toEqual({
      action: 'stomp-shell',
      nextState: 'shell-idle',
    })
  })

  it('damages the player on side contact with a walking koopa', () => {
    expect(
      resolveKoopaPlayerInteraction({
        state: 'walking',
        stomped: false,
        playerX: 10,
        koopaX: 20,
      }),
    ).toEqual({
      action: 'damage',
      nextState: 'walking',
    })
  })

  it('kicks an idle shell when the player touches it again', () => {
    expect(
      resolveKoopaPlayerInteraction({
        state: 'shell-idle',
        stomped: true,
        playerX: 10,
        koopaX: 20,
      }),
    ).toEqual({
      action: 'kick-shell',
      nextState: 'shell-sliding',
      shellDirection: 1,
    })
  })

  it('treats a sliding shell as harmful to the player', () => {
    expect(
      resolveKoopaPlayerInteraction({
        state: 'shell-sliding',
        stomped: false,
        playerX: 10,
        koopaX: 20,
      }),
    ).toEqual({
      action: 'damage',
      nextState: 'shell-sliding',
    })
  })
})
