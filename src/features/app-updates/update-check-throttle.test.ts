import { describe, expect, it } from 'vitest';

import { shouldCheckForUpdate } from './update-check-throttle';

describe('shouldCheckForUpdate', () => {
  it('checks the first time', () => {
    expect(shouldCheckForUpdate(null, 1_000, 60_000)).toBe(true);
  });

  it('waits for the interval between checks', () => {
    expect(shouldCheckForUpdate(1_000, 30_000, 60_000)).toBe(false);
    expect(shouldCheckForUpdate(1_000, 61_000, 60_000)).toBe(true);
  });
});
