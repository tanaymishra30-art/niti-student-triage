/**
 * Formats minutes into initials-based string using 'h' for hours and 'm' for minutes.
 * e.g., 200 -> "3h 20m"
 * 60 -> "1h"
 * 45 -> "45m"
 * 0 -> "0m"
 */
export function formatMinutes(totalMinutes: number): string {
  const rounded = Math.round(totalMinutes);
  if (rounded <= 0) return '0m';

  const hours = Math.floor(rounded / 60);
  const mins = rounded % 60;

  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${mins}m`;
  }
}

/**
 * Formats decimal hours into initials-based string using 'h' for hours and 'm' for minutes.
 * e.g., 3.33 -> "3h 20m"
 * 0.75 -> "45m"
 */
export function formatHours(hoursDecimal: number): string {
  const totalMinutes = Math.round(hoursDecimal * 60);
  return formatMinutes(totalMinutes);
}
