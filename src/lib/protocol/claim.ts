import { getCampaign, upsertCampaign } from "../campaign-store";
import {
  applyCompletionToCampaign,
  recordCompletion,
} from "../inventory-store";
import {
  claimCompletion,
  fundCampaignSim,
  getEscrowState,
  type ClaimResult,
} from "./escrow-client";

export interface SubmitClaimArgs {
  campaignId: string;
  taskId: string;
  participant: string;
  proofSignature?: string;
}

export interface SubmitClaimResult extends ClaimResult {
  campaignTitle?: string;
  taskTitle?: string;
}

export function ensureSimEscrow(campaignId: string): void {
  const c = getCampaign(campaignId);
  if (!c || c.status !== "active") return;
  if (getEscrowState(campaignId)) return;
  fundCampaignSim({
    campaignId: c.id,
    advertiser: c.advertiserWallet ?? "Advertiser1111111111111111111111111111111",
    authority: "AetherOracle111111111111111111111111111111",
    budgetLamports: c.budgetLamports,
    rewardPerCompletionLamports: c.rewardPerCompletionLamports,
    maxCompletions: c.maxCompletions,
  });
}

export async function submitClaim(
  args: SubmitClaimArgs,
): Promise<SubmitClaimResult> {
  const c = getCampaign(args.campaignId);
  if (!c) return { ok: false, reason: "campaign_not_found", mode: "sim" };
  if (c.status !== "active") {
    return { ok: false, reason: "campaign_not_active", mode: "sim" };
  }
  const task = c.tasks.find((t) => t.id === args.taskId);
  if (!task) return { ok: false, reason: "task_not_found", mode: "sim" };

  ensureSimEscrow(c.id);

  const result = await claimCompletion({
    campaignId: c.id,
    participant: args.participant,
    proofSignature: args.proofSignature,
    taskType: task.type,
    rewardLamports: task.rewardLamports,
  });

  if (!result.ok) {
    return { ...result, campaignTitle: c.title, taskTitle: task.title };
  }

  const zoneKey = c.zones[0] ?? "discover";
  recordCompletion(c.id, zoneKey, task.id, args.participant);
  applyCompletionToCampaign(c.id, task.rewardLamports);

  const updated = getCampaign(c.id);
  if (updated && !updated.escrowPda) {
    upsertCampaign({
      ...updated,
      escrowPda: getEscrowState(c.id)?.escrowPda,
    });
  }

  return { ...result, campaignTitle: c.title, taskTitle: task.title };
}
