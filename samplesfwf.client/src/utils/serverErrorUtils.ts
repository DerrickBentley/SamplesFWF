import { normalizeServerBody } from './normalizeServerBody';

export type FieldErrors = Partial<Record<'date' | 'temperatureC' | 'summary' | 'form', string[]>>;

/**
 * Map a server response (ValidationProblemDetails-like or plain error) into FieldErrors.
 */
export function mapServerErrors(rawBody: unknown): FieldErrors {
  const body = normalizeServerBody(rawBody);
  const result: FieldErrors = {};

  if (!body) return result;

  const errorsObj = (body as any).errors ?? (typeof body === 'object' ? body : undefined);
  if (errorsObj && typeof errorsObj === 'object') {
    for (const [key, messages] of Object.entries(errorsObj)) {
      const normalizedKey = key?.toString().toLowerCase();
      const msgs = Array.isArray(messages) ? messages.map(String) : [String(messages)];
      if (normalizedKey === 'date') result.date = msgs;
      else if (normalizedKey === 'temperaturec') result.temperatureC = msgs;
      else if (normalizedKey === 'summary') result.summary = msgs;
      else {
        result.form = (result.form ?? []).concat(msgs);
      }
    }
  }

  if (!result.date && !result.temperatureC && !result.summary) {
    const detail = (body as any)?.detail ?? (body as any)?.error ?? (body as any)?.message;
    const title = (body as any)?.title;
    if (detail) result.form = (result.form ?? []).concat(String(detail));
    else if (title) result.form = (result.form ?? []).concat(String(title));
    else if (typeof body === 'string') result.form = (result.form ?? []).concat(body);
  }

  return result;
}