import type Phaser from 'phaser'

import type { ScoreManager, ScoreState } from '@/scoreManager'

const HUD_DEPTH = 1000
const HUD_FONT_FAMILY = '"Courier New", monospace'
const HUD_FONT_SIZE = '18px'
const HUD_TEXT_COLOR = '#f8fafc'
const HUD_SHADOW_COLOR = '#0f172a'
const HUD_PANEL_ALPHA = 0.26

interface GameHudOptions {
  stageId: string
  initialTimeRemainingSeconds: number
  scoreManager: ScoreManager
}

export class GameHud {
  private readonly container: Phaser.GameObjects.Container

  private readonly scoreValue: Phaser.GameObjects.Text

  private readonly coinValue: Phaser.GameObjects.Text

  private readonly worldValue: Phaser.GameObjects.Text

  private readonly timeValue: Phaser.GameObjects.Text

  private readonly livesValue: Phaser.GameObjects.Text

  private unsubscribeScore?: () => void

  public constructor(
    private readonly scene: Phaser.Scene,
    options: GameHudOptions,
  ) {
    const panel = scene.add
      .rectangle(400, 28, 760, 48, 0x0f172a, HUD_PANEL_ALPHA)
      .setOrigin(0.5)

    this.scoreValue = this.createValueText(80, '000000')
    this.coinValue = this.createValueText(250, '00')
    this.worldValue = this.createValueText(420, options.stageId)
    this.timeValue = this.createValueText(
      590,
      this.formatTime(options.initialTimeRemainingSeconds),
    )
    this.livesValue = this.createValueText(730, '03')

    const labels = [
      this.createLabelText(80, 'MARIO'),
      this.createLabelText(250, 'COINS'),
      this.createLabelText(420, 'WORLD'),
      this.createLabelText(590, 'TIME'),
      this.createLabelText(730, 'LIVES'),
    ]

    this.container = scene.add.container(0, 0, [
      panel,
      ...labels,
      this.scoreValue,
      this.coinValue,
      this.worldValue,
      this.timeValue,
      this.livesValue,
    ])
    this.container.setScrollFactor(0)
    this.container.setDepth(HUD_DEPTH)

    this.unsubscribeScore = options.scoreManager.subscribe((state) => {
      this.renderScoreState(state)
    })
  }

  public setStageId(stageId: string): void {
    this.worldValue.setText(stageId)
  }

  public setTimeRemaining(timeRemainingSeconds: number): void {
    this.timeValue.setText(this.formatTime(timeRemainingSeconds))
  }

  public destroy(): void {
    this.unsubscribeScore?.()
    this.container.destroy(true)
  }

  private renderScoreState(state: ScoreState): void {
    this.scoreValue.setText(this.formatScore(state.score))
    this.coinValue.setText(this.formatCoins(state.coins))
    this.livesValue.setText(this.formatLives(state.lives))
  }

  private createLabelText(x: number, text: string): Phaser.GameObjects.Text {
    return this.scene.add
      .text(x, 10, text, {
        color: HUD_TEXT_COLOR,
        fontFamily: HUD_FONT_FAMILY,
        fontSize: '12px',
      })
      .setOrigin(0.5, 0)
      .setShadow(1, 1, HUD_SHADOW_COLOR, 1, false, true)
  }

  private createValueText(x: number, text: string): Phaser.GameObjects.Text {
    return this.scene.add
      .text(x, 24, text, {
        color: HUD_TEXT_COLOR,
        fontFamily: HUD_FONT_FAMILY,
        fontSize: HUD_FONT_SIZE,
      })
      .setOrigin(0.5, 0)
      .setShadow(1, 1, HUD_SHADOW_COLOR, 1, false, true)
  }

  private formatScore(score: number): string {
    return score.toString().padStart(6, '0')
  }

  private formatCoins(coins: number): string {
    return coins.toString().padStart(2, '0')
  }

  private formatLives(lives: number): string {
    return lives.toString().padStart(2, '0')
  }

  private formatTime(timeRemainingSeconds: number): string {
    return Math.max(0, Math.floor(timeRemainingSeconds))
      .toString()
      .padStart(3, '0')
  }
}
