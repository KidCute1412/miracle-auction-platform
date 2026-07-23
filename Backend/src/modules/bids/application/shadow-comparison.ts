export interface ShadowComparisonSnapshot {
  matched: number;
  mismatched: number;
}

const counters: ShadowComparisonSnapshot = { matched: 0, mismatched: 0 };

export function recordShadowComparison(matched: boolean): void {
  if (matched) counters.matched += 1;
  else counters.mismatched += 1;
}

export function shadowComparisonSnapshot(): ShadowComparisonSnapshot {
  return { ...counters };
}

export function resetShadowComparison(): void {
  counters.matched = 0;
  counters.mismatched = 0;
}
