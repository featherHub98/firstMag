export * from "./articleApi";
export * from "./partnerApi";
export * from "./documentApi";
export * from "./posApi";
export * from "./stockApi";
export * from "./reportApi";
export * from "./fiscalApi";
export * from "./dashboardApi";

export function millimesToDinars(m: number): number {
  return m / 1000;
}

export function dinarsToMillimes(d: number): number {
  return Math.round(d * 1000);
}

export function fmtDinars(m: number): string {
  return (m / 1000).toFixed(3);
}
