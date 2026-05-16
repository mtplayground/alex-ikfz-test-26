import Phaser from 'phaser'

import { ASSET_KEYS, SCENE_KEYS } from '@/assets'
import { getAudioManager, type AudioManager } from '@/audioManager'
import { GAME_TITLE } from '@/config'
import { Player } from '@/entities/player/Player'
import type { PlayerControls } from '@/entities/player/playerMotion'

const CAMERA_ZOOM = 1.25

export class GameScene extends Phaser.Scene {
  private audioManager?: AudioManager

  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys

  private shiftKey?: Phaser.Input.Keyboard.Key

  private zKey?: Phaser.Input.Keyboard.Key

  private spaceKey?: Phaser.Input.Keyboard.Key

  private aKey?: Phaser.Input.Keyboard.Key

  private dKey?: Phaser.Input.Keyboard.Key

  private player?: Player

  private worldLayer?: Phaser.Tilemaps.TilemapLayer

  private worldWidth = 0

  private worldHeight = 0

  public constructor() {
    super(SCENE_KEYS.game)
  }

  public create(): void {
    this.cameras.main.setBackgroundColor('#7dd3fc')

    this.audioManager = getAudioManager(this)
    this.audioManager.registerDefaultSfx()
    this.audioManager.bindUnlockOnFirstInteraction()
    this.audioManager.switchBgm(ASSET_KEYS.audio.overworldTheme)

    Player.ensureAnimations(this)

    const map = this.make.tilemap({ key: ASSET_KEYS.tilemaps.world11 })
    const tileset = map.addTilesetImage(
      'overworld-tiles',
      ASSET_KEYS.tilesets.overworld,
    )

    if (tileset === null) {
      throw new Error('Missing overworld tileset while building GameScene.')
    }

    const worldLayer = map.createLayer('ground', tileset, 0, 0)

    if (worldLayer === null) {
      throw new Error('Missing "ground" tile layer in world-1-1 tilemap.')
    }

    this.worldLayer = worldLayer

    this.worldWidth = map.widthInPixels
    this.worldHeight = map.heightInPixels

    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight)

    const floor = this.add.rectangle(
      this.worldWidth / 2,
      this.worldHeight - 16,
      this.worldWidth,
      32,
      0x000000,
      0,
    )
    this.physics.add.existing(floor, true)

    this.player = new Player(this, 128, this.worldHeight - 48)
    this.physics.add.collider(this.player, floor)

    this.cameras.main.setZoom(CAMERA_ZOOM)
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight)
    this.syncCameraToPlayer()

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

    this.add
      .text(20, 16, `${GAME_TITLE} • World 1-1`, {
        color: '#0f172a',
        fontFamily: 'Arial, sans-serif',
        fontSize: '18px',
      })
      .setScrollFactor(0)

    this.syncCanvasState(map)
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

    this.player.updateMovement(controls)

    if (controls.jumpPressed) {
      this.audioManager?.playSfx(ASSET_KEYS.audio.jump)
    }

    const map = this.worldLayer?.tilemap

    if (map !== undefined) {
      this.syncCanvasState(map)
    }
  }

  private syncCameraToPlayer(): void {
    if (this.player === undefined) {
      return
    }

    const visibleWorldWidth = this.cameras.main.width / CAMERA_ZOOM
    const visibleWorldHeight = this.cameras.main.height / CAMERA_ZOOM
    const maxScrollX = Math.max(0, this.worldWidth - visibleWorldWidth)
    const maxScrollY = Math.max(0, this.worldHeight - visibleWorldHeight)

    this.cameras.main.scrollX = Phaser.Math.Clamp(
      this.player.x - visibleWorldWidth / 2,
      0,
      maxScrollX,
    )
    this.cameras.main.scrollY = Phaser.Math.Clamp(
      this.player.y - visibleWorldHeight / 2,
      0,
      maxScrollY,
    )
  }

  private syncCanvasState(map: Phaser.Tilemaps.Tilemap): void {
    if (this.player === undefined) {
      return
    }

    this.syncCameraToPlayer()

    const playerBody = this.player.body as Phaser.Physics.Arcade.Body

    this.game.canvas.dataset.scene = SCENE_KEYS.game
    this.game.canvas.dataset.mapWidth = String(map.widthInPixels)
    this.game.canvas.dataset.mapHeight = String(map.heightInPixels)
    this.game.canvas.dataset.cameraScrollX = String(
      Math.round(this.cameras.main.scrollX),
    )
    this.game.canvas.dataset.cameraScrollY = String(
      Math.round(this.cameras.main.scrollY),
    )
    this.game.canvas.dataset.playerX = String(Math.round(this.player.x))
    this.game.canvas.dataset.playerY = String(Math.round(this.player.y))
    this.game.canvas.dataset.playerVelocityX = String(
      Math.round(playerBody.velocity.x),
    )
    this.game.canvas.dataset.playerVelocityY = String(
      Math.round(playerBody.velocity.y),
    )
  }
}
