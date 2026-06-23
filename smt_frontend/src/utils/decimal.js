/**
 * Decimal Arithmetic Validation & Data Aggregation Utilities
 * Manages calculations, step intervals, and validation boundaries for pricing fields.
 */

/**
 * Safely parses string inputs into true floating-point decimal numbers.
 * @param {any} value - The raw candidate parameter variable to parse
 * @returns {number} A validated finite floating-point number representation or zero
 */
export function decimalToNumber(value) {
  if (value === null || value === undefined) return 0;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Converts dynamic values into fixed-precision string representations.
 * @param {any} value - The numeric target value
 * @param {number} fractionDigits - Fractional precision truncation boundary
 * @returns {string} Truncated string representation
 */
export function decimalToString(value, fractionDigits = 2) {
  return decimalToNumber(value).toFixed(fractionDigits);
}

/**
 * Accumulates structural array blocks containing mixed pricing variables.
 * @param {any[]} values - An array of numerical inputs or string expressions
 * @returns {number} Sum total of all array values parsed cleanly
 */
export function sumDecimalValues(values) {
  if (!Array.isArray(values)) return 0;
  return values.reduce((sum, value) => sum + decimalToNumber(value), 0);
}

/**
 * Clamps numeric values between dynamic minimum and maximum limits.
 * @param {any} value - Raw candidate target evaluation metric
 * @param {object} scope - Configurable constraint configuration block
 * @returns {string} Fixed-point string clamped safely within limits
 */
export function clampDecimalString(
  value,
  { min = 0, max = Number.POSITIVE_INFINITY } = {},
) {
  const parsed = decimalToNumber(value);
  const safeValue = Math.min(Math.max(parsed, min), max);
  return safeValue.toFixed(2);
}

/**
 * Sanitizes input strings on the fly, preventing invalid characters in decimal fields.
 * Strips out everything except numbers and a single decimal point.
 * @param {string} value - Raw string capture text node from DOM input event listeners
 * @returns {string} Clean string that safe arithmetic parsing pipes can consume
 */
export function sanitizeDecimalInput(value) {
  if (typeof value !== "string") {
    if (value === null || value === undefined) return "";
    value = String(value);
  }

  if (value === "") return "";

  // Strip away characters that are not digits or decimal points
  let sanitized = value.replace(/[^\d.]/g, "");

  // Prevent multiple floating decimal points by keeping only the first instance
  const pointIndex = sanitized.indexOf(".");
  if (pointIndex !== -1) {
    sanitized =
      sanitized.substring(0, pointIndex + 1) +
      sanitized.substring(pointIndex + 1).replace(/\./g, "");
  }

  return sanitized;
}

/**
 * Evaluates standard HTML form inputs to determine step increments based on stock unit types.
 * @param {string} unit - The registered unit identifier (e.g., "pcs", "kg", "box")
 * @returns {string} Step boundary increment scale attribute string ("1" or "0.01")
 */
export function getStepByUnit(unit) {
  const normalizedUnit = String(unit || "")
    .toLowerCase()
    .trim();
  return normalizedUnit === "pcs" || normalizedUnit === "box" ? "1" : "0.01";
}

/**
 * Formats weights and volumes into strings appended with their standard unit types.
 * Automatically strips fractions from unit types that do not support split balances.
 * @param {any} value - The tracking magnitude balance metric
 * @param {string} unit - The registered unit identifier (e.g., "pcs", "kg", "box")
 * @returns {string} Standardized display string (e.g., "150.25 kg", "12 pcs")
 */
export function formatWeight(value, unit = "kg") {
  const amount = decimalToNumber(value);
  const normalizedUnit = String(unit || "")
    .toLowerCase()
    .trim();
  const isWholeUnit = normalizedUnit === "pcs" || normalizedUnit === "box";

  return `${amount.toFixed(isWholeUnit ? 0 : 2)} ${unit}`;
}
