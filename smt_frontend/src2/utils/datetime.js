const IST_TIME_ZONE = "Asia/Kolkata";

function partsToObject(parts) {
  return Object.fromEntries(
    parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]),
  );
}

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

export function formatDateIST(value, options = {}) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TIME_ZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...options,
  }).format(new Date(value));
}

export function formatDateTimeIST(value) {
  return formatDateIST(value, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatWeekdayDateIST(value = new Date()) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TIME_ZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(value));
}
