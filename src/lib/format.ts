/** "June 30, 2026" from a YYYY-MM-DD date string. */
export function formatLongDate(date: string): string {
  return new Date(date + "T00:00:00").toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
