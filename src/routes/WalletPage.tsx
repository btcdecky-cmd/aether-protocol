import { useState } from "react";
import { Link } from "react-router-dom";
import { supabaseConfigured } from "../lib/supabase";

function demoPubkey(seed: string) {
  const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  let out = "";
  for (let i = 0; i < 44; i++) {
    h = (h * 1664525 + 1013904223) >>> 0;
    out += alphabet[h % alphabet.length];
  }
  return out;
}

export function WalletPage() {
  const [linked, setLinked] = useState(false);
  const pubkey = demoPubkey("aether-demo-user");

  return (
    <div>
      <h1 style={{ fontSize: 28 }}>Wallet</h1>
      <p className="muted">
        Protocol wallet for rewards and advertising escrow. Supabase auth:{" "}
        {supabaseConfigured ? "configured" : "placeholder keys (demo mode)"}.
        On-chain balance and history via <Link to="/helius">Helius</Link>.
      </p>

      <div className="card" style={{ marginTop: 16 }}>
        <h3>Derived address</h3>
        <p
          style={{
            fontFamily: "ui-monospace, monospace",
            fontSize: 13,
            wordBreak: "break-all",
          }}
        >
          {pubkey}
        </p>
        <p className="muted">Balance (demo): 0.42 SOL</p>
        <button className="btn" style={{ marginTop: 8 }} type="button">
          Request faucet (demo)
        </button>
      </div>

      <div className="card">
        <h3>Linked external wallet</h3>
        <p className="muted">
          {linked ? "Linked (demo)" : "Not linked — connect Phantom / Solflare"}
        </p>
        <button
          className="btn ghost"
          type="button"
          onClick={() => setLinked((v) => !v)}
        >
          {linked ? "Disconnect" : "Connect wallet (demo)"}
        </button>
      </div>
    </div>
  );
}
