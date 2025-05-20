export function toUTCISOString(localDateString) {
  if (!localDateString) return undefined;
  const date = new Date(localDateString);
  if (isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

// Converts a UTC ISO string to a local datetime-local string (YYYY-MM-DDTHH:MM)
export function utcToLocalDatetimeLocal(utcISOString) {
  if (!utcISOString) return "";
  const utcDate = new Date(utcISOString);
  if (isNaN(utcDate.getTime())) return "";
  // Get the user's timezone offset in minutes
  const tzOffset = utcDate.getTimezoneOffset();
  // Convert UTC date to local date by subtracting the offset
  const localDate = new Date(utcDate.getTime() - tzOffset * 60000);
  const pad = n => String(n).padStart(2, '0');
  return (
    localDate.getFullYear() +
    '-' + pad(localDate.getMonth() + 1) +
    '-' + pad(localDate.getDate()) +
    'T' + pad(localDate.getHours()) +
    ':' + pad(localDate.getMinutes())
  );
}

// Converts a local datetime-local string to a UTC ISO string (YYYY-MM-DDTHH:MM -> UTC ISO)
export function localDatetimeLocalToUTC(localDateString) {
  if (!localDateString) return undefined;
  const date = new Date(localDateString);
  if (isNaN(date.getTime())) return undefined;
  return date.toISOString();
} 