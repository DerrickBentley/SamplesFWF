export interface Forecast {
  date: string;
  temperatureC: number;
  temperatureF: number;
  summary: string;
}

/**
 * Fetch forecasts from the server.
 * Throws an Error on non-OK responses.
 */
export async function getForecasts(): Promise<Forecast[]> {
  const res = await fetch('/weatherforecast');
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Failed to fetch forecasts: ${res.status} ${text}`);
  }
  return res.json();
}