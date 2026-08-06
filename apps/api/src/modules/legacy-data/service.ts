import { env } from "../../config/env.js";
import type { LegacyDataQuery } from "@dedsis/contracts";

const cache = new Map<string, { expiresAt: number; value: unknown }>();
const TTL = 10 * 60 * 1000;

async function requestDay(startDate: string, endDate: string, userId?: string) {
  const response = await fetch(env.LEGACY_API_URL, {
    method: "POST",
    headers: { authorization: `Bearer ${env.LEGACY_API_TOKEN}`, "content-type": "application/json" },
    body: JSON.stringify({ startDate, endDate, userId }),
    signal: AbortSignal.timeout(120_000),
  });
  if (!response.ok) throw new Error(`Harici servis hatası: ${response.status}`);
  const json = await response.json() as any;
  return Array.isArray(json) ? json : json.data ?? json.Data ?? json.result ?? json.items ?? [];
}

export async function getLegacyData(query: LegacyDataQuery) {
  const key = JSON.stringify(query);
  const found = cache.get(key);
  if (found && found.expiresAt > Date.now()) return found.value;

  const start = new Date(query.startDate);
  const end = new Date(query.endDate);
  const all: unknown[] = [];
  for (let cursor = new Date(start); cursor <= end; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
    const dayStart = new Date(cursor); dayStart.setUTCHours(0, 0, 0, 0);
    const dayEnd = new Date(cursor); dayEnd.setUTCHours(23, 59, 59, 999);
    all.push(...await requestDay(dayStart.toISOString(), dayEnd.toISOString(), query.userId));
  }
  const from = (query.page - 1) * query.pageSize;
  const value = { items: all.slice(from, from + query.pageSize), totalCount: all.length, page: query.page, pageSize: query.pageSize };
  cache.set(key, { expiresAt: Date.now() + TTL, value });
  return value;
}
