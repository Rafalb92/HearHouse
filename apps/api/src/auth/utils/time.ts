export function minutesToMs(min: number) {
  return min * 60 * 1000;
}

export function daysToMs(days: number) {
  return days * 24 * 60 * 60 * 1000;
}

export function nowPlusMinutes(min: number) {
  const d = new Date();
  d.setMinutes(d.getMinutes() + min);
  return d;
}

export function nowPlusDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}
