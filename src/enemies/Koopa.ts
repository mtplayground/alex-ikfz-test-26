import Phaser from 'phaser'

import { ASSET_KEYS } from '@/assets'
import {
  resolveKoopaPatrolDirection,
  type KoopaState,
} from '@/enemies/koopaLogic'
import type { GoombaDirection } from '@/enemies/goombaLogic'

const KOOPA_WALK_ANIMATION_KEY = 'koopa-walk'
const KOOPA_SHELL_FRAME = 'koopa-shell-0'
const KOOPA_WALK_SPEED = 40
const KOOPA_SHELL_SPEED = 220

export class Koopa extends Phaser.Physics.Arcade.Sprite {
  private direction: GoombaDirection = -1

  private koopaState: KoopaState = 'walking'

  private defeated = false

  public constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, ASSET_KEYS.atlases.enemies, 'koopa-walk-0')

    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.setOrigin(0.5, 1)
    this.setCollideWorldBounds(true)

    this.applyWalkingBody()
    this.play(KOOPA_WALK_ANIMATION_KEY)
  }

  public static ensureAnimations(scene: Phaser.Scene): void {
    if (scene.anims.exists(KOOPA_WALK_ANIMATION_KEY)) {
      return
    }

    scene.anims.create({
      key: KOOPA_WALK_ANIMATION_KEY,
      frames: [{ key: ASSET_KEYS.atlases.enemies, frame: 'koopa-walk-0' }],
      frameRate: 1,
      repeat: -1,
    })
  }

  public updateMovement(): void {
    if (this.defeated) {
      return
    }

    const body = this.body as Phaser.Physics.Arcade.Body

    if (this.koopaState === 'walking') {
      this.direction = resolveKoopaPatrolDirection({
        direction: this.direction,
        blockedLeft: body.blocked.left,
        blockedRight: body.blocked.right,
      })
      body.setVelocityX(this.direction * KOOPA_WALK_SPEED)
      this.setFlipX(this.direction > 0)
      return
    }

    if (this.koopaState === 'shell-idle') {
      body.setVelocityX(0)
      return
    }

    this.direction = resolveKoopaPatrolDirection({
      direction: this.direction,
      blockedLeft: body.blocked.left,
      blockedRight: body.blocked.right,
    })
    body.setVelocityX(this.direction * KOOPA_SHELL_SPEED)
  }

  public stompIntoShell(): void {
    if (this.defeated || this.koopaState !== 'walking') {
      return
    }

    this.koopaState = 'shell-idle'
    this.setFrame(KOOPA_SHELL_FRAME)
    this.applyShellBody()
  }

  public kickShell(direction: GoombaDirection): void {
    if (this.defeated) {
      return
    }

    this.koopaState = 'shell-sliding'
    this.direction = direction
    this.setFrame(KOOPA_SHELL_FRAME)
    this.applyShellBody()
    this.setFlipX(this.direction > 0)
  }

  public defeat(): void {
    if (this.defeated) {
      return
    }

    this.defeated = true

    const body = this.body as Phaser.Physics.Arcade.Body

    body.enable = false
    body.stop()
    this.setActive(false)
    this.setScale(1.1, 0.45)
    this.setTint(0x16a34a)

    this.scene.time.delayedCall(220, () => {
      this.destroy()
    })
  }

  public isDefeated(): boolean {
    return this.defeated
  }

  public getState(): KoopaState {
    return this.koopaState
  }

  public isShellSliding(): boolean {
    return this.koopaState === 'shell-sliding'
  }

  private applyWalkingBody(): void {
    const body = this.body as Phaser.Physics.Arcade.Body

    this.setScale(1)
    body.setSize(20, 28)
    body.setOffset(6, 4)
  }

  private applyShellBody(): void {
    const body = this.body as Phaser.Physics.Arcade.Body

    this.setScale(1)
    body.setSize(22, 18)
    body.setOffset(5, 14)
  }
}
