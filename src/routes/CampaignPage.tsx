import { useParams, Link } from "react-router-dom";
import { getCampaign } from "../lib/campaign-store";
import {
  recordCompletion,
  applyCompletionToCampaign,
} from "../lib/inventory-store";
import { useState } from "react";

export function CampaignPage() {
  const { id } = useParams();
  const [done, setDone] = useState<string[]>([]);
  const [version, setVersion] = useState(0);
  const campaign = id ? getCampaign(id) : undefined;
  void version;

  if (!campaign) {
    return (
      <div>
        <p>Campaign not found.</p>
        <Link to="/discover">Back to discover</Link>
      </div>
    );
  }

  function completeTask(taskId: string) {
    if (!campaign) return;
    const task = campaign.tasks.find((t) => t.id === taskId);
    if (!task) return;
    setDone((d) => (d.includes(taskId) ? d : [...d, taskId]));
    const zoneKey = campaign.zones[0] ?? "discover";
    recordCompletion(campaign.id, zoneKey, taskId);
    applyCompletionToCampaign(campaign.id, task.rewardLamports);
    setVersion((v) => v + 1);
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

      <h2 style={{ fontSize: 20 }}>Tasks</h2>
      {campaign.tasks.map((t) => (
        <div key={t.id} className="card">
          <h3 style={{ fontSize: 16 }}>
            {t.title}{" "}
            <span className="muted">
              ({t.type}
              {t.weight != null ? ` · w${t.weight}` : ""})
            </span>
          </h3>
          <p className="muted">{t.description}</p>
          <p className="muted">
            Reward: {(t.rewardLamports / 1e9).toFixed(4)} SOL
          </p>
          <button
            className="btn"
            disabled={done.includes(t.id)}
            onClick={() => completeTask(t.id)}
            style={{ marginTop: 8 }}
          >
            {done.includes(t.id) ? "Completed ✓" : "Mark complete (demo)"}
          </button>
        </div>
      ))}
    </div>
  );
}
