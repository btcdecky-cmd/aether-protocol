/**
 * Verify Bags.fm API connectivity.
 * Usage: BAGS_API_KEY=... npx tsx scripts/bags-ping.ts
 */

import { BagsClient } from "../src/lib/bags/client";

async function main() {
  const client = new BagsClient();
  console.log("Bags configured:", client.configured);

  const ping = await client.ping();
  console.log("Ping:", ping);

  if (!client.configured) {
    console.log(
      "\nSet BAGS_API_KEY from https://dev.bags.fm to call authenticated endpoints.",
    );
    process.exit(ping.ok ? 0 : 1);
  }

  const pools = await client.getPools(false);
  if (pools.success) {
    const list = pools.response ?? [];
    console.log(`Pools: ${list.length} returned`);
    if (list[0]) console.log("Sample pool mint:", list[0].tokenMint);
  } else {
    console.log("Pools error:", pools.error);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
