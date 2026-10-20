/**
 * Rainfall from Open-Meteo (free, no key): ten years of past daily rain for the simulation, and the
 * last weeks plus a short forecast for the My tank screen.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { RainDay } from '@/data/calculations/simulation';
import type { Coordinates } from '@/shared/geo';

const ARCHIVE_URL = 'https://archive-api.open-meteo.com/v1/archive';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const HISTORY_START = '2015-01-01';
const HISTORY_END = '2024-12-31';
// The ten-year history is stored on the phone so it is downloaded only once per area.
const CACHE_PREFIX = 'rain-history:';
// Homes within about 5 km share the same cached history (the rain data is coarser than that anyway).
const CACHE_GRID_DEG = 0.05;

export type ForecastDay = RainDay & {
  weatherCode: number;
};

export type RecentWeather = {
  past: RainDay[];
  forecast: ForecastDay[];
};

type DailyResponse = {
  daily: {
    time: string[];
    precipitation_sum: (number | null)[];
    weather_code?: (number | null)[];
  };
};

/** Cache key = position rounded to the 0.05° grid. */
const cacheKey = ({ latitude, longitude }: Coordinates) =>
  `${CACHE_PREFIX}${Math.round(latitude / CACHE_GRID_DEG)}:${Math.round(longitude / CACHE_GRID_DEG)}`;

/** Open-Meteo returns parallel lists of dates and values; this pairs them up (missing values = 0 mm). */
const toRainDays = ({ daily }: DailyResponse): RainDay[] =>
  daily.time.map((date, index) => ({ date, mm: daily.precipitation_sum[index] ?? 0 }));

async function fetchDaily(url: string): Promise<DailyResponse> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Open-Meteo request failed with status ${response.status}`);
  }
  return response.json() as Promise<DailyResponse>;
}

/** Daily rain 2015 to 2024 for a point, from the phone's cache if available. */
export async function getRainHistory(point: Coordinates): Promise<RainDay[]> {
  const key = cacheKey(point);
  const cached = await AsyncStorage.getItem(key);
  if (cached) {
    return JSON.parse(cached) as RainDay[];
  }

  const url =
    `${ARCHIVE_URL}?latitude=${point.latitude}&longitude=${point.longitude}` +
    `&start_date=${HISTORY_START}&end_date=${HISTORY_END}&daily=precipitation_sum&timezone=Europe%2FParis`;
  const rain = toRainDays(await fetchDaily(url));
  await AsyncStorage.setItem(key, JSON.stringify(rain));
  return rain;
}

/** The last 60 days of rain (to estimate today's tank level) and the next 7 days of forecast. */
export async function getRecentWeather(point: Coordinates, pastDays = 60): Promise<RecentWeather> {
  const url =
    `${FORECAST_URL}?latitude=${point.latitude}&longitude=${point.longitude}` +
    `&daily=precipitation_sum,weather_code&past_days=${pastDays}&forecast_days=7&timezone=Europe%2FParis`;
  const data = await fetchDaily(url);
  const today = new Date().toISOString().slice(0, 10);
  const days: ForecastDay[] = data.daily.time.map((date, index) => ({
    date,
    mm: data.daily.precipitation_sum[index] ?? 0,
    weatherCode: data.daily.weather_code?.[index] ?? 0,
  }));

  return {
    past: days.filter(({ date }) => date < today),
    forecast: days.filter(({ date }) => date >= today),
  };
}

/** First and last year of the history, shown in the sources. */
export const HISTORY_PERIOD = { start: HISTORY_START.slice(0, 4), end: HISTORY_END.slice(0, 4) };
