import Phaser from 'phaser'

import { ASSET_KEYS } from '@/assets'
import {
  COLLECTIBLE_KIND,
  type CollectibleKind,
} from '@/collectibles'

const COLLECTIBLE_ANIMATION_KEYS = {
  coin: 'collectible-coin-spin',
} as const

function resolveFrame(kind: CollectibleKind): string {
  switch (kind) {
    case COLLECTIBLE_KIND.coin:
      return 'coin-spin-0'
    case COLLECTIBLE_KIND.mushroom:
      return 'mushroom-idle-0'
    case COLLECTIBLE_KIND.fireFlower:
      return 'flower-idle-0'
    case COLLECTIBLE_KIND.star:
      return 'star-idle-0'
  }
}

export class Collectible extends Phaser.Physics.Arcade.Sprite {
  public readonly kind: CollectibleKind

  public constructor(scene: Phaser.Scene, x: number, y: number, kind: CollectibleKind) {
    super(scene, x, y, ASSET_KEYS.atlases.items, resolveFrame(kind))

    this.kind = kind

    scene.add.existing(this)
    scene.physics.add.existing(this)

    const body = this.body as Phaser.Physics.Arcade.Body

    body.setAllowGravity(false)
    body.setImmovable(true)
    body.setSize(18, 18)
    body.setOffset(7, 7)

    if (kind === COLLECTIBLE_KIND.coin) {
      this.play(COLLECTIBLE_ANIMATION_KEYS.coin)
    }
  }

  public static ensureAnimations(scene: Phaser.Scene): void {
    if (!scene.anims.exists(COLLECTIBLE_ANIMATION_KEYS.coin)) {
      scene.anims.create({
        key: COLLECTIBLE_ANIMATION_KEYS.coin,
        frames: [{ key: ASSET_KEYS.atlases.items, frame: 'coin-spin-0' }],
        frameRate: 1,
        repeat: -1,
      })
    }
  }
}
