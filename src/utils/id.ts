export function generateId(suffix?: string): string {
  // crypto.randomUUID is not reliably available in React Native.
  // This generates a reasonably-unique, time-sortable ID for local SQLite rows.
  const ts = Date.now().toString(36);
  console.log("generateId", ts);
  const base = ts;
  return suffix ? `${base}-${suffix}` : base;
}
