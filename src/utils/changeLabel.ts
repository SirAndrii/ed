/** Returns a human-readable description of how difficulty changed between two assessments. */
export function changeLabel(current: string | null, past: string | null): string {
  if (
    !current ||
    !past ||
    past === 'dont-remember' ||
    past === 'not-eaten-then' ||
    past === 'skipped'
  ) {
    return 'Недостатньо даних для порівняння';
  }
  const order: Record<string, number> = { low: 0, medium: 1, high: 2 };
  const c = order[current] ?? -1;
  const p = order[past] ?? -1;
  if (c === -1 || p === -1) return 'Недостатньо даних для порівняння';
  if (c < p) return 'Стало менш складно';
  if (c > p) return 'Стало складніше';
  return 'Без помітної зміни';
}
