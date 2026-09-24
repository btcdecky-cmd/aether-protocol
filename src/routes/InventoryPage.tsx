import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  listZones,
  invokeZone,
  getZoneStats,
  listDeliveryEvents,
} from "../lib/inventory-store";
import { listCampaigns } from "../lib/campaign-store";
import type { CampaignZone } from "../db/schema/campaigns";

export function InventoryPage() {
  const zones = listZones();
  const campaigns = listCampaigns();
  const [log, setLog] = useState("");
  const stats = useMemo(() => getZoneStats(), [log]);
  const recent = useMemo(() => listDeliveryEvents(12), [log]);

  function runInvoke(zoneKey: string) {
    const result = invokeZone({
      zoneKey,
      walletConnected: true,
      journeyStep: 3,
    });
    if (result.blank) {
      setLog(`Zone ${zoneKey}: BLANK (${result.reason ?? "none"})`);
    } else {
      setLog(
        `Zone ${zoneKey}: served "${result.campaign?.title}" [${result.tier}] weight=${(result.campaign as { weight?: number })?.weight ?? 1}`,
      );
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: 28 }}>Inventory</h1>
      <p className="muted" style={{ marginBottom: 16, maxWidth: 640 }}>
        Delivery model inspired by classic open-source ad servers (Revive
        Adserver concepts — not installed): <strong>zones</strong> as inventory,{" "}
        <strong>override → contract → remnant</strong> fill,{" "}
        <strong>weight</strong> lottery inside a tier, and{" "}
        <strong>request / blank / impression / completion</strong> stats.
        Creatives are on-chain tasks, not banners.
      </p>

      <h2 style={{ fontSize: 18 }}>Zones</h2>
      <div className="grid cols-2">
        {zones.map((z) => {
          const st = stats.find((s) => s.zoneKey === z.key);
          return (
            <div key={z.id} className="card">
              <span className="badge">{z.kind}</span>
              <h3>{z.name}</h3>
              <p className="muted">{z.description}</p>
              <p className="muted" style={{ marginTop: 8 }}>
                key: <code>{z.key}</code>
                {z.dailyRequestForecast != null && (
                  <> · forecast {z.dailyRequestForecast.toLocaleString()}/day</>
                )}
              </p>
              {st && (
                <p className="muted">
                  req {st.requests} · blank {st.blanks} · imp {st.impressions} ·
                  done {st.completions}
                </p>
              )}
              <button
                className="btn"
                type="button"
                style={{ marginTop: 10 }}
                onClick={() => runInvoke(z.key)}
              >
                Invoke zone (demo)
              </button>
            </div>
          );
        })}
      </div>

      {log && (
        <div className="card" style={{ marginTop: 8 }}>
          <p style={{ margin: 0 }}>{log}</p>
        </div>
      )}

      <h2 style={{ fontSize: 18, marginTop: 24 }}>Linked campaigns by priority</h2>
      <div className="grid">
        {(["override", "contract", "remnant"] as const).map((tier) => {
          const tierCamps = campaigns.filter(
            (c) => c.status === "active" && c.priority === tier,
          );
          return (
            <div key={tier} className="card">
              <span className={`badge ${tier}`}>{tier}</span>
              <p className="muted">{tierCamps.length} active</p>
              <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
                {tierCamps.map((c) => (
                  <li key={c.id} className="muted" style={{ marginBottom: 6 }}>
                    <Link to={`/campaigns/${c.id}`}>{c.title}</Link>
                    {" · "}zones {(c.zones as CampaignZone[]).join(", ")}
                    {" · "}w{c.weight ?? 1}
                  </li>
                ))}
                {!tierCamps.length && <li className="muted">—</li>}
              </ul>
            </div>
          );
        })}
      </div>

      <h2 style={{ fontSize: 18, marginTop: 24 }}>Recent delivery events</h2>
      <div className="card">
        {recent.length === 0 && (
          <p className="muted">No events yet — invoke a zone above.</p>
        )}
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {recent.map((e) => (
            <li key={e.id} className="muted" style={{ marginBottom: 6 }}>
              <code>{e.type}</code> · {e.zoneKey}
              {e.campaignId ? ` · ${e.campaignId}` : ""}
              {" · "}
              {new Date(e.at).toLocaleTimeString()}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
