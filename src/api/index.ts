export * from "./articleApi";
export * from "./articleCodeApi";
export * from "./partnerApi";
export * from "./familyApi";
export * from "./documentApi";
export * from "./posApi";
export * from "./stockApi";
export * from "./reportApi";
export * from "./fiscalApi";
export * from "./dashboardApi";
export * from "./depotApi";
export * from "./bankApi";
export * from "./currencyApi";
export * from "./paymentMethodApi";
export * from "./cashierApi";
export * from "./registerApi";
export * from "./rayonApi";
export * from "./gondolaApi";
export * from "./userApi";
export * from "./productRangeApi";
export * from "./tariffCategoryApi";
export * from "./accountingCategoryApi";
export * from "./advancedTaxRateApi";
export * from "./settingsApi";
export * from "./countryApi";
export * from "./bomApi";
export * from "./crmApi";
export * from "./wave6Api";

export function millimesToDinars(m: number): number {
  return m / 1000;
}

export function dinarsToMillimes(d: number): number {
  return Math.round(d * 1000);
}

export function fmtDinars(m: number): string {
  return (m / 1000).toFixed(3);
}
