/**
 * In-memory inventory: zones, delivery events, stats.
 * Production: Postgres tables (Revive-style entities without installing Revive).
 */

import { DEFAULT_ZONES, type Zone } from "../db/schema/zones";
import type { DeliveryEvent, ZoneStats, CampaignStats } from "../db/schema/inventory";
import type { Campaign, CampaignZone } from "../db/schema/campaigns";
import {
  selectForZone,
  rankForZone,
  aggregateZoneStats,
  aggregateCampaignStats,
  type DeliveryResult,
} from "./delivery";
import type { DeliveryContext } from "../db/schema/inventory";
import { listCampaigns, upsertCampaign } from "./campaign-store";

let zones: Zone[] = structuredClone(DEFAULT_ZONES);
let events: DeliveryEvent[] = [];

export function listZones(): Zone[] {
  return zones.filter((z) => z.active);
}

export function getZone(keyOrId: string): Zone | undefined {
  return zones.find((z) => z.key === keyOrId || z.id === keyOrId);
}

export function listDeliveryEvents(limit = 100): DeliveryEvent[] {
  return events.slice(-limit).reverse();
}

export function recordEvent(e: DeliveryEvent): void {
  events = [...events, e].slice(-5_000);
}

export function invokeZone(
  ctx: DeliveryContext,
  campaigns?: Campaign[],
): DeliveryResult {
  const pool = campaigns ?? listCampaigns();
  const result = selectForZone(pool, ctx);
  if (result.event.type !== "request") {
    recordEvent({
      ...result.event,
      id: result.event.id + "_req",
      type: "request",
    });
  }
  recordEvent(result.event);
  return result;
}

export function recordCompletion(
  campaignId: string,
  zoneKey: string,
  taskId?: string,
  wallet?: string,
): void {
  recordEvent({
    id: `evt_c_${Date.now()}`,
    type: "completion",
    zoneKey,
    campaignId,
    taskId,
    wallet,
    at: new Date().toISOString(),
  });
}

export function getZoneStats(): ZoneStats[] {
  return aggregateZoneStats(events);
}

export function getCampaignStats(): CampaignStats[] {
  return aggregateCampaignStats(events);
}

export function listRankedForZone(zone: CampaignZone): Campaign[] {
  return rankForZone(listCampaigns(), zone);
}

export function applyCompletionToCampaign(
  campaignId: string,
  rewardLamports: number,
): Campaign | undefined {
  const c = listCampaigns().find((x) => x.id === campaignId);
  if (!c) return undefined;
  const next: Campaign = {
    ...c,
    completionCount: c.completionCount + 1,
    spentLamports: Math.min(
      c.budgetLamports,
      c.spentLamports + rewardLamports,
    ),
    updatedAt: new Date().toISOString(),
  };
  upsertCampaign(next);
  return next;
}

export function resetInventory(): void {
  zones = structuredClone(DEFAULT_ZONES);
  events = [];
}
