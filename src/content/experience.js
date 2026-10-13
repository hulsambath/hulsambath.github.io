// Experience is derived from a start month instead of being hardcoded, so the
// figure can never go stale or get rounded up. Partial months are dropped.

/**
 * @param {string} start "YYYY-MM" of the first professional role
 * @param {Date} now
 * @returns {{ years: number, months: number }}
 */
export function experienceDuration(start, now) {
  const [year, month] = start.split("-").map(Number);
  const total =
    (now.getUTCFullYear() - year) * 12 + (now.getUTCMonth() + 1 - month);
  return { years: Math.floor(total / 12), months: total % 12 };
}

/**
 * @param {{ years: number, months: number }} duration
 * @param {"short" | "long"} [style]
 * @returns {string} e.g. "2 yrs 9 mo" or "2 years 9 months"
 */
export function formatDuration({ years, months }, style = "short") {
  const long = style === "long";
  const parts = [];
  if (years) {
    parts.push(`${years} ${long ? (years === 1 ? "year" : "years") : years === 1 ? "yr" : "yrs"}`);
  }
  if (months) {
    parts.push(`${months} ${long ? (months === 1 ? "month" : "months") : "mo"}`);
  }
  return parts.join(" ");
}
