/**
 * Inventory extensions inspired by Revive Adserver entity model.
 * Revive is NOT installed — concepts only for on-chain adoption ads.
 *
 * Classic Revive: Advertiser → Campaign → Banner → Zone link
 * Aether:        Advertiser → Campaign → Task   → Zone link
 */

import type { Campaign, CampaignTask } from "./campaigns";

export type DeliveryRuleOp = "eq" | "neq" | "in" | "contains" | "gte" | "lte";

export interface DeliveryRule {
  id: string;
  field: string;
  op: DeliveryRuleOp;
  value: string | number | boolean | string[];
}

export interface FrequencyCap {
  maxPerWallet: number;
  windowHours: number;
}

export interface WeightedTask extends CampaignTask {
  weight: number;
  deliveryRules?: DeliveryRule[];
}

export interface CampaignInventoryMeta {
  weight: number;
  frequencyCap?: FrequencyCap;
  deliveryRules?: DeliveryRule[];
  targetCompletions?: number;
}

export type DeliveryEventType =
  | "request"
  | "blank"
  | "impression"
  | "completion";

export interface DeliveryEvent {
  id: string;
  type: DeliveryEventType;
  zoneKey: string;
  campaignId?: string;
  taskId?: string;
  wallet?: string;
  at: string;
}

export interface ZoneStats {
  zoneKey: string;
  requests: number;
  blanks: number;
  impressions: number;
  completions: number;
}

export interface CampaignStats {
  campaignId: string;
  impressions: number;
  completions: number;
  spentLamports: number;
}

export interface DeliveryContext {
  zoneKey: string;
  wallet?: string;
  journeyStep?: number;
  walletConnected?: boolean;
  attributes?: Record<string, string | number | boolean>;
}

export function withDefaultInventory(c: Campaign): Campaign & {
  weight: number;
  frequencyCap?: FrequencyCap;
} {
  const any = c as Campaign & { weight?: number; frequencyCap?: FrequencyCap };
  return {
    ...c,
    weight: any.weight && any.weight > 0 ? any.weight : 1,
    frequencyCap: any.frequencyCap,
  };
}
