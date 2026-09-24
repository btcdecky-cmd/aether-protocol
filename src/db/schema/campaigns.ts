/**
 * Aether campaign model
 *
 * Status: draft → pending_review → active → paused → ended
 * Zones: discover | journey | project | lend_teaser
 * Priority (Revive types): override > contract > remnant
 * Weight: relative selection within a priority tier
 */

export const CAMPAIGN_STATUSES = [
  "draft",
  "pending_review",
  "active",
  "paused",
  "ended",
] as const;

export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];

export const CAMPAIGN_ZONES = [
  "discover",
  "journey",
  "project",
  "lend_teaser",
] as const;

export type CampaignZone = (typeof CAMPAIGN_ZONES)[number];

export const CAMPAIGN_PRIORITIES = [
  "override",
  "contract",
  "remnant",
] as const;

export type CampaignPriority = (typeof CAMPAIGN_PRIORITIES)[number];

export const CAMPAIGN_OBJECTIVES = [
  "discovery",
  "education",
  "activation",
  "retention",
  "liquidity",
] as const;

export type CampaignObjective = (typeof CAMPAIGN_OBJECTIVES)[number];

export type CampaignTaskType =
  | "visit"
  | "quiz"
  | "onchain"
  | "social"
  | "stake"
  | "swap";

export interface CampaignTask {
  id: string;
  type: CampaignTaskType;
  title: string;
  description: string;
  proofTarget?: string;
  rewardLamports: number;
  /** Revive banner weight analogue (1–127); default 1 */
  weight?: number;
}

export interface Campaign {
  id: string;
  projectId: string;
  slug: string;
  title: string;
  hook: string;
  description: string;
  objective: CampaignObjective;
  status: CampaignStatus;
  /** Revive: override / contract / remnant fill order */
  priority: CampaignPriority;
  zones: CampaignZone[];
  category: string;
  budgetLamports: number;
  spentLamports: number;
  rewardPerCompletionLamports: number;
  maxCompletions: number;
  completionCount: number;
  tasks: CampaignTask[];
  advertiserWallet?: string;
  escrowPda?: string;
  /** Relative weight among same-priority campaigns in a zone */
  weight?: number;
  targetCompletions?: number;
  startsAt?: string;
  endsAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const PRIORITY_RANK: Record<CampaignPriority, number> = {
  override: 0,
  contract: 1,
  remnant: 2,
};

export function sortCampaignsByPriority(a: Campaign, b: Campaign): number {
  const pr = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
  if (pr !== 0) return pr;
  const wa = a.weight ?? 1;
  const wb = b.weight ?? 1;
  if (wb !== wa) return wb - wa;
  return b.rewardPerCompletionLamports - a.rewardPerCompletionLamports;
}

export function canTransition(
  from: CampaignStatus,
  to: CampaignStatus,
): boolean {
  const allowed: Record<CampaignStatus, CampaignStatus[]> = {
    draft: ["pending_review", "ended"],
    pending_review: ["active", "draft", "ended"],
    active: ["paused", "ended"],
    paused: ["active", "ended"],
    ended: [],
  };
  return allowed[from].includes(to);
}
