/**
 * Formats minutes into human-readable string.
 * e.g., 200 -> "3hrs and 20 minutes"
 * 60 -> "1hrs"
 * 45 -> "45 minutes"
 */
export function formatMinutes(totalMinutes: number): string {
  const rounded = Math.round(totalMinutes);
  if (rounded <= 0) return '0 minutes';

  const hours = Math.floor(rounded / 60);
  const mins = rounded % 60;

  if (hours > 0 && mins > 0) {
    return `${hours}hrs and ${mins} minutes`;
  } else if (hours > 0) {
    return `${hours}hrs`;
  } else {
    return `${mins} minutes`;
  }
}

/**
 * Formats decimal hours into human-readable string.
 * e.g., 3.33 -> "3hrs and 20 minutes"
 * 0.75 -> "45 minutes"
 */
export function formatHours(hoursDecimal: number): string {
  const totalMinutes = Math.round(hoursDecimal * 60);
  return formatMinutes(totalMinutes);
}
