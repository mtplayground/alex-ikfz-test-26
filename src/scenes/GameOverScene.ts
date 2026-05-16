import Phaser from 'phaser'

import { SCENE_KEYS } from '@/assets'
import { GAME_TITLE } from '@/config'
import { getScoreManager, resetScoreManagerSingleton } from '@/scoreManager'
import { createStorageService } from '@/storageService'
import { getFirstStageId, STAGE_IDS } from '@/stages'

interface GameOverSceneData {
  completedRun?: boolean
  score?: number
  reason?: 'defeat' | 'timeout'
  stageId?: string
}

export class GameOverScene extends Phaser.Scene {
  private completedRun = false

  private finalScore = 0

  private reason: 'defeat' | 'timeout' = 'defeat'

  private stageId = getFirstStageId()

  public constructor() {
    super(SCENE_KEYS.gameOver)
  }

  public init(data: GameOverSceneData = {}): void {
    this.completedRun = data.completedRun === true
    this.finalScore = data.score ?? 0
    this.reason = data.reason ?? 'defeat'
    this.stageId = data.stageId?.trim() || getFirstStageId()
  }

  public create(): void {
    const { width, height } = this.scale
    const headline = this.completedRun ? 'All Clear' : 'Game Over'
    const storageService = createStorageService(STAGE_IDS)
    const scoreManager = getScoreManager(storageService)
    const highScore = storageService.getHighScore()
    const remainingLives = scoreManager.getLives()
    const shouldRetryStage = !this.completedRun && remainingLives > 0
    const subhead = this.completedRun
      ? 'Thanks for playing. Every configured stage is complete.'
      : this.reason === 'timeout'
        ? 'Time ran out.'
        : 'The run has ended.'
    const actionText = this.completedRun
      ? 'Press Enter to return to the menu'
      : shouldRetryStage
        ? `Press Enter to retry ${this.stageId}`
        : 'Press Enter to return to the menu'

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
      .text(
        width / 2,
        height / 2 + 84,
        `High Score: ${highScore} • Lives: ${remainingLives}`,
        {
          color: '#e2e8f0',
          fontFamily: 'Arial, sans-serif',
          fontSize: '15px',
        },
      )
      .setOrigin(0.5)

    this.add
      .text(width / 2, height / 2 + 118, actionText, {
        color: '#64748b',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
      })
      .setOrigin(0.5)

    this.input.keyboard?.once('keydown-ENTER', () => {
      if (shouldRetryStage) {
        this.scene.start(SCENE_KEYS.game, {
          stageId: this.stageId,
          resetRun: false,
        })
        return
      }

      resetScoreManagerSingleton()
      this.scene.start(SCENE_KEYS.menu)
    })

    this.game.canvas.dataset.scene = SCENE_KEYS.gameOver
    this.game.canvas.dataset.gameOverCompletedRun = String(this.completedRun)
    this.game.canvas.dataset.gameOverScore = String(this.finalScore)
    this.game.canvas.dataset.gameOverReason = this.reason
    this.game.canvas.dataset.gameOverStageId = this.stageId
    this.game.canvas.dataset.gameOverLives = String(remainingLives)
    this.game.canvas.dataset.gameOverHighScore = String(highScore)
    this.game.canvas.dataset.gameOverRetryAvailable = String(shouldRetryStage)
  }
}
