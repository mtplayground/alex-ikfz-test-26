import { resolveGoombaPatrolDirection, type GoombaDirection } from '@/enemies/goombaLogic'

export type KoopaState = 'walking' | 'shell-idle' | 'shell-sliding'

export interface KoopaPlayerInteractionState {
  state: KoopaState
  stomped: boolean
  playerX: number
  koopaX: number
}

export interface KoopaPlayerInteractionResult {
  action: 'damage' | 'stomp-shell' | 'kick-shell'
  nextState: KoopaState
  shellDirection?: GoombaDirection
}

export function resolveKoopaPatrolDirection(args: {
  direction: GoombaDirection
  blockedLeft: boolean
  blockedRight: boolean
}): GoombaDirection {
  return resolveGoombaPatrolDirection(args)
}

export function resolveShellKickDirection(
  playerX: number,
  koopaX: number,
): GoombaDirection {
  return playerX < koopaX ? 1 : -1
}

export function resolveKoopaPlayerInteraction({
  state,
  stomped,
  playerX,
  koopaX,
}: KoopaPlayerInteractionState): KoopaPlayerInteractionResult {
  if (state === 'walking') {
    if (stomped) {
      return {
        action: 'stomp-shell',
        nextState: 'shell-idle',
      }
    }

    return {
      action: 'damage',
      nextState: state,
    }
  }

  if (state === 'shell-idle') {
    return {
      action: 'kick-shell',
      nextState: 'shell-sliding',
      shellDirection: resolveShellKickDirection(playerX, koopaX),
    }
  }

  return {
    action: 'damage',
    nextState: state,
  }
}
