/**
 * Localized IST (Asia/Kolkata) DateTime Formatting Core Utilities
 * Ensures uniform synchronization of timestamps across backend logs and frontend UI screens.
 */

const IST_TIME_ZONE = "Asia/Kolkata";

/**
 * Transforms an Intl tokenized component array into an indexed structural map.
 * Filters structural separation symbols out of the returned hash dataset.
 * @param {Intl.DateTimeFormatPart[]} parts - Token collection from Intl array emitter
 * @returns {Record<string, string>} Flattened string tracking object
 */
function partsToObject(parts) {
  if (!Array.isArray(parts)) return {};
  return Object.fromEntries(
    parts
      .filter((part) => part && part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
}

/**
 * Validates external variable bindings before parsing operations.
 * Protects layout engines from throwing unhandled exceptions on invalid records.
 * @param {any} value - Incoming payload string, integer timestamp, or instance object
 * @returns {Date | null} Confirmed true Date entity or null reference
 */
const safeInstantiateDate = (value) => {
  if (!value) return null;
  const instance = new Date(value);
  return Number.isFinite(instance.getTime()) ? instance : null;
};

/**
 * Outputs a database-safe, standard calendar day stamp string
 * @returns {string} Compiled structural string formatted as "YYYY-MM-DD"
 */
export function todayIST() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: IST_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const { year, month, day } = partsToObject(parts);
  return `${year}-${month}-${day}`;
}

/**
 * Outputs a filesystem-safe, file-naming timestamp string
 * @returns {string} Compiled structural sequence formatted as "YYYYMMDD_HHMMSS"
 */
export function timestampIST() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: IST_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const { year, month, day, hour, minute, second } = partsToObject(parts);
  return `${year}${month}${day}_${hour}${minute}${second}`;
}

/**
 * Formats data strings into the Indian national presentation standard layout
 * @returns {string} Clean string (e.g., "16 Jun 2026") or standard fallback character "—"
 */
export function formatDateIST(value, options = {}) {
  const dateObj = safeInstantiateDate(value);
  if (!dateObj) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TIME_ZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...options,
  }).format(dateObj);
}

/**
 * Formats records into a unified high-resolution date and time tracking pattern
 * @returns {string} Structural layout sequence string (e.g., "16 Jun 2026, 07:18 am")
 */
export function formatDateTimeIST(value) {
  const dateObj = safeInstantiateDate(value);
  if (!dateObj) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TIME_ZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(dateObj);
}

/**
 * Compiles target dates into a readable conversational banner component format
 * @returns {string} Extended verbose string (e.g., "Tuesday, 16 June")
 */
export function formatWeekdayDateIST(value = new Date()) {
  const dateObj = safeInstantiateDate(value);
  if (!dateObj) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TIME_ZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(dateObj);
}
