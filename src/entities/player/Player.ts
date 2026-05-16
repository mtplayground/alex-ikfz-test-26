import Phaser from 'phaser'

import { ASSET_KEYS } from '@/assets'
import {
  resolveHorizontalMotion,
  resolveVerticalMotion,
  type PlayerAnimationState,
  type PlayerControls,
  type PlayerFacing,
  type PlayerJumpState,
} from '@/entities/player/playerMotion'

const PLAYER_ANIMATION_KEYS = {
  idle: 'player-idle',
  walk: 'player-walk',
  run: 'player-run',
} as const

export class Player extends Phaser.Physics.Arcade.Sprite {
  private facing: PlayerFacing = 'right'

  private jumpState: PlayerJumpState = 'grounded'

  public constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, ASSET_KEYS.atlases.player, 'player-idle-0')

    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.setOrigin(0.5, 1)
    this.setScale(1.5)
    this.setCollideWorldBounds(true)

    const body = this.body as Phaser.Physics.Arcade.Body
    body.setSize(18, 28)
    body.setOffset(7, 4)
  }

  public static ensureAnimations(scene: Phaser.Scene): void {
    const animationManager = scene.anims

    if (!animationManager.exists(PLAYER_ANIMATION_KEYS.idle)) {
      animationManager.create({
        key: PLAYER_ANIMATION_KEYS.idle,
        frames: [{ key: ASSET_KEYS.atlases.player, frame: 'player-idle-0' }],
        frameRate: 1,
        repeat: -1,
      })
    }

    if (!animationManager.exists(PLAYER_ANIMATION_KEYS.walk)) {
      animationManager.create({
        key: PLAYER_ANIMATION_KEYS.walk,
        frames: [
          { key: ASSET_KEYS.atlases.player, frame: 'player-walk-0' },
          { key: ASSET_KEYS.atlases.player, frame: 'player-walk-1' },
        ],
        frameRate: 6,
        repeat: -1,
      })
    }

    if (!animationManager.exists(PLAYER_ANIMATION_KEYS.run)) {
      animationManager.create({
        key: PLAYER_ANIMATION_KEYS.run,
        frames: [
          { key: ASSET_KEYS.atlases.player, frame: 'player-walk-0' },
          { key: ASSET_KEYS.atlases.player, frame: 'player-walk-1' },
          { key: ASSET_KEYS.atlases.player, frame: 'player-jump-0' },
        ],
        frameRate: 10,
        repeat: -1,
      })
    }
  }

  public updateMovement(controls: PlayerControls): void {
    const body = this.body as Phaser.Physics.Arcade.Body
    const grounded = body.blocked.down || body.touching.down

    const horizontalMotion = resolveHorizontalMotion(controls, this.facing)
    const verticalMotion = resolveVerticalMotion(
      controls,
      body.velocity.y,
      grounded,
    )

    this.facing = horizontalMotion.facing
    this.jumpState = verticalMotion.jumpState

    body.setVelocityX(horizontalMotion.velocityX)
    body.setVelocityY(verticalMotion.velocityY)

    this.setFlipX(horizontalMotion.facing === 'left')

    if (this.jumpState === 'grounded') {
      this.play(PLAYER_ANIMATION_KEYS[horizontalMotion.animation], true)
    } else {
      this.play(PLAYER_ANIMATION_KEYS.idle, true)
    }
  }

  public getFacing(): PlayerFacing {
    return this.facing
  }

  public getAnimationState(): PlayerAnimationState {
    const animationKey = this.anims.currentAnim?.key

    switch (animationKey) {
      case PLAYER_ANIMATION_KEYS.walk:
        return 'walk'
      case PLAYER_ANIMATION_KEYS.run:
        return 'run'
      default:
        return 'idle'
    }
  }

  public getJumpState(): PlayerJumpState {
    return this.jumpState
  }

  public isGrounded(): boolean {
    return this.jumpState === 'grounded'
  }
}
