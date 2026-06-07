// Small format helpers used across screens.
export const fmtRWF = (n: number): string =>
  "RWF " + Number(n).toLocaleString("en-US");

export const fmtNumber = (n: number): string =>
  Number(n).toLocaleString("en-US");
