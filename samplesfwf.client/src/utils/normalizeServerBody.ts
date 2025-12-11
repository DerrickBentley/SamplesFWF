/**
 * Normalize server response bodies that may be JSON strings or already-parsed objects.
 * Returns the parsed object when possible; otherwise returns the original value.
 */
export function normalizeServerBody(raw: unknown): unknown {
  let body: unknown = raw;
  if (typeof raw === 'string') {
    try {
      body = JSON.parse(raw);
    } catch {
      // leave as string if it isn't valid JSON
    }
  }
  return body;
}