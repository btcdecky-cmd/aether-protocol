/**
 * On-chain campaign task verification via Helius.
 * Confirms a user-submitted signature succeeded before releasing escrow reward.
 */

import { getHeliusClient } from "./client";

export interface TaskProofInput {
  signature: string;
  wallet?: string;
}

export async function verifyOnchainTaskProof(
  input: TaskProofInput,
): Promise<{ ok: boolean; reason?: string }> {
  const sig = input.signature?.trim();
  if (!sig || sig.length < 64) {
    return { ok: false, reason: "invalid_signature" };
  }

  const helius = getHeliusClient();
  const ok = await helius.verifySignatureSuccess(sig);
  if (!ok) {
    return { ok: false, reason: "signature_not_confirmed_or_failed" };
  }

  return { ok: true };
}
