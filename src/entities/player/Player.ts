import Phaser from 'phaser'

import { ASSET_KEYS } from '@/assets'
import { GAME_CONFIG } from '@/config'
import {
  resolveHorizontalMotion,
  resolveVerticalMotion,
  type PlayerAnimationState,
  type PlayerControls,
  type PlayerFacing,
  type PlayerJumpState,
} from '@/entities/player/playerMotion'
import {
  resolveDamageState,
  resolvePowerStateUpgrade,
  type PlayerDamageResult,
  type PlayerLifeState,
  type PlayerPowerState,
} from '@/entities/player/playerState'

const PLAYER_ANIMATION_KEYS = {
  idle: 'player-idle',
  walk: 'player-walk',
  run: 'player-run',
} as const

export class Player extends Phaser.Physics.Arcade.Sprite {
  private powerState: PlayerLifeState = 'small'

  private facing: PlayerFacing = 'right'

  private jumpState: PlayerJumpState = 'grounded'

  private invulnerableUntil = 0

  private transformTween?: Phaser.Tweens.Tween

  public constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, ASSET_KEYS.atlases.player, 'player-idle-0')

    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.setOrigin(0.5, 1)
    this.setScale(1.5)
    this.setCollideWorldBounds(true)
    this.applyPowerStateVisuals()
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
    const now = this.scene.time.now
    const grounded = body.blocked.down || body.touching.down

    this.syncInvulnerabilityVisual(now)

    if (this.isDead()) {
      body.setVelocityX(0)
      this.jumpState = grounded ? 'grounded' : 'falling'
      this.play(PLAYER_ANIMATION_KEYS.idle, true)
      return
    }

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

  public applyPowerState(targetState: PlayerPowerState): PlayerLifeState {
    const nextState = resolvePowerStateUpgrade(this.powerState, targetState)

    if (nextState === this.powerState) {
      return this.powerState
    }

    this.powerState = nextState
    this.playTransformationAnimation()
    this.applyPowerStateVisuals()

    return this.powerState
  }

  public forcePowerState(targetState: PlayerPowerState): PlayerLifeState {
    this.powerState = targetState
    this.invulnerableUntil = 0
    this.playTransformationAnimation()
    this.applyPowerStateVisuals()

    return this.powerState
  }

  public applyDamage(): PlayerDamageResult {
    const result = resolveDamageState(
      this.powerState,
      this.isInvulnerable(this.scene.time.now),
    )

    if (!result.accepted) {
      return result
    }

    this.powerState = result.nextState

    if (result.defeated) {
      this.handleDefeat()
      return result
    }

    if (result.grantsInvulnerability) {
      this.invulnerableUntil =
        this.scene.time.now + GAME_CONFIG.player.invulnerabilityDurationMs
    }

    this.playTransformationAnimation()
    this.applyPowerStateVisuals()

    return result
  }

  public grantStarInvulnerability(
    durationMs: number = GAME_CONFIG.player.starInvulnerabilityDurationMs,
  ): void {
    this.invulnerableUntil = Math.max(
      this.invulnerableUntil,
      this.scene.time.now + durationMs,
    )
    this.setTint(0xfacc15)
  }

  public getPowerState(): PlayerLifeState {
    return this.powerState
  }

  public isDead(): boolean {
    return this.powerState === 'dead'
  }

  public isInvulnerable(now = this.scene.time.now): boolean {
    return !this.isDead() && now < this.invulnerableUntil
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

  private handleDefeat(): void {
    const body = this.body as Phaser.Physics.Arcade.Body

    this.invulnerableUntil = 0
    this.transformTween?.stop()
    this.setAlpha(0.55)
    this.setTint(0x94a3b8)
    this.setScale(GAME_CONFIG.player.smallScale)
    body.setAllowGravity(false)
    body.setVelocity(0, 0)
    body.setSize(18, 28)
    body.setOffset(7, 4)
  }

  private applyPowerStateVisuals(): void {
    const body = this.body as Phaser.Physics.Arcade.Body
    const isPowered = this.powerState === 'big' || this.powerState === 'fire'

    body.setAllowGravity(true)
    this.setAlpha(1)

    if (this.powerState === 'fire') {
      this.setTint(0xf97316)
    } else if (this.powerState === 'big') {
      this.setTint(0x84cc16)
    } else {
      this.clearTint()
    }

    this.setScale(
      isPowered
        ? GAME_CONFIG.player.poweredScale
        : GAME_CONFIG.player.smallScale,
    )
    body.setSize(18, isPowered ? 32 : 28)
    body.setOffset(7, isPowered ? 0 : 4)
  }

  private playTransformationAnimation(): void {
    this.transformTween?.stop()
    this.setAlpha(1)

    this.transformTween = this.scene.tweens.add({
      targets: this,
      alpha: 0.45,
      duration: Math.round(GAME_CONFIG.player.transformDurationMs / 6),
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: 5,
      onComplete: () => {
        this.setAlpha(1)
      },
    })
  }

  private syncInvulnerabilityVisual(now: number): void {
    if (this.isDead()) {
      return
    }

    if (!this.isInvulnerable(now)) {
      if (!this.transformTween?.isPlaying()) {
        this.applyPowerStateVisuals()
        this.setAlpha(1)
      }
      return
    }

    const blinkInterval = GAME_CONFIG.player.invulnerabilityBlinkIntervalMs
    const blinkPhase = Math.floor(
      (this.invulnerableUntil - now) / blinkInterval,
    )

    if (this.powerState !== 'fire') {
      this.setTint(0xfacc15)
    }

    this.setAlpha(blinkPhase % 2 === 0 ? 0.42 : 1)
  }
}
