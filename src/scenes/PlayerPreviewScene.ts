import Phaser from 'phaser'

import { ASSET_KEYS, SCENE_KEYS } from '@/assets'
import { getAudioManager, type AudioManager } from '@/audioManager'
import { GAME_TITLE } from '@/config'
import { InputManager } from '@/input/InputManager'
import { Player } from '@/entities/player/Player'
import type { PlayerControls } from '@/entities/player/playerMotion'
import type { PlayerDamageResult } from '@/entities/player/playerState'

export class PlayerPreviewScene extends Phaser.Scene {
  private audioManager?: AudioManager

  private inputManager?: InputManager

  private oneKey?: Phaser.Input.Keyboard.Key

  private twoKey?: Phaser.Input.Keyboard.Key

  private threeKey?: Phaser.Input.Keyboard.Key

  private hKey?: Phaser.Input.Keyboard.Key

  private rKey?: Phaser.Input.Keyboard.Key

  private player?: Player

  private eventText?: Phaser.GameObjects.Text

  private lastDamageResult?: PlayerDamageResult

  public constructor() {
    super(SCENE_KEYS.playerPreview)
  }

  public create(): void {
    const { width, height } = this.scale

    this.cameras.main.setBackgroundColor('#082f49')
    this.physics.world.setBounds(0, 0, width, height)

    this.audioManager = getAudioManager(this)
    this.audioManager.registerDefaultSfx()
    this.audioManager.bindUnlockOnFirstInteraction()
    this.audioManager.switchBgm(ASSET_KEYS.audio.overworldTheme)

    Player.ensureAnimations(this)

    this.add
      .text(width / 2, 48, `${GAME_TITLE} • Player Preview`, {
        color: '#f8fafc',
        fontFamily: 'Arial, sans-serif',
        fontSize: '28px',
      })
      .setOrigin(0.5)

    this.add
      .text(
        width / 2,
        82,
        'Move: ← → / A D • Run: Shift • Jump: Z / Space • 1/2/3 = Small/Big/Fire • H = Hurt • R = Restart',
        {
          color: '#bae6fd',
          fontFamily: 'Arial, sans-serif',
          fontSize: '13px',
        },
      )
      .setOrigin(0.5)

    this.eventText = this.add
      .text(
        width / 2,
        112,
        'Preview loaded. Use 1/2/3 and H to test state changes.',
        {
          color: '#fde68a',
          fontFamily: 'Arial, sans-serif',
          fontSize: '13px',
        },
      )
      .setOrigin(0.5)

    const ground = this.add.rectangle(
      width / 2,
      height - 58,
      width - 96,
      26,
      0x14532d,
    )
    this.physics.add.existing(ground, true)

    this.player = new Player(this, width / 2, height - 72)
    this.physics.add.collider(this.player, ground)

    this.inputManager = new InputManager(this)
    this.inputManager.update()
    this.oneKey = this.input.keyboard?.addKey(
      Phaser.Input.Keyboard.KeyCodes.ONE,
    )
    this.twoKey = this.input.keyboard?.addKey(
      Phaser.Input.Keyboard.KeyCodes.TWO,
    )
    this.threeKey = this.input.keyboard?.addKey(
      Phaser.Input.Keyboard.KeyCodes.THREE,
    )
    this.hKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.H)
    this.rKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.R)

    this.syncCanvasState()
  }

  public override update(): void {
    if (this.player === undefined) {
      return
    }

    this.inputManager?.update()

    const controls: PlayerControls = {
      left: this.inputManager?.isDown('left') === true,
      right: this.inputManager?.isDown('right') === true,
      run: this.inputManager?.isDown('run') === true,
      jumpPressed: this.inputManager?.justPressed('jump') === true,
      jumpHeld: this.inputManager?.isDown('jump') === true,
    }

    this.handleDebugStateControls()
    this.player.updateMovement(controls)

    if (controls.jumpPressed) {
      this.audioManager?.playSfx(ASSET_KEYS.audio.jump)
    }

    this.syncCanvasState()
  }

  private syncCanvasState(): void {
    if (this.player === undefined) {
      return
    }

    const body = this.player.body as Phaser.Physics.Arcade.Body

    this.game.canvas.dataset.scene = SCENE_KEYS.playerPreview
    this.game.canvas.dataset.playerFacing = this.player.getFacing()
    this.game.canvas.dataset.playerAnimation = this.player.getAnimationState()
    this.game.canvas.dataset.playerJumpState = this.player.getJumpState()
    this.game.canvas.dataset.playerGrounded = String(this.player.isGrounded())
    this.game.canvas.dataset.playerPowerState = this.player.getPowerState()
    this.game.canvas.dataset.playerInvulnerable = String(
      this.player.isInvulnerable(),
    )
    this.game.canvas.dataset.playerDead = String(this.player.isDead())
    this.game.canvas.dataset.playerDamageAccepted = String(
      this.lastDamageResult?.accepted ?? false,
    )
    this.game.canvas.dataset.playerDamageDefeated = String(
      this.lastDamageResult?.defeated ?? false,
    )
    this.game.canvas.dataset.playerVelocityX = String(
      Math.round(body.velocity.x),
    )
    this.game.canvas.dataset.playerVelocityY = String(
      Math.round(body.velocity.y),
    )
  }

  private handleDebugStateControls(): void {
    if (this.player === undefined) {
      return
    }

    if (this.rKey !== undefined && Phaser.Input.Keyboard.JustDown(this.rKey)) {
      this.scene.restart()
      return
    }

    if (
      this.oneKey !== undefined &&
      Phaser.Input.Keyboard.JustDown(this.oneKey)
    ) {
      this.player.forcePowerState('small')
      this.lastDamageResult = undefined
      this.audioManager?.playSfx(ASSET_KEYS.audio.stomp)
      this.eventText?.setText('Forced player to Small form.')
      return
    }

    if (
      this.twoKey !== undefined &&
      Phaser.Input.Keyboard.JustDown(this.twoKey)
    ) {
      this.player.applyPowerState('big')
      this.lastDamageResult = undefined
      this.audioManager?.playSfx(ASSET_KEYS.audio.powerup)
      this.eventText?.setText('Promoted player to Big form.')
      return
    }

    if (
      this.threeKey !== undefined &&
      Phaser.Input.Keyboard.JustDown(this.threeKey)
    ) {
      this.player.applyPowerState('fire')
      this.lastDamageResult = undefined
      this.audioManager?.playSfx(ASSET_KEYS.audio.powerup)
      this.eventText?.setText('Promoted player to Fire form.')
      return
    }

    if (this.hKey !== undefined && Phaser.Input.Keyboard.JustDown(this.hKey)) {
      this.lastDamageResult = this.player.applyDamage()
      this.audioManager?.playSfx(ASSET_KEYS.audio.stomp)

      if (!this.lastDamageResult.accepted) {
        this.eventText?.setText(
          'Damage ignored because the player is invulnerable.',
        )
        return
      }

      if (this.lastDamageResult.defeated) {
        this.eventText?.setText(
          'Small form defeated. Press R to restart preview.',
        )
        return
      }

      this.eventText?.setText(
        `Damage applied. Player downgraded to ${this.player.getPowerState()}.`,
      )
    }
  }
}
