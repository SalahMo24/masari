let lastTimestamp = 0;
let sequence = 0;

export function generateId(suffix?: string): string {
  // crypto.randomUUID is not reliably available in React Native.
  // Use a per-millisecond sequence to guarantee uniqueness in-process.
  const now = Date.now();
  if (now === lastTimestamp) {
    sequence += 1;
  } else {
    lastTimestamp = now;
    sequence = 0;
  }
  const base = `${now.toString(36)}-${sequence.toString(36)}`;
  return suffix ? `${base}-${suffix}` : base;
}
