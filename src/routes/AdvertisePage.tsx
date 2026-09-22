import { useMemo, useState } from "react";
import {
  activateCampaign,
  createDraft,
  submitForReview,
} from "../lib/campaign-flow";
import type { Campaign } from "../db/schema/campaigns";
import { AdvertiseSummaryCard } from "../components/AdvertiseSummaryCard";
import { upsertCampaign } from "../lib/campaign-store";

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

  function onCreateDraft() {
    const budgetLamports = Math.floor(Number(budgetSol) * 1e9);
    const reward = Math.floor(budgetLamports / 100);
    const c = createDraft({
      projectId: "proj-custom",
      slug: title.toLowerCase().replace(/\s+/g, "-").slice(0, 40),
      title,
      hook,
      description: hook,
      objective: "activation",
      priority: "contract",
      zones: ["discover", "project"],
      category: "custom",
      budgetLamports,
      rewardPerCompletionLamports: reward,
      maxCompletions: 100,
      tasks: [
        {
          id: "t1",
          type: "visit",
          title: "Visit project",
          description: "Open the project page from Discover.",
          rewardLamports: Math.floor(reward / 2),
        },
        {
          id: "t2",
          type: "onchain",
          title: "Eligible interaction",
          description: "Submit a verified on-chain action.",
          rewardLamports: Math.ceil(reward / 2),
        },
      ],
    });
    const pending = submitForReview(c);
    setCampaign(pending);
  }

  function onActivate() {
    if (!campaign) return;
    setActivating(true);
    const escrowPda = "Escrow" + campaign.id.slice(0, 28);
    const { campaign: active } = activateCampaign(campaign, escrowPda);
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
        <h1 style={{ fontSize: 28 }}>Live</h1>
        <div className="card">
          <p>
            Campaign <strong>{campaign.title}</strong> is active.
          </p>
          <p className="muted">Escrow: {campaign.escrowPda}</p>
          <button
            className="btn ghost"
            type="button"
            onClick={() => setCampaign(null)}
          >
            Create another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: 28 }}>Advertise</h1>
      <p className="muted" style={{ marginBottom: 16 }}>
        Draft → review summary → Fund & activate. Nothing goes live without your
        confirmation.
      </p>
      <div className="card">
        <label className="muted" style={{ display: "block", marginBottom: 4 }}>
          Title
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 12,
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "#0b0b0f",
            color: "var(--text)",
          }}
        />
        <label className="muted" style={{ display: "block", marginBottom: 4 }}>
          Hook
        </label>
        <textarea
          value={hook}
          onChange={(e) => setHook(e.target.value)}
          rows={3}
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 12,
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "#0b0b0f",
            color: "var(--text)",
          }}
        />
        <label className="muted" style={{ display: "block", marginBottom: 4 }}>
          Budget (SOL)
        </label>
        <input
          type="number"
          min="0.1"
          step="0.1"
          value={budgetSol}
          onChange={(e) => setBudgetSol(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 16,
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "#0b0b0f",
            color: "var(--text)",
          }}
        />
        <button
          className="btn"
          type="button"
          disabled={!draftReady}
          onClick={onCreateDraft}
        >
          Submit for review
        </button>
      </div>
    </div>
  );
}
