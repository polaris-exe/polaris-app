/** True when no check has run yet or the last one is older than `minIntervalMs`. */
export function shouldCheckForUpdate(
  lastCheckAt: number | null,
  now: number,
  minIntervalMs: number,
): boolean {
  return lastCheckAt === null || now - lastCheckAt >= minIntervalMs;
}
