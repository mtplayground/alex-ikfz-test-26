import Phaser from 'phaser'

import { SCENE_KEYS } from '@/assets'
import { GAME_TITLE } from '@/config'

interface GameOverSceneData {
  completedRun?: boolean
  score?: number
  reason?: 'defeat' | 'timeout'
}

export class GameOverScene extends Phaser.Scene {
  private completedRun = false

  private finalScore = 0

  private reason: 'defeat' | 'timeout' = 'defeat'

  public constructor() {
    super(SCENE_KEYS.gameOver)
  }

  public init(data: GameOverSceneData = {}): void {
    this.completedRun = data.completedRun === true
    this.finalScore = data.score ?? 0
    this.reason = data.reason ?? 'defeat'
  }

  public create(): void {
    const { width, height } = this.scale
    const headline = this.completedRun ? 'All Clear' : 'Game Over'
    const subhead = this.completedRun
      ? 'Every configured stage is complete.'
      : this.reason === 'timeout'
        ? 'Time ran out.'
        : 'The run has ended.'

    this.cameras.main.setBackgroundColor('#111827')

    this.add
      .text(width / 2, height / 2 - 72, GAME_TITLE, {
        color: '#94a3b8',
        fontFamily: 'Arial, sans-serif',
        fontSize: '18px',
      })
      .setOrigin(0.5)

    this.add
      .text(width / 2, height / 2 - 24, headline, {
        color: '#f8fafc',
        fontFamily: 'Arial, sans-serif',
        fontSize: '34px',
      })
      .setOrigin(0.5)

    this.add
      .text(width / 2, height / 2 + 20, subhead, {
        color: '#cbd5e1',
        fontFamily: 'Arial, sans-serif',
        fontSize: '16px',
      })
      .setOrigin(0.5)

    this.add
      .text(width / 2, height / 2 + 54, `Final Score: ${this.finalScore}`, {
        color: '#facc15',
        fontFamily: 'Arial, sans-serif',
        fontSize: '18px',
      })
      .setOrigin(0.5)

    this.add
      .text(width / 2, height / 2 + 104, 'Press Enter to return to the menu', {
        color: '#64748b',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
      })
      .setOrigin(0.5)

    this.input.keyboard?.once('keydown-ENTER', () => {
      this.scene.start(SCENE_KEYS.menu)
    })

    this.game.canvas.dataset.scene = SCENE_KEYS.gameOver
    this.game.canvas.dataset.gameOverCompletedRun = String(this.completedRun)
    this.game.canvas.dataset.gameOverScore = String(this.finalScore)
    this.game.canvas.dataset.gameOverReason = this.reason
  }
}
