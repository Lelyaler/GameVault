import { describe, it, expect } from 'vitest';
import { sounds } from './soundEffects';

describe('SoundEngine', () => {
  it('toggles sound enabled state', () => {
    const initial = sounds.getEnabled();
    const next = sounds.toggle();
    expect(next).toBe(!initial);
    expect(sounds.getEnabled()).toBe(next);
  });

  it('safely handles play invocations without error', () => {
    expect(() => {
      sounds.playNav();
      sounds.playSelect();
      sounds.playBack();
    }).not.toThrow();
  });
});
