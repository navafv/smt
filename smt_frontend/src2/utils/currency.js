/**
 * Localized Indian Numbering System Currency & Valuation Formatters
 * Establishes deterministic parsing pipelines for financial reporting panels.
 */

const INR_LOCALE = "en-IN";
const INR_CURRENCY = "INR";

/**
 * Safely normalizes input arguments into a guaranteed finite number.
 * Prevents system degradation or layout breaks on NaN/Infinity boundaries.
 * * @param {any} value - The raw input parameter to parse
 * @returns {number} A validated finite number representation or zero
 */
const cleanFiniteAmount = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
};

/**
 * Standard Indian Currency Formatter (₹ Lakh / Crore system)
 * Outputs standard structural pricing strings (e.g., ₹1,50,000.00)
 */
export function formatCurrencyINR(value, options = {}) {
  const amount = cleanFiniteAmount(value);

  return new Intl.NumberFormat(INR_LOCALE, {
    style: "currency",
    currency: INR_CURRENCY,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  }).format(amount);
}

/**
 * Compact Indian Currency Formatter (Short Notation)
 * Condenses massive asset values for analytical data charts (e.g., ₹1.5L, ₹10Cr)
 */
export function formatCurrencyCompact(value, options = {}) {
  const amount = cleanFiniteAmount(value);

  return new Intl.NumberFormat(INR_LOCALE, {
    style: "currency",
    currency: INR_CURRENCY,
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
    ...options,
  }).format(amount);
}

/**
 * Localized Plain Raw Number Formatter
 * Formats weights, volumes, and metrics using the standard Indian comma-grouping structure
 */
export function formatNumberIN(value, options = {}) {
  const amount = cleanFiniteAmount(value);

  return new Intl.NumberFormat(INR_LOCALE, {
    maximumFractionDigits: 2,
    ...options,
  }).format(amount);
}
