class SoundEngine {
  private isEnabled: boolean = false;

  public toggle(): boolean {
    this.isEnabled = !this.isEnabled;
    return this.isEnabled;
  }

  public getEnabled(): boolean {
    return this.isEnabled;
  }

  public playNav(): void {}
  public playSelect(): void {}
  public playBack(): void {}
}

export const sounds = new SoundEngine();
