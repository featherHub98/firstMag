export function fmtDinars(millimes: number): string {
  return (millimes / 1000).toFixed(3);
}

export function dinarsToMillimes(dinars: number | string): number {
  const n = typeof dinars === "string" ? parseFloat(dinars) : dinars;
  if (Number.isNaN(n)) return 0;
  return Math.round(n * 1000);
}
