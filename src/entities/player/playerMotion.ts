import { GAME_CONFIG } from '@/config'

export type PlayerAnimationState = 'idle' | 'walk' | 'run'
export type PlayerFacing = 'left' | 'right'
export type PlayerJumpState = 'grounded' | 'rising' | 'falling'

export interface PlayerControls {
  left: boolean
  right: boolean
  run: boolean
  jumpPressed: boolean
  jumpHeld: boolean
}

export interface PlayerHorizontalMotion {
  animation: PlayerAnimationState
  facing: PlayerFacing
  velocityX: number
}

export interface PlayerVerticalMotion {
  velocityY: number
  grounded: boolean
  justJumped: boolean
  jumpState: PlayerJumpState
}

export function resolveHorizontalMotion(
  controls: Pick<PlayerControls, 'left' | 'right' | 'run'>,
  previousFacing: PlayerFacing,
): PlayerHorizontalMotion {
  const isMovingLeft = controls.left && !controls.right
  const isMovingRight = controls.right && !controls.left

  if (!isMovingLeft && !isMovingRight) {
    return {
      animation: 'idle',
      facing: previousFacing,
      velocityX: 0,
    }
  }

  const facing: PlayerFacing = isMovingLeft ? 'left' : 'right'
  const velocityX = controls.run
    ? GAME_CONFIG.player.runSpeed
    : GAME_CONFIG.player.walkSpeed

  return {
    animation: controls.run ? 'run' : 'walk',
    facing,
    velocityX: facing === 'left' ? -velocityX : velocityX,
  }
}

export function resolveVerticalMotion(
  controls: Pick<PlayerControls, 'jumpHeld' | 'jumpPressed'>,
  currentVelocityY: number,
  grounded: boolean,
): PlayerVerticalMotion {
  if (controls.jumpPressed && grounded) {
    return {
      velocityY: GAME_CONFIG.player.jumpVelocity,
      grounded: false,
      justJumped: true,
      jumpState: 'rising',
    }
  }

  if (
    !controls.jumpHeld &&
    currentVelocityY < GAME_CONFIG.player.jumpReleaseVelocityCap
  ) {
    return {
      velocityY: GAME_CONFIG.player.jumpReleaseVelocityCap,
      grounded: false,
      justJumped: false,
      jumpState: 'rising',
    }
  }

  if (grounded) {
    return {
      velocityY: currentVelocityY,
      grounded: true,
      justJumped: false,
      jumpState: 'grounded',
    }
  }

  return {
    velocityY: currentVelocityY,
    grounded: false,
    justJumped: false,
    jumpState: currentVelocityY < 0 ? 'rising' : 'falling',
  }
}
