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

/**
 * Fetch paginated forecasts from the server.
 * Throws an Error on non-OK responses.
 */
export async function getForecasts(page: number, pageSize: number, q?: string): Promise<PaginatedForecasts> {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));
  if (q && q.trim() !== '') params.set('q', q);

  const res = await fetch(`/weatherforecast?${params.toString()}`);
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Failed to fetch forecasts: ${res.status} ${text}`);
  }
  return res.json();
}