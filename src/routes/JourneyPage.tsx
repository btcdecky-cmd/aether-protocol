import { Link } from "react-router-dom";
import { listForZone } from "../lib/campaign-store";

const STEPS = [
  "Connect wallet",
  "Learn about Solana",
  "First on-chain action",
  "Discover a project",
  "Complete eligible activity",
  "Receive reward",
  "Return for more",
];

export function JourneyPage() {
  const step = 3;
  const journeyCampaigns = listForZone("journey");

  return (
    <div>
      <h1 style={{ fontSize: 28 }}>Adoption journey</h1>
      <p className="muted" style={{ marginBottom: 20 }}>
        Guided path from first wallet to rewarded protocol use. Lending unlocks
        at step 6.
      </p>

      <ol style={{ paddingLeft: 20, marginBottom: 24 }}>
        {STEPS.map((label, i) => (
          <li
            key={label}
            style={{
              marginBottom: 8,
              color: i < step ? "var(--accent)" : "var(--muted)",
              fontWeight: i === step - 1 ? 600 : 400,
            }}
          >
            {label}
            {i < step - 1 ? " ✓" : i === step - 1 ? " ← you are here" : ""}
          </li>
        ))}
      </ol>

      <h2 style={{ fontSize: 20 }}>Eligible on this step</h2>
      <div className="grid">
        {journeyCampaigns.map((c) => (
          <Link key={c.id} to={`/campaigns/${c.id}`} className="card">
            <span className={`badge ${c.priority}`}>{c.priority}</span>
            <h3>{c.title}</h3>
            <p className="muted">{c.hook}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
