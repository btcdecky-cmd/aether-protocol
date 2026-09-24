import { useParams, Link } from "react-router-dom";
import { getCampaign } from "../lib/campaign-store";
import { ensureSimEscrow, submitClaim } from "../lib/protocol";
import { useEffect, useState } from "react";

const DEMO_WALLET = "DemoUser1111111111111111111111111111111111";

export function CampaignPage() {
  const { id } = useParams();
  const [done, setDone] = useState<string[]>([]);
  const [msg, setMsg] = useState("");
  const [proof, setProof] = useState("");
  const [busy, setBusy] = useState(false);
  const [version, setVersion] = useState(0);
  const campaign = id ? getCampaign(id) : undefined;
  void version;

  useEffect(() => {
    if (campaign?.status === "active") ensureSimEscrow(campaign.id);
  }, [campaign?.id, campaign?.status]);

  if (!campaign) {
    return (
      <div>
        <p>Campaign not found.</p>
        <Link to="/discover">Back to discover</Link>
      </div>
    );
  }

  async function claimTask(taskId: string) {
    if (!campaign) return;
    const task = campaign.tasks.find((t) => t.id === taskId);
    if (!task) return;
    setBusy(true);
    setMsg("");
    try {
      const needsProof =
        task.type === "onchain" || task.type === "stake" || task.type === "swap";
      if (needsProof && !proof.trim()) {
        setMsg(
          "Paste a real Solana tx signature — Helius must confirm it before payout.",
        );
        return;
      }
      const result = await submitClaim({
        campaignId: campaign.id,
        taskId,
        participant: DEMO_WALLET,
        proofSignature: needsProof ? proof.trim() : undefined,
      });
      if (result.ok) {
        setDone((d) => (d.includes(taskId) ? d : [...d, taskId]));
        setMsg(
          `Paid ${(result.payoutLamports! / 1e9).toFixed(4)} SOL · receipt ${result.receiptId} · mode ${result.mode}`,
        );
        setVersion((v) => v + 1);
      } else {
        setMsg(`Claim failed: ${result.reason}`);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <Link to="/discover" className="muted">
        ← Discover
      </Link>
      <h1 style={{ fontSize: 28, margin: "12px 0 8px" }}>{campaign.title}</h1>
      <p className="muted">{campaign.hook}</p>
      <p style={{ marginTop: 12 }}>{campaign.description}</p>

      <div style={{ margin: "16px 0" }}>
        <span className={`badge ${campaign.priority}`}>{campaign.priority}</span>
        <span className="badge">{campaign.status}</span>
        <span className="badge">w{campaign.weight ?? 1}</span>
        <span className="badge">zones: {campaign.zones.join(", ")}</span>
      </div>
      <p className="muted">
        Completions {campaign.completionCount}/{campaign.maxCompletions} · spent{" "}
        {(campaign.spentLamports / 1e9).toFixed(3)} /{" "}
        {(campaign.budgetLamports / 1e9).toFixed(3)} SOL
      </p>

      <div className="card">
        <label className="muted" style={{ display: "block", marginBottom: 4 }}>
          Proof signature (Helius-enforced for on-chain / stake / swap)
        </label>
        <input
          value={proof}
          onChange={(e) => setProof(e.target.value)}
          placeholder="Paste real Solana tx signature after the action"
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "#0b0b0f",
            color: "var(--text)",
            fontFamily: "ui-monospace, monospace",
            fontSize: 12,
          }}
        />
      </div>

      {msg && (
        <div className="card">
          <p style={{ margin: 0 }}>{msg}</p>
        </div>
      )}

      <h2 style={{ fontSize: 20 }}>Tasks</h2>
      {campaign.tasks.map((t) => (
        <div key={t.id} className="card">
          <h3 style={{ fontSize: 16 }}>
            {t.title}{" "}
            <span className="muted">({t.type})</span>
          </h3>
          <p className="muted">{t.description}</p>
          <p className="muted">
            Reward: {(t.rewardLamports / 1e9).toFixed(4)} SOL
          </p>
          <button
            className="btn"
            disabled={busy || done.includes(t.id) || campaign.status !== "active"}
            onClick={() => claimTask(t.id)}
            style={{ marginTop: 8 }}
          >
            {done.includes(t.id)
              ? "Claimed ✓"
              : campaign.status !== "active"
                ? "Campaign not active"
                : "Claim reward"}
          </button>
        </div>
      ))}
    </div>
  );
}
