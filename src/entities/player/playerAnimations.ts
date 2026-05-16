import type Phaser from 'phaser'

export const PLAYER_ANIMATION_KEYS = {
  idle: 'player-idle',
  walk: 'player-walk',
  run: 'player-run',
} as const

export interface PlayerAnimationDefinition {
  frameRate: number
  frames: string[]
  key: (typeof PLAYER_ANIMATION_KEYS)[keyof typeof PLAYER_ANIMATION_KEYS]
  repeat: number
}

export const PLAYER_ANIMATION_DEFINITIONS: PlayerAnimationDefinition[] = [
  {
    key: PLAYER_ANIMATION_KEYS.idle,
    frames: ['player-idle-0'],
    frameRate: 1,
    repeat: -1,
  },
  {
    key: PLAYER_ANIMATION_KEYS.walk,
    frames: ['player-walk-0', 'player-walk-1'],
    frameRate: 6,
    repeat: -1,
  },
  {
    key: PLAYER_ANIMATION_KEYS.run,
    frames: ['player-walk-0', 'player-walk-1', 'player-jump-0'],
    frameRate: 10,
    repeat: -1,
  },
]

type AnimationManagerLike = Pick<Phaser.Animations.AnimationManager, 'create' | 'exists'>

export function ensurePlayerAnimations(
  animationManager: AnimationManagerLike,
  atlasKey: string,
): void {
  for (const definition of PLAYER_ANIMATION_DEFINITIONS) {
    if (animationManager.exists(definition.key)) {
      continue
    }

    animationManager.create({
      key: definition.key,
      frames: definition.frames.map((frame) => ({
        key: atlasKey,
        frame,
      })),
      frameRate: definition.frameRate,
      repeat: definition.repeat,
    })
  }
}
