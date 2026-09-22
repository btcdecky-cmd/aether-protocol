import { useParams, Link } from "react-router-dom";
import { getCampaign } from "../lib/campaign-store";
import { useState } from "react";

export function CampaignPage() {
  const { id } = useParams();
  const campaign = id ? getCampaign(id) : undefined;
  const [done, setDone] = useState<string[]>([]);

  if (!campaign) {
    return (
      <div>
        <p>Campaign not found.</p>
        <Link to="/discover">Back to discover</Link>
      </div>
    );
  }

  function completeTask(taskId: string) {
    setDone((d) => (d.includes(taskId) ? d : [...d, taskId]));
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
        <span className="badge">
          zones: {campaign.zones.join(", ")}
        </span>
      </div>

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
