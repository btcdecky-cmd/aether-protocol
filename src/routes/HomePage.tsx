import { Link } from "react-router-dom";
import { listForZone } from "../lib/campaign-store";

export function HomePage() {
  const featured = listForZone("discover").slice(0, 3);

  return (
    <div>
      <section className="hero">
        <h1>Discover. Participate. Earn.</h1>
        <p className="muted" style={{ maxWidth: 520 }}>
          On-chain Solana adoption and advertising. Complete real actions — not
          empty clicks — and get paid from campaign escrow. Lending unlocks after
          your first payout.
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
          <Link className="btn" to="/discover">
            Browse campaigns
          </Link>
          <Link className="btn ghost" to="/journey">
            Start journey
          </Link>
        </div>
      </section>

      <h2 style={{ fontSize: 22, marginBottom: 12 }}>Featured</h2>
      <div className="grid cols-2">
        {featured.map((c) => (
          <Link key={c.id} to={`/campaigns/${c.id}`} className="card">
            <span className={`badge ${c.priority}`}>{c.priority}</span>
            <span className="badge">{c.objective}</span>
            <h3>{c.title}</h3>
            <p className="muted">{c.hook}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
