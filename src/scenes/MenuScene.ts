import Phaser from 'phaser'

import { GAME_CONFIG, GAME_TITLE } from '@/config'
import { SCENE_KEYS } from '@/assets'

export class MenuScene extends Phaser.Scene {
  public constructor() {
    super(SCENE_KEYS.menu)
  }

  public create(): void {
    const { width, height } = this.scale

    this.cameras.main.setBackgroundColor('#0f172a')

    this.add
      .text(width / 2, height / 2 - 18, 'Menu Ready', {
        color: '#f8fafc',
        fontFamily: 'Arial, sans-serif',
        fontSize: '30px',
      })
      .setOrigin(0.5)

    this.add
      .text(
        width / 2,
        height / 2 + 22,
        `${GAME_TITLE} • ${GAME_CONFIG.levels.join(', ')}`,
        {
          color: '#94a3b8',
          fontFamily: 'Arial, sans-serif',
          fontSize: '14px',
        },
      )
      .setOrigin(0.5)
  }
}
