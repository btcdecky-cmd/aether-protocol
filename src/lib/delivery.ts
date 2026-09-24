/**
 * Delivery engine — Revive Adserver selection model, adapted for Aether.
 * Revive is NOT installed. Clean-room TypeScript.
 *
 * Flow: zone request → eligible campaigns → caps/rules →
 * priority tier (override → contract → remnant) → weight lottery → event.
 */

import {
  type Campaign,
  type CampaignPriority,
  type CampaignZone,
  PRIORITY_RANK,
} from "../db/schema/campaigns";
import type {
  DeliveryContext,
  DeliveryEvent,
  DeliveryRule,
  ZoneStats,
  CampaignStats,
} from "../db/schema/inventory";
import { withDefaultInventory } from "../db/schema/inventory";

export interface DeliveryResult {
  campaign: Campaign | null;
  blank: boolean;
  reason?: string;
  tier?: CampaignPriority;
  event: DeliveryEvent;
}

function rulesPass(
  rules: DeliveryRule[] | undefined,
  ctx: DeliveryContext,
): boolean {
  if (!rules?.length) return true;
  for (const r of rules) {
    const raw =
      r.field === "journey_step"
        ? ctx.journeyStep
        : r.field === "wallet_connected"
          ? ctx.walletConnected
          : ctx.attributes?.[r.field];
    switch (r.op) {
      case "eq":
        if (raw !== r.value) return false;
        break;
      case "neq":
        if (raw === r.value) return false;
        break;
      case "gte":
        if (typeof raw !== "number" || raw < Number(r.value)) return false;
        break;
      case "lte":
        if (typeof raw !== "number" || raw > Number(r.value)) return false;
        break;
      case "contains":
        if (typeof raw !== "string" || !raw.includes(String(r.value)))
          return false;
        break;
      case "in":
        if (!Array.isArray(r.value) || !r.value.includes(raw as never))
          return false;
        break;
      default:
        return false;
    }
  }
  return true;
}

function isDeliverable(c: Campaign, ctx: DeliveryContext): boolean {
  if (c.status !== "active") return false;
  if (!c.zones.includes(ctx.zoneKey as CampaignZone)) return false;
  if (c.spentLamports >= c.budgetLamports) return false;
  if (c.completionCount >= c.maxCompletions) return false;
  if (c.endsAt && new Date(c.endsAt).getTime() < Date.now()) return false;
  if (c.startsAt && new Date(c.startsAt).getTime() > Date.now()) return false;
  const rules = (c as Campaign & { deliveryRules?: DeliveryRule[] }).deliveryRules;
  if (!rulesPass(rules, ctx)) return false;
  return true;
}

export function pickByWeight<T extends { weight: number }>(
  items: T[],
  random: () => number = Math.random,
): T | null {
  if (!items.length) return null;
  const total = items.reduce((s, i) => s + Math.max(1, i.weight), 0);
  let r = random() * total;
  for (const item of items) {
    r -= Math.max(1, item.weight);
    if (r <= 0) return item;
  }
  return items[items.length - 1] ?? null;
}

const TIER_ORDER: CampaignPriority[] = ["override", "contract", "remnant"];

export function selectForZone(
  campaigns: Campaign[],
  ctx: DeliveryContext,
  random: () => number = Math.random,
): DeliveryResult {
  const at = new Date().toISOString();
  const baseEvent = (partial: Partial<DeliveryEvent>): DeliveryEvent => ({
    id: `evt_${Date.now()}_${Math.floor(random() * 1e6)}`,
    type: "request",
    zoneKey: ctx.zoneKey,
    at,
    ...partial,
  });

  const eligible = campaigns
    .filter((c) => isDeliverable(c, ctx))
    .map(withDefaultInventory);

  if (!eligible.length) {
    return {
      campaign: null,
      blank: true,
      reason: "no_eligible_campaign",
      event: baseEvent({ type: "blank" }),
    };
  }

  for (const tier of TIER_ORDER) {
    const pool = eligible.filter((c) => c.priority === tier);
    if (!pool.length) continue;
    const chosen = pickByWeight(pool, random);
    if (!chosen) continue;
    return {
      campaign: chosen,
      blank: false,
      tier,
      event: baseEvent({
        type: "impression",
        campaignId: chosen.id,
      }),
    };
  }

  return {
    campaign: null,
    blank: true,
    reason: "empty_tiers",
    event: baseEvent({ type: "blank" }),
  };
}

export function rankForZone(
  campaigns: Campaign[],
  zoneKey: CampaignZone,
): Campaign[] {
  return campaigns
    .filter(
      (c) =>
        c.status === "active" &&
        c.zones.includes(zoneKey) &&
        c.spentLamports < c.budgetLamports &&
        c.completionCount < c.maxCompletions,
    )
    .map(withDefaultInventory)
    .sort((a, b) => {
      const pr = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      if (pr !== 0) return pr;
      if (b.weight !== a.weight) return b.weight - a.weight;
      return b.rewardPerCompletionLamports - a.rewardPerCompletionLamports;
    });
}

export function aggregateZoneStats(events: DeliveryEvent[]): ZoneStats[] {
  const map = new Map<string, ZoneStats>();
  for (const e of events) {
    const s = map.get(e.zoneKey) ?? {
      zoneKey: e.zoneKey,
      requests: 0,
      blanks: 0,
      impressions: 0,
      completions: 0,
    };
    if (e.type === "request" || e.type === "blank" || e.type === "impression") {
      s.requests += 1;
    }
    if (e.type === "blank") s.blanks += 1;
    if (e.type === "impression") s.impressions += 1;
    if (e.type === "completion") s.completions += 1;
    map.set(e.zoneKey, s);
  }
  return [...map.values()];
}

export function aggregateCampaignStats(
  events: DeliveryEvent[],
): CampaignStats[] {
  const map = new Map<string, CampaignStats>();
  for (const e of events) {
    if (!e.campaignId) continue;
    const s = map.get(e.campaignId) ?? {
      campaignId: e.campaignId,
      impressions: 0,
      completions: 0,
      spentLamports: 0,
    };
    if (e.type === "impression") s.impressions += 1;
    if (e.type === "completion") s.completions += 1;
    map.set(e.campaignId, s);
  }
  return [...map.values()];
}
