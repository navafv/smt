const INR_LOCALE = "en-IN";
const INR_CURRENCY = "INR";

export function formatCurrencyINR(value, options = {}) {
  const amount = Number(value || 0);

  return new Intl.NumberFormat(INR_LOCALE, {
    style: "currency",
    currency: INR_CURRENCY,
    maximumFractionDigits: 2,
    ...options,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function formatCurrencyCompact(value) {
  const amount = Number(value || 0);

  return new Intl.NumberFormat(INR_LOCALE, {
    style: "currency",
    currency: INR_CURRENCY,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function formatNumberIN(value, options = {}) {
  const amount = Number(value || 0);

  return new Intl.NumberFormat(INR_LOCALE, {
    maximumFractionDigits: 2,
    ...options,
  }).format(Number.isFinite(amount) ? amount : 0);
}
