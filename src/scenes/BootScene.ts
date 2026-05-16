import Phaser from 'phaser'

import {
  ATLAS_ASSETS,
  AUDIO_ASSETS,
  SCENE_KEYS,
  TILEMAP_ASSETS,
  TILESET_ASSETS,
} from '@/assets'
import { GAME_CONFIG, GAME_TITLE } from '@/config'

export class BootScene extends Phaser.Scene {
  public constructor() {
    super(SCENE_KEYS.boot)
  }

  public preload(): void {
    const { width, height } = this.scale
    const progressBarWidth = Math.min(width - 96, 320)
    const progressBarHeight = 20
    const progressBarX = (width - progressBarWidth) / 2
    const progressBarY = height / 2 - 10

    this.cameras.main.setBackgroundColor('#111827')

    const loadingText = this.add
      .text(width / 2, height / 2 - 56, 'Loading…', {
        color: '#f8fafc',
        fontFamily: 'Arial, sans-serif',
        fontSize: '32px',
      })
      .setOrigin(0.5)

    const progressText = this.add
      .text(width / 2, progressBarY + 42, '0%', {
        color: '#94a3b8',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
      })
      .setOrigin(0.5)

    const manifestText = this.add
      .text(
        width / 2,
        progressBarY + 68,
        `${GAME_TITLE} • ${GAME_CONFIG.levels.join(', ')}`,
        {
          color: '#64748b',
          fontFamily: 'Arial, sans-serif',
          fontSize: '14px',
        },
      )
      .setOrigin(0.5)

    const progressBox = this.add.graphics()
    const progressBar = this.add.graphics()

    progressBox.fillStyle(0x0f172a, 0.9)
    progressBox.fillRoundedRect(
      progressBarX - 4,
      progressBarY - 4,
      progressBarWidth + 8,
      progressBarHeight + 8,
      6,
    )

    this.load.on('progress', (value: number) => {
      progressBar.clear()
      progressBar.fillStyle(0x38bdf8, 1)
      progressBar.fillRoundedRect(
        progressBarX,
        progressBarY,
        progressBarWidth * value,
        progressBarHeight,
        4,
      )
      progressText.setText(`${Math.round(value * 100)}%`)
    })

    this.load.once('complete', () => {
      progressBar.clear()
      progressBar.fillStyle(0x22c55e, 1)
      progressBar.fillRoundedRect(
        progressBarX,
        progressBarY,
        progressBarWidth,
        progressBarHeight,
        4,
      )
      progressText.setText('100%')
      loadingText.setText('Loaded')
      manifestText.setText('Assets ready')

      this.time.delayedCall(150, () => {
        this.scene.start(SCENE_KEYS.menu)
      })
    })

    for (const asset of ATLAS_ASSETS) {
      this.load.atlas(asset.key, asset.textureURL, asset.atlasURL)
    }

    for (const asset of TILESET_ASSETS) {
      this.load.image(asset.key, asset.textureURL)
    }

    for (const asset of TILEMAP_ASSETS) {
      this.load.tilemapTiledJSON(asset.key, asset.tilemapURL)
    }

    for (const asset of AUDIO_ASSETS) {
      this.load.audio(asset.key, asset.audioURL)
    }
  }
}
