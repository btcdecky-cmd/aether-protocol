/**
 * Aether campaign model
 *
 * Status lifecycle (Soku-style review gate + Revive-inspired priority):
 *   draft → pending_review → active → paused → ended
 *
 * Zones (Revive-inspired inventory surfaces — eligibility, not pixel banners):
 *   discover | journey | project | lend_teaser
 *
 * Priority (Revive campaign types):
 *   override (onboarding) > contract (paid escrow) > remnant (organic)
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
  /** Optional proof target (URL, program id, quiz answer key hash) */
  proofTarget?: string;
  rewardLamports: number;
}

export interface Campaign {
  id: string;
  projectId: string;
  slug: string;
  title: string;
  /** Hook-style summary (PAS / number-led from marketing-skills) */
  hook: string;
  description: string;
  objective: CampaignObjective;
  status: CampaignStatus;
  /** Revive-style priority for ranking / fill */
  priority: CampaignPriority;
  /** Surfaces where this campaign is eligible */
  zones: CampaignZone[];
  category: string;
  /** Total escrow budget in lamports */
  budgetLamports: number;
  /** Amount already paid out */
  spentLamports: number;
  rewardPerCompletionLamports: number;
  maxCompletions: number;
  completionCount: number;
  tasks: CampaignTask[];
  /** Advertiser wallet (base58) */
  advertiserWallet?: string;
  /** Escrow PDA when funded */
  escrowPda?: string;
  startsAt?: string;
  endsAt?: string;
  createdAt: string;
  updatedAt: string;
}

/** Rank order for priority field (lower = higher rank) */
export const PRIORITY_RANK: Record<CampaignPriority, number> = {
  override: 0,
  contract: 1,
  remnant: 2,
};

export function sortCampaignsByPriority(a: Campaign, b: Campaign): number {
  const pr = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
  if (pr !== 0) return pr;
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
