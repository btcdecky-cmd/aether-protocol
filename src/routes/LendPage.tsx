import { listForZone } from "../lib/campaign-store";

export function LendPage() {
  const unlocked = false;
  const teasers = listForZone("lend_teaser");

  return (
    <div>
      <h1 style={{ fontSize: 28 }}>Lend</h1>
      <p className="muted">
        Markets open after you receive at least one campaign payout (journey step
        6). LTV target: 50%.
      </p>

      {!unlocked && (
        <div className="card" style={{ marginTop: 16 }}>
          <h3>Locked</h3>
          <p className="muted">
            Complete a paid campaign action first. Finish a task on Discover or
            Journey, then return here.
          </p>
        </div>
      )}

      {teasers.length > 0 && (
        <>
          <h2 style={{ fontSize: 18, marginTop: 24 }}>Related campaigns</h2>
          {teasers.map((c) => (
            <div key={c.id} className="card">
              <span className={`badge ${c.priority}`}>{c.priority}</span>
              <h3>{c.title}</h3>
              <p className="muted">{c.hook}</p>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
