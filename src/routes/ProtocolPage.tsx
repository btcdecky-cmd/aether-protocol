import { useMemo, useState } from "react";
import {
  getProtocolMode,
  getProgramId,
  listFundedCampaigns,
  fundCampaignSim,
} from "../lib/protocol";
import { listCampaigns } from "../lib/campaign-store";
import { getZoneStats } from "../lib/inventory-store";

export function ProtocolPage() {
  const mode = getProtocolMode();
  const programId = getProgramId();
  const [tick, setTick] = useState(0);
  const funded = useMemo(() => listFundedCampaigns(), [tick]);
  const active = listCampaigns().filter((c) => c.status === "active");
  const stats = getZoneStats();

  function fundAllActive() {
    for (const c of active) {
      fundCampaignSim({
        campaignId: c.id,
        advertiser: c.advertiserWallet ?? "AdvertiserDemo1111111111111111111111111",
        authority: "AetherOracle111111111111111111111111111111",
        budgetLamports: c.budgetLamports,
        rewardPerCompletionLamports: c.rewardPerCompletionLamports,
        maxCompletions: c.maxCompletions,
      });
    }
    setTick((t) => t + 1);
  }

  return (
    <div>
      <h1 style={{ fontSize: 28 }}>Protocol</h1>
      <p className="muted" style={{ maxWidth: 640 }}>
        Live Solana adoption ad protocol. Escrow holds budgets; completions pay
        after verification. One claim per wallet per campaign.
      </p>
      <div className="grid cols-2" style={{ marginTop: 16 }}>
        <div className="card">
          <h3>Mode</h3>
          <p>
            <span className={`badge ${mode === "rpc" ? "override" : "contract"}`}>
              {mode}
            </span>
          </p>
          <p className="muted">
            Set <code>AETHER_PROTOCOL_MODE=rpc</code> for on-chain pay_completion.
          </p>
        </div>
        <div className="card">
          <h3>Program</h3>
          <p style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, wordBreak: "break-all" }}>
            {programId}
          </p>
        </div>
      </div>
      <div className="card">
        <h3>Escrow ledger ({funded.length} funded)</h3>
        <button className="btn" type="button" onClick={fundAllActive}>
          Fund all active campaigns (sim)
        </button>
        <ul style={{ marginTop: 12, paddingLeft: 18 }}>
          {funded.map((e) => (
            <li key={e.campaignId} className="muted" style={{ marginBottom: 8 }}>
              <code>{e.campaignId}</code> · {e.status} · {e.completionCount}/
              {e.maxCompletions} · claimants {e.claimants.length}
            </li>
          ))}
          {!funded.length && <li className="muted">None yet</li>}
        </ul>
      </div>
      <div className="card">
        <h3>Zone stats</h3>
        <ul style={{ paddingLeft: 18 }}>
          {stats.map((s) => (
            <li key={s.zoneKey} className="muted">
              {s.zoneKey}: req {s.requests} · imp {s.impressions} · done{" "}
              {s.completions}
            </li>
          ))}
          {!stats.length && <li className="muted">No events yet</li>}
        </ul>
      </div>
    </div>
  );
}
