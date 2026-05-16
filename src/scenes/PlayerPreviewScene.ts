import Phaser from 'phaser'

import { ASSET_KEYS, SCENE_KEYS } from '@/assets'
import { GAME_TITLE } from '@/config'
import { Player } from '@/entities/player/Player'
import type { PlayerControls } from '@/entities/player/playerMotion'
import type { PlayerDamageResult } from '@/entities/player/playerState'

export class PlayerPreviewScene extends Phaser.Scene {
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys

  private shiftKey?: Phaser.Input.Keyboard.Key

  private zKey?: Phaser.Input.Keyboard.Key

  private spaceKey?: Phaser.Input.Keyboard.Key

  private aKey?: Phaser.Input.Keyboard.Key

  private dKey?: Phaser.Input.Keyboard.Key

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

    this.cursors = this.input.keyboard?.createCursorKeys()
    this.shiftKey = this.input.keyboard?.addKey(
      Phaser.Input.Keyboard.KeyCodes.SHIFT,
    )
    this.zKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.Z)
    this.spaceKey = this.input.keyboard?.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE,
    )
    this.aKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.A)
    this.dKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.D)
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

    const jumpHeld =
      this.zKey?.isDown === true || this.spaceKey?.isDown === true
    const jumpPressed =
      (this.zKey !== undefined && Phaser.Input.Keyboard.JustDown(this.zKey)) ||
      (this.spaceKey !== undefined &&
        Phaser.Input.Keyboard.JustDown(this.spaceKey))

    const controls: PlayerControls = {
      left: this.cursors?.left.isDown === true || this.aKey?.isDown === true,
      right: this.cursors?.right.isDown === true || this.dKey?.isDown === true,
      run: this.shiftKey?.isDown === true,
      jumpPressed,
      jumpHeld,
    }

    this.handleDebugStateControls()
    this.player.updateMovement(controls)

    if (controls.jumpPressed) {
      this.sound.play(ASSET_KEYS.audio.jump)
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
      this.eventText?.setText('Forced player to Small form.')
      return
    }

    if (
      this.twoKey !== undefined &&
      Phaser.Input.Keyboard.JustDown(this.twoKey)
    ) {
      this.player.applyPowerState('big')
      this.lastDamageResult = undefined
      this.eventText?.setText('Promoted player to Big form.')
      return
    }

    if (
      this.threeKey !== undefined &&
      Phaser.Input.Keyboard.JustDown(this.threeKey)
    ) {
      this.player.applyPowerState('fire')
      this.lastDamageResult = undefined
      this.eventText?.setText('Promoted player to Fire form.')
      return
    }

    if (this.hKey !== undefined && Phaser.Input.Keyboard.JustDown(this.hKey)) {
      this.lastDamageResult = this.player.applyDamage()

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
