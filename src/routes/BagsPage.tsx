import { useState } from "react";

export function BagsPage() {
  const [status, setStatus] = useState<string>("Not checked");

  async function pingPublic() {
    setStatus("Pinging…");
    try {
      const res = await fetch("https://public-api-v2.bags.fm/ping");
      const data = (await res.json()) as { message?: string };
      setStatus(res.ok ? `OK: ${data.message ?? res.status}` : `HTTP ${res.status}`);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: 28 }}>Bags.fm</h1>
      <p className="muted">
        Aether integrates the Bags public API for pool discovery, launches, and
        fee/creator signals. Docs:{" "}
        <a href="https://docs.bags.fm" target="_blank" rel="noreferrer">
          docs.bags.fm
        </a>
        . Keys:{" "}
        <a href="https://dev.bags.fm" target="_blank" rel="noreferrer">
          dev.bags.fm
        </a>
        .
      </p>

      <div className="card" style={{ marginTop: 16 }}>
        <h3>Public health</h3>
        <p className="muted">{status}</p>
        <button className="btn" type="button" onClick={pingPublic}>
          Ping Bags API
        </button>
      </div>

      <div className="card">
        <h3>Server client</h3>
        <p className="muted">
          Set <code>BAGS_API_KEY</code> in <code>.env</code>, then run{" "}
          <code>npm run bags:ping</code> for authenticated pool listing via{" "}
          <code>src/lib/bags/client.ts</code>.
        </p>
      </div>
    </div>
  );
}
