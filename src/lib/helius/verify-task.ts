/**
 * Helius-enforced on-chain task proofs.
 *
 * Policy: NO payout without a confirmed Solana signature verified via Helius.
 * Demo / placeholder signatures are rejected. Missing API key → hard fail.
 */

import { getHeliusClient } from "./client";

export interface TaskProofInput {
  signature: string;
  wallet?: string;
}

const DEMO_MARKERS = [
  "demoProof",
  "DEMO",
  "placeholder",
  "0000000000000000",
  "5555555555555555",
];

function looksLikeDemoSignature(sig: string): boolean {
  const s = sig.trim();
  if (s.length < 64 || s.length > 128) return true;
  if (/^(.)\1{20,}$/.test(s.replace(/[^a-zA-Z0-9]/g, "").slice(0, 32))) {
    return true;
  }
  const lower = s.toLowerCase();
  return DEMO_MARKERS.some((m) => lower.includes(m.toLowerCase()));
}

export async function verifyOnchainTaskProof(
  input: TaskProofInput,
): Promise<{ ok: boolean; reason?: string; slot?: number }> {
  const sig = input.signature?.trim();
  if (!sig || sig.length < 64) {
    return { ok: false, reason: "invalid_signature" };
  }
  if (looksLikeDemoSignature(sig)) {
    return { ok: false, reason: "demo_signature_rejected" };
  }

  const helius = getHeliusClient();
  if (!helius.configured) {
    return { ok: false, reason: "helius_not_configured" };
  }

  try {
    const ok = await helius.verifySignatureSuccess(sig);
    if (!ok) {
      return { ok: false, reason: "signature_not_confirmed_or_failed" };
    }

    if (input.wallet && input.wallet.length >= 32) {
      try {
        const tx = await helius.rpc<{
          transaction?: {
            message?: {
              accountKeys?: Array<string | { pubkey?: string }>;
            };
          };
          meta?: { err?: unknown };
        } | null>("getTransaction", [
          sig,
          { encoding: "json", maxSupportedTransactionVersion: 0 },
        ]);
        if (!tx) {
          return { ok: false, reason: "transaction_not_found" };
        }
        if (tx.meta?.err) {
          return { ok: false, reason: "transaction_failed_on_chain" };
        }
        const keys = tx.transaction?.message?.accountKeys ?? [];
        const pubs = keys.map((k) =>
          typeof k === "string" ? k : (k.pubkey ?? ""),
        );
        if (pubs.length > 0 && !pubs.includes(input.wallet)) {
          return { ok: false, reason: "wallet_not_in_transaction" };
        }
      } catch {
        /* status already passed */
      }
    }

    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      reason: e instanceof Error ? e.message : "helius_verify_error",
    };
  }
}

export const HELIUS_REQUIRED_TASK_TYPES = new Set([
  "onchain",
  "stake",
  "swap",
]);

export function requiresHeliusProof(taskType: string): boolean {
  return HELIUS_REQUIRED_TASK_TYPES.has(taskType);
}
