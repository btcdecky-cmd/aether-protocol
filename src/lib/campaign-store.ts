/**
 * In-memory campaign store backed by seed data.
 * Swap for Supabase/Postgres queries when DATABASE_URL is live.
 */

import type { Campaign, CampaignZone } from "../db/schema/campaigns";
import { SEED_CAMPAIGNS } from "./seed-data";
import { campaignsForZone } from "./campaign-flow";

let campaigns: Campaign[] = structuredClone(SEED_CAMPAIGNS);

export function listCampaigns(): Campaign[] {
  return campaigns;
}

export function getCampaign(id: string): Campaign | undefined {
  return campaigns.find((c) => c.id === id || c.slug === id);
}

export function listForZone(zone: CampaignZone): Campaign[] {
  return campaignsForZone(campaigns, zone);
}

export function upsertCampaign(c: Campaign): void {
  const i = campaigns.findIndex((x) => x.id === c.id);
  if (i >= 0) campaigns[i] = c;
  else campaigns = [c, ...campaigns];
}

export function resetCampaigns(): void {
  campaigns = structuredClone(SEED_CAMPAIGNS);
}
