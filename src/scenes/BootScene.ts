import Phaser from 'phaser'

import { GAME_CONFIG, GAME_TITLE } from '@/config'

export class BootScene extends Phaser.Scene {
  public constructor() {
    super('boot-scene')
  }

  public create(): void {
    const { width, height } = this.scale

    this.cameras.main.setBackgroundColor('#111827')

    this.add
      .text(width / 2, height / 2 - 18, 'Loading…', {
        color: '#f8fafc',
        fontFamily: 'Arial, sans-serif',
        fontSize: '32px',
      })
      .setOrigin(0.5)

    this.add
      .text(
        width / 2,
        height / 2 + 24,
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
