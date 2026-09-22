/**
 * Pre-fund summary card (Soku-style human gate).
 * User must explicitly confirm Fund & Activate — no silent go-live.
 */

import type { Campaign } from "../db/schema/campaigns";
import { buildActivationSummary } from "../lib/campaign-flow";

export interface AdvertiseSummaryCardProps {
  campaign: Campaign;
  onActivate: () => void;
  onBackToDraft: () => void;
  activating?: boolean;
}

export function AdvertiseSummaryCard({
  campaign,
  onActivate,
  onBackToDraft,
  activating = false,
}: AdvertiseSummaryCardProps) {
  const summary = buildActivationSummary(campaign);
  const budgetSol = (campaign.budgetLamports / 1e9).toFixed(4);
  const rewardSol = (campaign.rewardPerCompletionLamports / 1e9).toFixed(4);

  return (
    <div
      style={{
        border: "1px solid #2a2a3a",
        borderRadius: 12,
        padding: 24,
        background: "#0f0f14",
        color: "#e8e8f0",
        maxWidth: 520,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h2 style={{ margin: "0 0 8px", fontSize: 18 }}>Review before funding</h2>
      <p style={{ margin: "0 0 16px", opacity: 0.75, fontSize: 14 }}>
        Nothing is live until you confirm. Escrow will lock{" "}
        <strong>{budgetSol} SOL</strong>.
      </p>

      <dl
        style={{
          display: "grid",
          gridTemplateColumns: "120px 1fr",
          gap: "8px 12px",
          fontSize: 14,
          marginBottom: 16,
        }}
      >
        <dt style={{ opacity: 0.6 }}>Title</dt>
        <dd style={{ margin: 0 }}>{campaign.title}</dd>
        <dt style={{ opacity: 0.6 }}>Priority</dt>
        <dd style={{ margin: 0 }}>{campaign.priority}</dd>
        <dt style={{ opacity: 0.6 }}>Zones</dt>
        <dd style={{ margin: 0 }}>{campaign.zones.join(", ")}</dd>
        <dt style={{ opacity: 0.6 }}>Budget</dt>
        <dd style={{ margin: 0 }}>{budgetSol} SOL</dd>
        <dt style={{ opacity: 0.6 }}>Reward</dt>
        <dd style={{ margin: 0 }}>{rewardSol} SOL / completion</dd>
        <dt style={{ opacity: 0.6 }}>Max</dt>
        <dd style={{ margin: 0 }}>{campaign.maxCompletions} completions</dd>
        <dt style={{ opacity: 0.6 }}>Tasks</dt>
        <dd style={{ margin: 0 }}>
          {campaign.tasks.map((t) => t.type).join(" → ")}
        </dd>
        <dt style={{ opacity: 0.6 }}>Status</dt>
        <dd style={{ margin: 0 }}>{campaign.status} → active</dd>
      </dl>

      <pre
        style={{
          background: "#1a1a24",
          padding: 12,
          borderRadius: 8,
          fontSize: 12,
          overflow: "auto",
          marginBottom: 16,
        }}
      >
        {summary}
      </pre>

      <div style={{ display: "flex", gap: 12 }}>
        <button
          type="button"
          onClick={onBackToDraft}
          disabled={activating}
          style={{
            flex: 1,
            padding: "10px 16px",
            borderRadius: 8,
            border: "1px solid #3a3a4a",
            background: "transparent",
            color: "#ccc",
            cursor: "pointer",
          }}
        >
          Back to draft
        </button>
        <button
          type="button"
          onClick={onActivate}
          disabled={activating}
          style={{
            flex: 1,
            padding: "10px 16px",
            borderRadius: 8,
            border: "none",
            background: "#6c5ce7",
            color: "#fff",
            fontWeight: 600,
            cursor: activating ? "wait" : "pointer",
          }}
        >
          {activating ? "Funding…" : "Fund & activate"}
        </button>
      </div>
    </div>
  );
}
