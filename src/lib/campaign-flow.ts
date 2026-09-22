/**
 * Advertise flow — Soku-style review gate
 *
 * 1. Draft campaign (no funds moved)
 * 2. Submit → pending_review (summary card)
 * 3. Explicit Fund & Activate → escrow + active
 * 4. Pause / end as needed
 */

import {
  type Campaign,
  type CampaignPriority,
  type CampaignStatus,
  type CampaignZone,
  canTransition,
} from "../db/schema/campaigns";

export interface CampaignDraftInput {
  projectId: string;
  slug: string;
  title: string;
  hook: string;
  description: string;
  objective: Campaign["objective"];
  priority?: CampaignPriority;
  zones?: CampaignZone[];
  category: string;
  budgetLamports: number;
  rewardPerCompletionLamports: number;
  maxCompletions: number;
  tasks: Campaign["tasks"];
  advertiserWallet?: string;
  endsAt?: string;
}

export function createDraft(input: CampaignDraftInput): Campaign {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    projectId: input.projectId,
    slug: input.slug,
    title: input.title,
    hook: input.hook,
    description: input.description,
    objective: input.objective,
    status: "draft",
    priority: input.priority ?? "contract",
    zones: input.zones ?? ["discover", "project"],
    category: input.category,
    budgetLamports: input.budgetLamports,
    spentLamports: 0,
    rewardPerCompletionLamports: input.rewardPerCompletionLamports,
    maxCompletions: input.maxCompletions,
    completionCount: 0,
    tasks: input.tasks,
    advertiserWallet: input.advertiserWallet,
    endsAt: input.endsAt,
    createdAt: now,
    updatedAt: now,
  };
}

export function submitForReview(campaign: Campaign): Campaign {
  if (!canTransition(campaign.status, "pending_review")) {
    throw new Error(
      `Cannot submit campaign in status ${campaign.status} for review`,
    );
  }
  return {
    ...campaign,
    status: "pending_review",
    updatedAt: new Date().toISOString(),
  };
}

export interface ActivateResult {
  campaign: Campaign;
  summary: string;
}

export function buildActivationSummary(c: Campaign): string {
  const budgetSol = (c.budgetLamports / 1e9).toFixed(4);
  const rewardSol = (c.rewardPerCompletionLamports / 1e9).toFixed(4);
  const zones = c.zones.join(", ");
  return [
    `Campaign: ${c.title}`,
    `Priority: ${c.priority} · Objective: ${c.objective}`,
    `Zones: ${zones}`,
    `Budget: ${budgetSol} SOL · Reward/completion: ${rewardSol} SOL`,
    `Max completions: ${c.maxCompletions}`,
    `Tasks: ${c.tasks.map((t) => t.type).join(" → ")}`,
    `Status will become: active (escrow funded)`,
  ].join("\n");
}

export function activateCampaign(
  campaign: Campaign,
  escrowPda: string,
): ActivateResult {
  if (!canTransition(campaign.status, "active")) {
    throw new Error(
      `Cannot activate campaign in status ${campaign.status}. Submit for review first.`,
    );
  }
  const next: Campaign = {
    ...campaign,
    status: "active",
    escrowPda,
    startsAt: campaign.startsAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return {
    campaign: next,
    summary: buildActivationSummary(next),
  };
}

export function pauseCampaign(campaign: Campaign): Campaign {
  if (!canTransition(campaign.status, "paused")) {
    throw new Error(`Cannot pause campaign in status ${campaign.status}`);
  }
  return {
    ...campaign,
    status: "paused",
    updatedAt: new Date().toISOString(),
  };
}

export function endCampaign(campaign: Campaign): Campaign {
  if (!canTransition(campaign.status, "ended")) {
    throw new Error(`Cannot end campaign in status ${campaign.status}`);
  }
  return {
    ...campaign,
    status: "ended",
    updatedAt: new Date().toISOString(),
  };
}

export function campaignsForZone(
  campaigns: Campaign[],
  zone: CampaignZone,
): Campaign[] {
  return campaigns
    .filter(
      (c) =>
        c.status === "active" &&
        c.zones.includes(zone) &&
        c.spentLamports < c.budgetLamports &&
        c.completionCount < c.maxCompletions,
    )
    .sort((a, b) => {
      const rank = { override: 0, contract: 1, remnant: 2 } as const;
      return rank[a.priority] - rank[b.priority];
    });
}
