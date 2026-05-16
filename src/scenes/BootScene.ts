import Phaser from 'phaser'

export class BootScene extends Phaser.Scene {
  public constructor() {
    super('boot-scene')
  }

  public create(): void {
    const { width, height } = this.scale

    this.cameras.main.setBackgroundColor('#111827')

    this.add
      .text(width / 2, height / 2, 'Loading…', {
        color: '#f8fafc',
        fontFamily: 'Arial, sans-serif',
        fontSize: '32px',
      })
      .setOrigin(0.5)
  }
}
