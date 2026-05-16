import type { PlayerFacing } from '@/entities/player/playerMotion'

export const FIREBALL_SPEED = 260
export const FIREBALL_BOUNCE_VELOCITY = -180
export const FIREBALL_LIFETIME_MS = 2500
export const MAX_ACTIVE_FIREBALLS = 2

export function resolveFireballDirection(
  facing: PlayerFacing,
): -1 | 1 {
  return facing === 'left' ? -1 : 1
}
