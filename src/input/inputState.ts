type KeyLike = {
  isDown: boolean
}

export type InputBindings<TAction extends string> = Record<TAction, KeyLike[]>

export class InputStateTracker<TAction extends string> {
  private readonly bindings: InputBindings<TAction>

  private readonly currentDownState: Record<TAction, boolean>

  private readonly previousDownState: Record<TAction, boolean>

  public constructor(bindings: InputBindings<TAction>) {
    this.bindings = bindings
    this.currentDownState = Object.fromEntries(
      Object.keys(bindings).map((action) => [action, false]),
    ) as Record<TAction, boolean>
    this.previousDownState = { ...this.currentDownState }
  }

  public update(): void {
    for (const action of Object.keys(this.bindings) as TAction[]) {
      this.previousDownState[action] = this.currentDownState[action]
      this.currentDownState[action] = this.bindings[action].some(
        (binding) => binding.isDown,
      )
    }
  }

  public isDown(action: TAction): boolean {
    return this.currentDownState[action]
  }

  public justPressed(action: TAction): boolean {
    return this.currentDownState[action] && !this.previousDownState[action]
  }
}
