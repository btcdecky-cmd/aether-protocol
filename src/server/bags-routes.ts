/**
 * Server helpers for Bags-backed API routes.
 * Wire these into your framework (TanStack Start / Vite SSR / etc.).
 */

import { getBagsClient } from "../lib/bags";

export async function handleBagsPools(onlyMigrated = false) {
  const client = getBagsClient();
  const result = await client.getPools(onlyMigrated);
  return result;
}

export async function handleBagsStatus() {
  const client = getBagsClient();
  const ping = await client.ping();
  return {
    configured: client.configured,
    ping,
  };
}
