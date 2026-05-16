import Phaser from 'phaser'

import {
  FIREBALL_BOUNCE_VELOCITY,
  FIREBALL_LIFETIME_MS,
  FIREBALL_SPEED,
} from '@/fireball'

export class Fireball extends Phaser.Physics.Arcade.Sprite {
  private readonly direction: -1 | 1

  private readonly expiresAt: number

  public constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    direction: -1 | 1,
  ) {
    super(scene, x, y, '__fireball-texture')

    this.direction = direction
    this.expiresAt = scene.time.now + FIREBALL_LIFETIME_MS

    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.setScale(0.5)
    this.setCollideWorldBounds(true)
    this.setBounce(0, 1)
    this.setTint(0xf97316)

    const body = this.body as Phaser.Physics.Arcade.Body
    body.setSize(16, 16)
    body.setAllowGravity(true)
    body.setVelocity(this.direction * FIREBALL_SPEED, FIREBALL_BOUNCE_VELOCITY)
  }

  public static ensureTexture(scene: Phaser.Scene): void {
    if (scene.textures.exists('__fireball-texture')) {
      return
    }

    const graphics = scene.add.graphics()
    graphics.setVisible(false)
    graphics.fillStyle(0xffffff)
    graphics.fillCircle(8, 8, 8)
    graphics.generateTexture('__fireball-texture', 16, 16)
    graphics.destroy()
  }

  public updateMotion(now: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body

    if (now >= this.expiresAt || body.blocked.left || body.blocked.right || body.blocked.up) {
      this.destroy()
      return
    }

    if (body.blocked.down && body.velocity.y >= 0) {
      body.setVelocityY(FIREBALL_BOUNCE_VELOCITY)
    }

    body.setVelocityX(this.direction * FIREBALL_SPEED)
  }
}
