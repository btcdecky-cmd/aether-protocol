import { useMemo, useState } from "react";
import {
  activateCampaign,
  createDraft,
  submitForReview,
} from "../lib/campaign-flow";
import type { Campaign } from "../db/schema/campaigns";
import { AdvertiseSummaryCard } from "../components/AdvertiseSummaryCard";
import { upsertCampaign } from "../lib/campaign-store";
import { deriveEscrowPda, fundCampaignSim } from "../lib/protocol/escrow-client";

export function AdvertisePage() {
  const [title, setTitle] = useState("My protocol launch");
  const [hook, setHook] = useState(
    "Cut onboarding from 3 tools to 1 — first 500 wallets earn.",
  );
  const [budgetSol, setBudgetSol] = useState("5");
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [activating, setActivating] = useState(false);

  const draftReady = useMemo(
    () => title.trim().length > 2 && Number(budgetSol) > 0,
    [title, budgetSol],
  );

  function onSubmitReview() {
    const budgetLamports = Math.floor(Number(budgetSol) * 1e9);
    const reward = Math.floor(budgetLamports / 500);
    const c = createDraft({
      projectId: "proj-demo",
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40),
      title,
      hook,
      description: hook,
      objective: "activation",
      priority: "contract",
      zones: ["discover", "project"],
      category: "protocol",
      budgetLamports,
      rewardPerCompletionLamports: reward,
      maxCompletions: 500,
      weight: 5,
      tasks: [
        {
          id: "t-visit",
          type: "visit",
          title: "Visit the docs",
          description: "Open the project landing page",
          rewardLamports: Math.floor(reward * 0.3),
        },
        {
          id: "t-onchain",
          type: "onchain",
          title: "Complete an on-chain action",
          description: "Submit a real tx signature — Helius verifies before payout",
          rewardLamports: Math.floor(reward * 0.7),
        },
      ],
    });
    const pending = submitForReview(c);
    setCampaign(pending);
  }

  function onActivate() {
    if (!campaign) return;
    setActivating(true);
    const escrowPda = deriveEscrowPda(campaign.id);
    const { campaign: active } = activateCampaign(campaign, escrowPda);
    fundCampaignSim({
      campaignId: active.id,
      advertiser: active.advertiserWallet ?? "AdvertiserDemo1111111111111111111111111",
      authority: "AetherOracle111111111111111111111111111111",
      budgetLamports: active.budgetLamports,
      rewardPerCompletionLamports: active.rewardPerCompletionLamports,
      maxCompletions: active.maxCompletions,
    });
    upsertCampaign(active);
    setCampaign(active);
    setActivating(false);
  }

  if (campaign?.status === "pending_review") {
    return (
      <div>
        <h1 style={{ fontSize: 28, marginBottom: 16 }}>Advertise</h1>
        <AdvertiseSummaryCard
          campaign={campaign}
          activating={activating}
          onActivate={onActivate}
          onBackToDraft={() => setCampaign(null)}
        />
      </div>
    );
  }

  if (campaign?.status === "active") {
    return (
      <div>
        <h1 style={{ fontSize: 28 }}>Campaign live</h1>
        <p className="muted">{campaign.title} is active. Escrow funded (sim).</p>
        <p className="muted">Escrow PDA: {campaign.escrowPda}</p>
        <a className="btn" href={`/campaigns/${campaign.id}`}>
          View campaign
        </a>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Advertise</h1>
      <p className="muted" style={{ marginBottom: 16 }}>
        Draft → review → fund escrow → active. On-chain tasks require Helius proofs.
      </p>
      <div className="card">
        <label className="muted">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: "100%", marginBottom: 12, padding: 10 }}
        />
        <label className="muted">Hook</label>
        <input
          value={hook}
          onChange={(e) => setHook(e.target.value)}
          style={{ width: "100%", marginBottom: 12, padding: 10 }}
        />
        <label className="muted">Budget (SOL)</label>
        <input
          value={budgetSol}
          onChange={(e) => setBudgetSol(e.target.value)}
          style={{ width: "100%", marginBottom: 12, padding: 10 }}
        />
        <button
          className="btn"
          type="button"
          disabled={!draftReady}
          onClick={onSubmitReview}
        >
          Submit for review
        </button>
      </div>
    </div>
  );
}
