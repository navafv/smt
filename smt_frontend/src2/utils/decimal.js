export function decimalToNumber(value) {
  const parsed = Number.parseFloat(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function decimalToString(value, fractionDigits = 2) {
  return decimalToNumber(value).toFixed(fractionDigits);
}

export function sumDecimalValues(values) {
  return values.reduce((sum, value) => sum + decimalToNumber(value), 0);
}

export function clampDecimalString(value, { min = 0, max = Number.POSITIVE_INFINITY } = {}) {
  const parsed = decimalToNumber(value);
  const safeValue = Math.min(Math.max(parsed, min), max);
  return safeValue.toFixed(2);
}

export function sanitizeDecimalInput(value) {
  if (value === "") {
    return "";
  }

  return value.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1");
}

export function getStepByUnit(unit) {
  return unit === "pcs" || unit === "box" ? "1" : "0.01";
}

export function formatWeight(value, unit = "kg") {
  const amount = decimalToNumber(value);
  return `${amount.toFixed(unit === "pcs" || unit === "box" ? 0 : 2)} ${unit}`;
}
