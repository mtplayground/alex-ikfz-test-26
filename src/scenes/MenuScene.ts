import Phaser from 'phaser'

import type { StorageLike, StorageService } from '@/storageService'
import { ASSET_KEYS, SCENE_KEYS } from '@/assets'
import { getAudioManager } from '@/audioManager'
import { GAME_CONFIG, GAME_TITLE } from '@/config'
import { createStorageService, resolveBrowserStorage } from '@/storageService'

type MenuAction = 'start' | 'continue' | 'reset'

interface MenuOption {
  action: MenuAction
  label: string
}

export class MenuScene extends Phaser.Scene {
  private readonly menuOptions: MenuOption[] = [
    { action: 'start', label: 'Start New Game' },
    { action: 'continue', label: 'Continue' },
    { action: 'reset', label: 'Reset Save' },
  ]

  private selectedIndex = 0

  private storage: StorageLike | undefined

  private storageService!: StorageService

  private highScoreText?: Phaser.GameObjects.Text

  private statusText?: Phaser.GameObjects.Text

  private optionTexts: Phaser.GameObjects.Text[] = []

  public constructor() {
    super(SCENE_KEYS.menu)
  }

  public create(): void {
    const { width, height } = this.scale

    this.storage = resolveBrowserStorage()
    this.storageService = createStorageService(GAME_CONFIG.levels, this.storage)

    this.cameras.main.setBackgroundColor('#0f172a')

    const audioManager = getAudioManager(this)
    audioManager.registerDefaultSfx()
    audioManager.bindUnlockOnFirstInteraction()
    audioManager.playBgm(ASSET_KEYS.audio.overworldTheme)

    this.add
      .text(width / 2, 82, GAME_TITLE, {
        color: '#f8fafc',
        fontFamily: 'Arial, sans-serif',
        fontSize: '34px',
      })
      .setOrigin(0.5)

    this.add
      .text(width / 2, 122, `Worlds: ${GAME_CONFIG.levels.join(', ')}`, {
        color: '#94a3b8',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
      })
      .setOrigin(0.5)

    this.highScoreText = this.add
      .text(width / 2, 168, '', {
        color: '#facc15',
        fontFamily: 'Arial, sans-serif',
        fontSize: '18px',
      })
      .setOrigin(0.5)

    this.add
      .text(width / 2, 204, 'Use ↑ ↓ to choose, Enter to confirm', {
        color: '#64748b',
        fontFamily: 'Arial, sans-serif',
        fontSize: '13px',
      })
      .setOrigin(0.5)

    const baseY = height / 2 - 8
    const spacing = 46

    this.optionTexts = this.menuOptions.map((option, index) =>
      this.add
        .text(width / 2, baseY + index * spacing, option.label, {
          color: '#cbd5e1',
          fontFamily: 'Arial, sans-serif',
          fontSize: '24px',
        })
        .setOrigin(0.5),
    )

    this.statusText = this.add
      .text(width / 2, height - 74, '', {
        color: '#94a3b8',
        fontFamily: 'Arial, sans-serif',
        fontSize: '15px',
        align: 'center',
        wordWrap: { width: width - 80, useAdvancedWrap: true },
      })
      .setOrigin(0.5)

    this.input.keyboard?.on('keydown-UP', () => {
      this.moveSelection(-1)
    })

    this.input.keyboard?.on('keydown-DOWN', () => {
      this.moveSelection(1)
    })

    this.input.keyboard?.on('keydown-ENTER', () => {
      this.confirmSelection()
    })

    this.refreshMenu()
  }

  private moveSelection(delta: number): void {
    const optionCount = this.menuOptions.length

    this.selectedIndex =
      (this.selectedIndex + delta + optionCount) % optionCount

    getAudioManager(this).playSfx(ASSET_KEYS.audio.coin)

    this.refreshMenu()
  }

  private confirmSelection(): void {
    const selectedOption = this.menuOptions[this.selectedIndex]

    if (selectedOption === undefined) {
      return
    }

    switch (selectedOption.action) {
      case 'start':
        this.startNewGame()
        break
      case 'continue':
        this.continueGame()
        break
      case 'reset':
        this.resetProgress()
        break
    }
  }

  private startNewGame(): void {
    const startingStage = GAME_CONFIG.levels[0] ?? '1-1'

    this.storageService.setFurthestStage(startingStage)
    getAudioManager(this).playSfx(ASSET_KEYS.audio.powerup)
    this.scene.start(SCENE_KEYS.game, {
      stageId: startingStage,
      resetRun: true,
    })
  }

  private continueGame(): void {
    if (this.storageService.getFurthestStage() === null) {
      getAudioManager(this).playSfx(ASSET_KEYS.audio.stomp)
      this.refreshMenu('No saved run is available yet. Start a new game first.')
      return
    }

    getAudioManager(this).playSfx(ASSET_KEYS.audio.powerup)
    this.scene.start(SCENE_KEYS.game, {
      stageId: this.storageService.getFurthestStage(),
      resetRun: false,
    })
  }

  private resetProgress(): void {
    const retainedHighScore = this.storageService.getHighScore()

    this.storageService.reset()
    this.storageService.setHighScore(retainedHighScore)

    getAudioManager(this).playSfx(ASSET_KEYS.audio.stomp)
    this.refreshMenu('Saved progress cleared. High score retained.')
  }

  private refreshMenu(statusMessage?: string): void {
    const highScore = this.storageService.getHighScore()
    const furthestStage = this.storageService.getFurthestStage()
    const hasSave = furthestStage !== null

    this.highScoreText?.setText(`High Score: ${highScore}`)

    this.optionTexts.forEach((textObject, index) => {
      const option = this.menuOptions[index]

      if (option === undefined) {
        return
      }

      const isSelected = index === this.selectedIndex
      const isDisabled = option.action === 'continue' && !hasSave
      const prefix = isSelected ? '▶ ' : '  '
      const suffix = isDisabled ? ' (Unavailable)' : ''

      textObject.setText(`${prefix}${option.label}${suffix}`)
      textObject.setColor(
        isDisabled ? '#64748b' : isSelected ? '#f8fafc' : '#cbd5e1',
      )
      textObject.setScale(isSelected ? 1.04 : 1)
    })

    if (statusMessage !== undefined) {
      this.statusText?.setText(statusMessage)
      this.syncCanvasState()
      return
    }

    if (hasSave) {
      this.statusText?.setText(
        `Current save: ${furthestStage} • Continue is available.`,
      )
      this.syncCanvasState()
      return
    }

    this.statusText?.setText(
      'No active save. Start a new game to enable Continue.',
    )
    this.syncCanvasState()
  }

  private syncCanvasState(): void {
    const furthestStage = this.storageService.getFurthestStage()
    const highScore = this.storageService.getHighScore()

    this.game.canvas.dataset.menuSelection =
      this.menuOptions[this.selectedIndex]?.action ?? 'unknown'
    this.game.canvas.dataset.menuHasSave = String(furthestStage !== null)
    this.game.canvas.dataset.menuLevel = furthestStage ?? ''
    this.game.canvas.dataset.menuHighScore = String(highScore)
    this.game.canvas.dataset.menuStatus = this.statusText?.text ?? ''
  }
}
