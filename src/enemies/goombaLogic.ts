export type GoombaDirection = -1 | 1

export interface GoombaPatrolState {
  direction: GoombaDirection
  blockedLeft: boolean
  blockedRight: boolean
}

export interface GoombaPlayerCollisionState {
  playerBottom: number
  enemyTop: number
  playerVelocityY: number
}

const STOMP_VERTICAL_MARGIN = 12

export function resolveGoombaPatrolDirection({
  direction,
  blockedLeft,
  blockedRight,
}: GoombaPatrolState): GoombaDirection {
  if (blockedLeft) {
    return 1
  }

  if (blockedRight) {
    return -1
  }

  return direction
}

export function isGoombaStompCollision({
  playerBottom,
  enemyTop,
  playerVelocityY,
}: GoombaPlayerCollisionState): boolean {
  return (
    playerVelocityY > 0 && playerBottom <= enemyTop + STOMP_VERTICAL_MARGIN
  )
}
