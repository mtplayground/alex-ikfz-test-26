import Phaser from 'phaser'

import { ASSET_KEYS } from '@/assets'
import { resolveGoombaPatrolDirection, type GoombaDirection } from '@/enemies/goombaLogic'

const GOOMBA_ANIMATION_KEY = 'goomba-walk'
const GOOMBA_SPEED = 44

export class Goomba extends Phaser.Physics.Arcade.Sprite {
  private direction: GoombaDirection = -1

  private defeated = false

  public constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, ASSET_KEYS.atlases.enemies, 'goomba-walk-0')

    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.setOrigin(0.5, 1)
    this.setCollideWorldBounds(true)

    const body = this.body as Phaser.Physics.Arcade.Body
    body.setSize(20, 18)
    body.setOffset(6, 14)

    this.play(GOOMBA_ANIMATION_KEY)
  }

  public static ensureAnimations(scene: Phaser.Scene): void {
    if (scene.anims.exists(GOOMBA_ANIMATION_KEY)) {
      return
    }

    scene.anims.create({
      key: GOOMBA_ANIMATION_KEY,
      frames: [
        { key: ASSET_KEYS.atlases.enemies, frame: 'goomba-walk-0' },
        { key: ASSET_KEYS.atlases.enemies, frame: 'goomba-walk-1' },
      ],
      frameRate: 5,
      repeat: -1,
    })
  }

  public updatePatrol(): void {
    if (this.defeated) {
      return
    }

    const body = this.body as Phaser.Physics.Arcade.Body

    this.direction = resolveGoombaPatrolDirection({
      direction: this.direction,
      blockedLeft: body.blocked.left,
      blockedRight: body.blocked.right,
    })

    body.setVelocityX(this.direction * GOOMBA_SPEED)
    this.setFlipX(this.direction > 0)
  }

  public squash(): void {
    if (this.defeated) {
      return
    }

    this.defeated = true

    const body = this.body as Phaser.Physics.Arcade.Body

    body.enable = false
    body.stop()
    this.setActive(false)
    this.setScale(1.1, 0.45)
    this.setTint(0x854d0e)

    this.scene.time.delayedCall(220, () => {
      this.destroy()
    })
  }

  public isDefeated(): boolean {
    return this.defeated
  }
}
