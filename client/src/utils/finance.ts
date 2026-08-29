/**
 * Mortgage / affordability maths. Pure functions so they're easy to reason
 * about and reuse. Rates are annual percentages (e.g. 22 for 22%).
 */

export interface EmiResult {
  emi: number; // monthly payment
  total: number; // total paid over the term
  interest: number; // total interest paid
}

/** Standard reducing-balance EMI. Returns null for invalid inputs. */
export function calcEmi(principal: number, annualRatePct: number, years: number): EmiResult | null {
  if (!(principal > 0) || !(years > 0)) return null;
  const n = Math.round(years * 12);
  const r = annualRatePct / 100 / 12;
  if (r === 0) {
    const emi = principal / n;
    return { emi, total: principal, interest: 0 };
  }
  const pow = Math.pow(1 + r, n);
  const emi = (principal * r * pow) / (pow - 1);
  return { emi, total: emi * n, interest: emi * n - principal };
}

/**
 * Max loan a buyer can afford: the monthly amount left after existing
 * obligations, capped at `dti` of income, converted back to a principal.
 */
export function maxAffordableLoan(
  monthlyIncome: number,
  existingObligations: number,
  annualRatePct: number,
  years: number,
  dti = 0.4,
): number {
  const availableEmi = Math.max(0, monthlyIncome * dti - existingObligations);
  const n = Math.round(years * 12);
  const r = annualRatePct / 100 / 12;
  if (availableEmi <= 0 || n <= 0) return 0;
  if (r === 0) return availableEmi * n;
  const pow = Math.pow(1 + r, n);
  return (availableEmi * (pow - 1)) / (r * pow);
}
