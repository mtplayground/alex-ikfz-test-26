import Phaser from 'phaser'

import { ASSET_KEYS, SCENE_KEYS } from '@/assets'
import { getAudioManager, type AudioManager } from '@/audioManager'
import { resolveBlockHit, shouldProcessBlockHit } from '@/blocks'
import { GAME_CONFIG, GAME_TITLE } from '@/config'
import { Goomba } from '@/enemies/Goomba'
import { Koopa } from '@/enemies/Koopa'
import { isGoombaStompCollision } from '@/enemies/goombaLogic'
import { resolveKoopaPlayerInteraction } from '@/enemies/koopaLogic'
import { Player } from '@/entities/player/Player'
import type { PlayerControls } from '@/entities/player/playerMotion'
import { resolveFlagpoleBonus, resolveNextStage } from '@/goal'
import { getScoreManager, type ScoreManager } from '@/scoreManager'
import {
  createStorageService,
  type StorageService,
} from '@/storageService'

const CAMERA_ZOOM = 1.25
const GOAL_POLE_HEIGHT = 160
const GOAL_POLE_OFFSET_X = 48
const GOAL_POLE_ZONE_WIDTH = 18
const GOAL_SLIDE_DURATION_MS = 900

interface GameSceneData {
  stageId?: string | null
  resetRun?: boolean
}

type GoalState = 'idle' | 'sliding' | 'complete'

export class GameScene extends Phaser.Scene {
  private audioManager?: AudioManager

  private storageService?: StorageService

  private scoreManager?: ScoreManager

  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys

  private shiftKey?: Phaser.Input.Keyboard.Key

  private zKey?: Phaser.Input.Keyboard.Key

  private spaceKey?: Phaser.Input.Keyboard.Key

  private aKey?: Phaser.Input.Keyboard.Key

  private dKey?: Phaser.Input.Keyboard.Key

  private player?: Player

  private worldLayer?: Phaser.Tilemaps.TilemapLayer

  private goalZone?: Phaser.GameObjects.Zone

  private goombas?: Phaser.Physics.Arcade.Group

  private koopas?: Phaser.Physics.Arcade.Group

  private worldWidth = 0

  private worldHeight = 0

  private currentStageId = GAME_CONFIG.levels[0] ?? '1-1'

  private resetRun = false

  private goalState: GoalState = 'idle'

  private goalPoleX = 0

  private goalPoleTopY = 0

  private goalPoleBottomY = 0

  private lastHeadHitKey?: string

  private lastBlockAction = 'none'

  private lastGoalBonus = 0

  private lastEnemyInteraction = 'none'

  public constructor() {
    super(SCENE_KEYS.game)
  }

  public init(data: GameSceneData = {}): void {
    const requestedStageId = data.stageId?.trim()

    if (
      requestedStageId !== undefined &&
      requestedStageId.length > 0 &&
      GAME_CONFIG.levels.includes(requestedStageId)
    ) {
      this.currentStageId = requestedStageId
    } else {
      this.currentStageId = GAME_CONFIG.levels[0] ?? '1-1'
    }

    this.resetRun = data.resetRun === true
    this.goalState = 'idle'
    this.lastHeadHitKey = undefined
    this.lastBlockAction = 'none'
    this.lastGoalBonus = 0
    this.lastEnemyInteraction = 'none'
  }

  public create(): void {
    this.cameras.main.setBackgroundColor('#7dd3fc')

    this.audioManager = getAudioManager(this)
    this.audioManager.registerDefaultSfx()
    this.audioManager.bindUnlockOnFirstInteraction()
    this.audioManager.switchBgm(ASSET_KEYS.audio.overworldTheme)

    this.storageService = createStorageService(GAME_CONFIG.levels)
    this.scoreManager = getScoreManager(this.storageService)

    if (this.resetRun) {
      this.scoreManager.resetRun()
    }

    Player.ensureAnimations(this)
    Goomba.ensureAnimations(this)
    Koopa.ensureAnimations(this)

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
    worldLayer.setCollisionByExclusion([-1, 0])

    this.worldWidth = map.widthInPixels
    this.worldHeight = map.heightInPixels

    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight)

    this.player = new Player(this, 128, this.worldHeight - 48)
    this.physics.add.collider(
      this.player,
      worldLayer,
      (_player, tile) => {
        this.handlePlayerTileCollision(tile as Phaser.Tilemaps.Tile)
      },
      undefined,
      this,
    )

    this.createGoombas()
    this.createKoopas()

    this.createGoalPole()

    if (this.goalZone !== undefined) {
      this.physics.add.overlap(
        this.player,
        this.goalZone,
        () => {
          this.handleGoalReached()
        },
        undefined,
        this,
      )
    }

    if (this.goombas !== undefined) {
      this.physics.add.collider(this.goombas, worldLayer)
      this.physics.add.collider(
        this.player,
        this.goombas,
        (_player, enemy) => {
          this.handlePlayerGoombaCollision(enemy as Goomba)
        },
        undefined,
        this,
      )
    }

    if (this.koopas !== undefined) {
      this.physics.add.collider(this.koopas, worldLayer)
      this.physics.add.collider(
        this.player,
        this.koopas,
        (_player, enemy) => {
          this.handlePlayerKoopaCollision(enemy as unknown as Koopa)
        },
        undefined,
        this,
      )
    }

    if (this.goombas !== undefined && this.koopas !== undefined) {
      this.physics.add.overlap(
        this.koopas,
        this.goombas,
        (koopa, goomba) => {
          this.handleKoopaGoombaCollision(
            koopa as unknown as Koopa,
            goomba as unknown as Goomba,
          )
        },
        undefined,
        this,
      )
    }

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
      .text(20, 16, `${GAME_TITLE} • World ${this.currentStageId}`, {
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

    if (this.goalState === 'idle') {
      this.updateActiveGameplay()
    } else {
      this.updateGoalSequence()
    }

    this.goombas?.getChildren().forEach((enemy) => {
      ;(enemy as Goomba).updatePatrol()
    })
    this.koopas?.getChildren().forEach((enemy) => {
      ;(enemy as unknown as Koopa).updateMovement()
    })

    const map = this.worldLayer?.tilemap

    if (map !== undefined) {
      this.syncCanvasState(map)
    }
  }

  private updateActiveGameplay(): void {
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

    const playerBody = this.player.body as Phaser.Physics.Arcade.Body

    if (!playerBody.blocked.up) {
      this.lastHeadHitKey = undefined
    }

    if (controls.jumpPressed) {
      this.audioManager?.playSfx(ASSET_KEYS.audio.jump)
    }
  }

  private updateGoalSequence(): void {
    if (this.player === undefined) {
      return
    }

    const playerBody = this.player.body as Phaser.Physics.Arcade.Body

    playerBody.setVelocity(0, 0)
    this.player.setX(this.goalPoleX)
  }

  private createGoombas(): void {
    const goomba = new Goomba(this, 520, this.worldHeight - 50)

    this.goombas = this.physics.add.group({
      allowGravity: true,
      immovable: false,
    })
    this.goombas.add(goomba)
  }

  private createKoopas(): void {
    const koopa = new Koopa(this, 432, this.worldHeight - 50)

    this.koopas = this.physics.add.group({
      allowGravity: true,
      immovable: false,
    })
    this.koopas.add(koopa)
  }

  private createGoalPole(): void {
    const poleBaseY = this.worldHeight - 64
    const poleTopY = poleBaseY - GOAL_POLE_HEIGHT
    const poleX = this.worldWidth - GOAL_POLE_OFFSET_X

    this.goalPoleX = poleX
    this.goalPoleTopY = poleTopY
    this.goalPoleBottomY = poleBaseY

    this.add
      .rectangle(poleX, poleBaseY - GOAL_POLE_HEIGHT / 2, 6, GOAL_POLE_HEIGHT, 0xe2e8f0)
      .setOrigin(0.5)

    this.add
      .rectangle(poleX + 10, poleTopY + 18, 18, 12, 0x22c55e)
      .setOrigin(0.5)

    const goalZone = this.add.zone(
      poleX,
      poleBaseY - GOAL_POLE_HEIGHT / 2,
      GOAL_POLE_ZONE_WIDTH,
      GOAL_POLE_HEIGHT,
    )

    this.physics.add.existing(goalZone, true)
    this.goalZone = goalZone
  }

  private handleGoalReached(): void {
    if (
      this.player === undefined ||
      this.storageService === undefined ||
      this.scoreManager === undefined ||
      this.goalState !== 'idle'
    ) {
      return
    }

    const playerBody = this.player.body as Phaser.Physics.Arcade.Body
    const normalizedContactHeight = Phaser.Math.Clamp(
      (this.player.y - this.goalPoleTopY) /
        Math.max(this.goalPoleBottomY - this.goalPoleTopY, 1),
      0,
      1,
    )
    const nextStageId = resolveNextStage(GAME_CONFIG.levels, this.currentStageId)

    this.goalState = 'sliding'
    this.lastBlockAction = 'goal'
    this.lastGoalBonus = resolveFlagpoleBonus(normalizedContactHeight)

    this.scoreManager.addScore(this.lastGoalBonus)
    this.storageService.setFurthestStage(nextStageId ?? this.currentStageId)

    this.audioManager?.stopBgm()
    this.audioManager?.playSfx(ASSET_KEYS.audio.stageClear)

    playerBody.setAllowGravity(false)
    playerBody.setVelocity(0, 0)

    this.tweens.add({
      targets: this.player,
      x: this.goalPoleX,
      y: this.goalPoleBottomY + 4,
      duration: GOAL_SLIDE_DURATION_MS,
      ease: 'Linear',
      onComplete: () => {
        this.goalState = 'complete'
        this.time.delayedCall(360, () => {
          if (nextStageId === null) {
            this.scene.start(SCENE_KEYS.gameOver, {
              completedRun: true,
              score: this.scoreManager?.getScore() ?? 0,
            })
            return
          }

          this.scene.start(SCENE_KEYS.game, {
            stageId: nextStageId,
            resetRun: false,
          })
        })
      },
    })
  }

  private handlePlayerTileCollision(tile: Phaser.Tilemaps.Tile): void {
    if (
      this.player === undefined ||
      this.worldLayer === undefined ||
      this.goalState !== 'idle'
    ) {
      return
    }

    const playerBody = this.player.body as Phaser.Physics.Arcade.Body
    const collisionDecision = shouldProcessBlockHit({
      blockedUp: playerBody.blocked.up,
      lastHeadHitKey: this.lastHeadHitKey,
      tileX: tile.x,
      tileY: tile.y,
    })

    if (!collisionDecision.shouldProcess) {
      return
    }

    this.lastHeadHitKey = collisionDecision.nextHeadHitKey

    const resolution = resolveBlockHit(tile.index, this.player.getPowerState())

    if (resolution.action === 'none') {
      return
    }

    this.lastBlockAction = resolution.action
    this.animateTileBump(tile)

    switch (resolution.action) {
      case 'break':
        if (resolution.nextTileIndex !== undefined) {
          this.worldLayer.putTileAt(resolution.nextTileIndex, tile.x, tile.y)
        }
        this.spawnBrickFragments(tile)
        this.scoreManager?.addScore(50)
        this.audioManager?.playSfx(ASSET_KEYS.audio.stomp)
        break
      case 'bounce':
        this.audioManager?.playSfx(ASSET_KEYS.audio.stomp)
        break
      case 'reveal-coin':
        if (resolution.nextTileIndex !== undefined) {
          this.worldLayer.putTileAt(resolution.nextTileIndex, tile.x, tile.y)
        }
        this.scoreManager?.addCoins(1)
        this.scoreManager?.addScore(200)
        this.audioManager?.playSfx(ASSET_KEYS.audio.coin)
        break
      case 'reveal-powerup':
        if (resolution.nextTileIndex !== undefined) {
          this.worldLayer.putTileAt(resolution.nextTileIndex, tile.x, tile.y)
        }
        if (this.player.getPowerState() === 'small') {
          this.player.applyPowerState('big')
        } else {
          this.player.applyPowerState('fire')
        }
        this.scoreManager?.addScore(1000)
        this.audioManager?.playSfx(ASSET_KEYS.audio.powerup)
        break
    }
  }

  private handlePlayerGoombaCollision(goomba: Goomba): void {
    if (
      this.player === undefined ||
      this.goalState !== 'idle' ||
      goomba.isDefeated()
    ) {
      return
    }

    const playerBody = this.player.body as Phaser.Physics.Arcade.Body
    const goombaBody = goomba.body as Phaser.Physics.Arcade.Body

    if (
      isGoombaStompCollision({
        playerBottom: playerBody.bottom,
        enemyTop: goombaBody.top,
        playerVelocityY: playerBody.velocity.y,
      })
    ) {
      this.lastEnemyInteraction = 'stomp'
      this.scoreManager?.addScore(100)
      this.audioManager?.playSfx(ASSET_KEYS.audio.stomp)
      goomba.squash()
      playerBody.setVelocityY(
        Math.min(playerBody.velocity.y, GAME_CONFIG.player.jumpVelocity * 0.45),
      )
      return
    }

    this.lastEnemyInteraction = 'hurt'
    this.player.applyDamage()
  }

  private handlePlayerKoopaCollision(koopa: Koopa): void {
    if (
      this.player === undefined ||
      this.goalState !== 'idle' ||
      koopa.isDefeated()
    ) {
      return
    }

    const playerBody = this.player.body as Phaser.Physics.Arcade.Body
    const koopaBody = koopa.body as Phaser.Physics.Arcade.Body
    const stomped = isGoombaStompCollision({
      playerBottom: playerBody.bottom,
      enemyTop: koopaBody.top,
      playerVelocityY: playerBody.velocity.y,
    })
    const interaction = resolveKoopaPlayerInteraction({
      state: koopa.getState(),
      stomped,
      playerX: this.player.x,
      koopaX: koopa.x,
    })

    switch (interaction.action) {
      case 'stomp-shell':
        this.lastEnemyInteraction = 'koopa-stomp'
        this.scoreManager?.addScore(100)
        this.audioManager?.playSfx(ASSET_KEYS.audio.stomp)
        koopa.stompIntoShell()
        playerBody.setVelocityY(
          Math.min(playerBody.velocity.y, GAME_CONFIG.player.jumpVelocity * 0.45),
        )
        return
      case 'kick-shell':
        this.lastEnemyInteraction = 'koopa-kick'
        this.audioManager?.playSfx(ASSET_KEYS.audio.stomp)
        koopa.kickShell(interaction.shellDirection ?? 1)
        playerBody.setVelocityY(
          Math.min(playerBody.velocity.y, GAME_CONFIG.player.jumpVelocity * 0.35),
        )
        return
      case 'damage':
        this.lastEnemyInteraction = koopa.isShellSliding()
          ? 'koopa-shell-hurt'
          : 'hurt'
        this.player.applyDamage()
    }
  }

  private handleKoopaGoombaCollision(koopa: Koopa, goomba: Goomba): void {
    if (!koopa.isShellSliding() || goomba.isDefeated()) {
      return
    }

    this.lastEnemyInteraction = 'koopa-shell-kill'
    this.scoreManager?.addScore(200)
    this.audioManager?.playSfx(ASSET_KEYS.audio.stomp)
    goomba.squash()
  }

  private animateTileBump(tile: Phaser.Tilemaps.Tile): void {
    const marker = this.add.rectangle(
      tile.getCenterX(),
      tile.getCenterY(),
      tile.width,
      tile.height,
      0xffffff,
      0.2,
    )

    this.tweens.add({
      targets: marker,
      y: marker.y - 8,
      alpha: 0.05,
      duration: 90,
      yoyo: true,
      ease: 'Sine.easeOut',
      onComplete: () => {
        marker.destroy()
      },
    })
  }

  private spawnBrickFragments(tile: Phaser.Tilemaps.Tile): void {
    const fragmentOffsets = [
      [-8, -8],
      [8, -8],
      [-8, 8],
      [8, 8],
    ] as const

    fragmentOffsets.forEach(([offsetX, offsetY], index) => {
      const fragment = this.add.rectangle(
        tile.getCenterX() + offsetX,
        tile.getCenterY() + offsetY,
        8,
        8,
        0x92400e,
      )

      this.tweens.add({
        targets: fragment,
        x: fragment.x + (index % 2 === 0 ? -18 : 18),
        y: fragment.y - 18,
        alpha: 0,
        angle: index % 2 === 0 ? -35 : 35,
        duration: 220,
        ease: 'Quad.easeOut',
        onComplete: () => {
          fragment.destroy()
        },
      })
    })
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
    const nextStageId = resolveNextStage(GAME_CONFIG.levels, this.currentStageId)

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
    this.game.canvas.dataset.playerGrounded = String(
      playerBody.blocked.down || playerBody.touching.down,
    )
    this.game.canvas.dataset.playerBlockedUp = String(playerBody.blocked.up)
    this.game.canvas.dataset.playerBlockedLeft = String(playerBody.blocked.left)
    this.game.canvas.dataset.playerBlockedRight = String(
      playerBody.blocked.right,
    )
    this.game.canvas.dataset.playerVelocityX = String(
      Math.round(playerBody.velocity.x),
    )
    this.game.canvas.dataset.playerVelocityY = String(
      Math.round(playerBody.velocity.y),
    )
    this.game.canvas.dataset.lastBlockAction = this.lastBlockAction
    this.game.canvas.dataset.score = String(this.scoreManager?.getScore() ?? 0)
    this.game.canvas.dataset.coins = String(this.scoreManager?.getCoins() ?? 0)
    this.game.canvas.dataset.lives = String(this.scoreManager?.getLives() ?? 0)
    this.game.canvas.dataset.playerPowerState = this.player.getPowerState()
    this.game.canvas.dataset.stageId = this.currentStageId
    this.game.canvas.dataset.nextStageId = nextStageId ?? ''
    this.game.canvas.dataset.goalState = this.goalState
    this.game.canvas.dataset.goalBonus = String(this.lastGoalBonus)
    this.game.canvas.dataset.goombaCount = String(
      this.goombas?.countActive(true) ?? 0,
    )
    this.game.canvas.dataset.koopaCount = String(
      this.koopas?.countActive(true) ?? 0,
    )
    this.game.canvas.dataset.koopaState =
      (this.koopas?.getChildren()?.[0] as Koopa | undefined)?.getState() ?? ''
    this.game.canvas.dataset.lastEnemyInteraction = this.lastEnemyInteraction
  }
}
