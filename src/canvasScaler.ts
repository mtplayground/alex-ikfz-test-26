type CanvasSize = {
  width: number
  height: number
}

export type CanvasScaleState = CanvasSize & {
  scale: number
  offsetX: number
  offsetY: number
}

function calculateCanvasScaleState(
  viewportWidth: number,
  viewportHeight: number,
  canvasSize: CanvasSize,
): CanvasScaleState {
  const widthRatio = Math.floor(viewportWidth / canvasSize.width)
  const heightRatio = Math.floor(viewportHeight / canvasSize.height)
  const scale = Math.max(1, Math.min(widthRatio, heightRatio))
  const width = canvasSize.width * scale
  const height = canvasSize.height * scale

  return {
    scale,
    width,
    height,
    offsetX: Math.max(0, Math.floor((viewportWidth - width) / 2)),
    offsetY: Math.max(0, Math.floor((viewportHeight - height) / 2)),
  }
}

function applyCanvasScaleState(
  container: HTMLElement,
  canvas: HTMLCanvasElement,
  state: CanvasScaleState,
): void {
  container.style.setProperty('--game-canvas-width', `${state.width}px`)
  container.style.setProperty('--game-canvas-height', `${state.height}px`)
  container.style.setProperty('--game-canvas-offset-x', `${state.offsetX}px`)
  container.style.setProperty('--game-canvas-offset-y', `${state.offsetY}px`)

  canvas.style.width = `${state.width}px`
  canvas.style.height = `${state.height}px`
  canvas.style.marginLeft = `${state.offsetX}px`
  canvas.style.marginTop = `${state.offsetY}px`

  canvas.dataset.scale = String(state.scale)
  canvas.dataset.scaledWidth = String(state.width)
  canvas.dataset.scaledHeight = String(state.height)
  canvas.dataset.letterboxX = String(state.offsetX)
  canvas.dataset.letterboxY = String(state.offsetY)
}

export function installIntegerCanvasScaler(
  container: HTMLElement,
  canvas: HTMLCanvasElement,
  canvasSize: CanvasSize,
): () => void {
  const updateScale = () => {
    const state = calculateCanvasScaleState(
      window.innerWidth,
      window.innerHeight,
      canvasSize,
    )

    applyCanvasScaleState(container, canvas, state)
  }

  updateScale()
  window.addEventListener('resize', updateScale)

  return () => {
    window.removeEventListener('resize', updateScale)
  }
}
