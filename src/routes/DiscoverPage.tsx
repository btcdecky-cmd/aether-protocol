import { Link } from "react-router-dom";
import { listForZone } from "../lib/campaign-store";

export function DiscoverPage() {
  const campaigns = listForZone("discover");

  return (
    <div>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Discover</h1>
      <p className="muted" style={{ marginBottom: 20 }}>
        Active campaigns ranked override → contract → remnant, then weight.
        Rewards from escrow for verified actions.
      </p>
      <div className="grid">
        {campaigns.map((c) => (
          <Link key={c.id} to={`/campaigns/${c.id}`} className="card">
            <span className={`badge ${c.priority}`}>{c.priority}</span>
            <span className="badge">{c.category}</span>
            <h3>{c.title}</h3>
            <p className="muted">{c.hook}</p>
            <p className="muted" style={{ marginTop: 8 }}>
              {(c.rewardPerCompletionLamports / 1e9).toFixed(3)} SOL ·{" "}
              {c.completionCount}/{c.maxCompletions} completions · w
              {c.weight ?? 1}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
