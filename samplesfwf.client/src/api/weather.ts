export interface Forecast {
  date: string;
  temperatureC: number;
  temperatureF: number;
  summary: string | null;
}

export interface PaginatedForecasts {
  items: Forecast[];
  totalCount: number;
}

async function parseJsonOrText(res: Response) {
  const ct = res.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) {
    return res.json();
  }
  return res.text();
}

/**
 * Fetch paginated forecasts from the server.
 * Throws an Error or throws parsed JSON for structured errors.
 */
export async function getForecasts(page: number, pageSize: number, q?: string): Promise<PaginatedForecasts> {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));
  if (q && q.trim() !== '') params.set('q', q);

  const res = await fetch(`/weatherforecast?${params.toString()}`);
  if (!res.ok) {
    const body = await parseJsonOrText(res).catch(() => res.statusText);
    throw { status: res.status, body };
  }
  return res.json();
}

async function handleJsonResponse(res: Response) {
  if (res.ok) return res.json();
  const body = await parseJsonOrText(res).catch(() => ({ message: res.statusText }));
  // Throw an object so callers can inspect structured validation errors (ValidationProblemDetails)
  throw { status: res.status, body };
}

/**
 * Create a new forecast.
 * Throws structured error { status, body } where body may be ValidationProblemDetails.
 */
export async function createForecast(forecast: Forecast): Promise<Forecast> {
  const res = await fetch('/weatherforecast', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(forecast)
  });
  return handleJsonResponse(res);
}

/**
 * Update an existing forecast.
 * Throws structured error { status, body } where body may be ValidationProblemDetails.
 */
export async function updateForecast(forecast: Forecast): Promise<Forecast> {
  const res = await fetch('/weatherforecast', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(forecast)
  });
  return handleJsonResponse(res);
}