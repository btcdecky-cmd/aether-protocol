/**
 * Verify Helius connectivity.
 * Usage: HELIUS_API_KEY=... npx tsx scripts/helius-ping.ts
 */

import { HeliusClient } from "../src/lib/helius/client";

async function main() {
  const client = new HeliusClient();
  console.log("Helius configured:", client.configured);
  console.log("RPC endpoint host:", new URL(client.rpcEndpoint).host);

  try {
    const slot = await client.getSlot();
    console.log("Slot:", slot);
  } catch (e) {
    console.error("getSlot failed:", e);
  }

  if (!client.configured) {
    console.log(
      "\nSet HELIUS_API_KEY from https://dashboard.helius.dev for DAS + enhanced APIs.",
    );
    process.exit(0);
  }

  const demo = "86xCnPeV69n6t3DnyGvkKobf9FdN2H9oiVDdaMpo2MMY";
  try {
    const bal = await client.getBalanceLamports(demo);
    console.log("Demo balance (SOL):", (bal / 1e9).toFixed(4));
    const assets = await client.getAssetsByOwner(demo, 1, 5);
    console.log("DAS assets sample:", assets.items.length);
  } catch (e) {
    console.error("DAS/balance error:", e);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
