import { useState } from "react";
import { HeliusClient, type HeliusTxSummary, type HeliusAssetItem } from "../lib/helius";

export function HeliusPage() {
  const [address, setAddress] = useState(
    "86xCnPeV69n6t3DnyGvkKobf9FdN2H9oiVDdaMpo2MMY",
  );
  const [status, setStatus] = useState("Idle");
  const [balance, setBalance] = useState<string | null>(null);
  const [assets, setAssets] = useState<HeliusAssetItem[]>([]);
  const [txs, setTxs] = useState<HeliusTxSummary[]>([]);

  async function runLookup() {
    setStatus("Loading…");
    setBalance(null);
    setAssets([]);
    setTxs([]);
    try {
      const key =
        (import.meta.env.VITE_HELIUS_API_KEY as string | undefined) || "";
      const client = new HeliusClient({
        apiKey: key || undefined,
        network: "mainnet",
      });

      if (!client.configured) {
        setStatus(
          "No API key — set VITE_HELIUS_API_KEY in .env (dashboard.helius.dev). Showing public RPC balance only if possible.",
        );
      }

      const lamports = await client.getBalanceLamports(address.trim());
      setBalance((lamports / 1e9).toFixed(4) + " SOL");

      if (client.configured) {
        const page = await client.getAssetsByOwner(address.trim(), 1, 12);
        setAssets(page.items);
        try {
          const enhanced = await client.getEnhancedTransactionsByAddress(
            address.trim(),
            8,
          );
          setTxs(enhanced);
        } catch {
          const plain = await client.getTransactionsForAddress(address.trim(), 8);
          setTxs(plain);
        }
        setStatus(`OK via Helius (${client.network})`);
      } else {
        setStatus("Balance via public RPC (add HELIUS_API_KEY for DAS + history)");
      }
    } catch (e) {
      setStatus(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: 28 }}>Helius</h1>
      <p className="muted">
        Integrated for RPC, DAS assets, transaction history, and on-chain task
        verification. SDK:{" "}
        <a
          href="https://github.com/helius-labs/helius-sdk"
          target="_blank"
          rel="noreferrer"
        >
          helius-labs/helius-sdk
        </a>
        . Keys:{" "}
        <a href="https://dashboard.helius.dev" target="_blank" rel="noreferrer">
          dashboard.helius.dev
        </a>
        .
      </p>

      <div className="card" style={{ marginTop: 16 }}>
        <label className="muted" style={{ display: "block", marginBottom: 4 }}>
          Wallet address
        </label>
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 12,
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "#0b0b0f",
            color: "var(--text)",
            fontFamily: "ui-monospace, monospace",
            fontSize: 13,
          }}
        />
        <button className="btn" type="button" onClick={runLookup}>
          Lookup with Helius
        </button>
        <p className="muted" style={{ marginTop: 12 }}>
          {status}
        </p>
        {balance && (
          <p>
            Balance: <strong>{balance}</strong>
          </p>
        )}
      </div>

      {assets.length > 0 && (
        <div className="card">
          <h3>Assets (DAS)</h3>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {assets.slice(0, 10).map((a) => (
              <li key={a.id} className="muted" style={{ marginBottom: 6 }}>
                {a.content?.metadata?.name ||
                  a.token_info?.symbol ||
                  a.id.slice(0, 12) + "…"}
                {a.token_info?.balance != null &&
                  a.token_info.decimals != null && (
                    <span>
                      {" "}·{" "}
                      {(
                        a.token_info.balance /
                        10 ** a.token_info.decimals
                      ).toFixed(4)}
                    </span>
                  )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {txs.length > 0 && (
        <div className="card">
          <h3>Recent activity</h3>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {txs.map((tx) => (
              <li
                key={tx.signature}
                className="muted"
                style={{ marginBottom: 8, wordBreak: "break-all" }}
              >
                {tx.description || tx.type || "tx"} ·{" "}
                <code>{tx.signature.slice(0, 20)}…</code>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
