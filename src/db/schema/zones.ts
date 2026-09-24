/**
 * First-class inventory zones — Revive Adserver pattern (concepts only; Revive is not installed).
 *
 * In classic ad servers: Site → Zone → linked Campaigns/Banners.
 * In Aether: App surface → Zone → linked Campaigns/Tasks (actions, not pixel creatives).
 *
 * Delivery request hits a zone id; the delivery engine selects one eligible campaign.
 */

import type { CampaignZone } from "./campaigns";

export type ZoneKind =
  | "feed"
  | "journey"
  | "project"
  | "teaser"
  | "custom";

export interface Zone {
  id: string;
  key: CampaignZone;
  name: string;
  description: string;
  kind: ZoneKind;
  linkedCampaignIds: string[];
  dailyRequestForecast?: number;
  active: boolean;
  createdAt: string;
}

export const DEFAULT_ZONES: Zone[] = [
  {
    id: "zone-discover",
    key: "discover",
    name: "Discover feed",
    description: "Primary campaign marketplace. Highest request volume.",
    kind: "feed",
    linkedCampaignIds: [],
    dailyRequestForecast: 50_000,
    active: true,
    createdAt: new Date(0).toISOString(),
  },
  {
    id: "zone-journey",
    key: "journey",
    name: "Adoption journey",
    description: "Step-gated surfaces during Solana onboarding.",
    kind: "journey",
    linkedCampaignIds: [],
    dailyRequestForecast: 12_000,
    active: true,
    createdAt: new Date(0).toISOString(),
  },
  {
    id: "zone-project",
    key: "project",
    name: "Project detail",
    description: "Campaigns attached to a specific protocol page.",
    kind: "project",
    linkedCampaignIds: [],
    dailyRequestForecast: 8_000,
    active: true,
    createdAt: new Date(0).toISOString(),
  },
  {
    id: "zone-lend",
    key: "lend_teaser",
    name: "Lending teaser",
    description: "Shown while lending markets are locked; remnant + education.",
    kind: "teaser",
    linkedCampaignIds: [],
    dailyRequestForecast: 3_000,
    active: true,
    createdAt: new Date(0).toISOString(),
  },
];
