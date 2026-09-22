/**
 * Helius integration for Aether
 *
 * Uses helius-sdk when available (createHelius), with a REST fallback so
 * the app still works before npm install completes.
 *
 * Docs: https://www.helius.dev/docs
 * SDK:  https://github.com/helius-labs/helius-sdk
 * Keys: https://dashboard.helius.dev
 */

const DEFAULT_NETWORK = "mainnet" as const;

export type HeliusNetwork = "mainnet" | "devnet";

export interface HeliusClientOptions {
  apiKey?: string;
  network?: HeliusNetwork;
}

export interface HeliusAssetItem {
  id: string;
  interface?: string;
  content?: {
    metadata?: { name?: string; symbol?: string };
    links?: { image?: string };
  };
  token_info?: {
    balance?: number;
    decimals?: number;
    symbol?: string;
  };
  ownership?: { owner?: string };
}

export interface HeliusAssetsPage {
  items: HeliusAssetItem[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface HeliusTxSummary {
  signature: string;
  slot?: number;
  blockTime?: number | null;
  err?: unknown;
  description?: string;
  type?: string;
  source?: string;
  fee?: number;
}

function rpcUrl(apiKey: string, network: HeliusNetwork): string {
  const host =
    network === "devnet"
      ? "https://devnet.helius-rpc.com"
      : "https://mainnet.helius-rpc.com";
  return `${host}/?api-key=${apiKey}`;
}

function apiBase(network: HeliusNetwork): string {
  return network === "devnet"
    ? "https://api-devnet.helius.xyz"
    : "https://api.helius.xyz";
}

export class HeliusClient {
  readonly apiKey: string;
  readonly network: HeliusNetwork;
  readonly rpcEndpoint: string;

  constructor(opts: HeliusClientOptions = {}) {
    this.apiKey =
      opts.apiKey ??
      (typeof process !== "undefined" ? process.env.HELIUS_API_KEY : undefined) ??
      (typeof process !== "undefined"
        ? process.env.VITE_HELIUS_API_KEY
        : undefined) ??
      "";
    this.network =
      opts.network ??
      ((typeof process !== "undefined"
        ? process.env.HELIUS_NETWORK
        : undefined) as HeliusNetwork | undefined) ??
      DEFAULT_NETWORK;
    this.rpcEndpoint = this.apiKey
      ? rpcUrl(this.apiKey, this.network)
      : "https://api.mainnet-beta.solana.com";
  }

  get configured(): boolean {
    return Boolean(this.apiKey);
  }

  async rpc<T>(method: string, params: unknown[] = []): Promise<T> {
    const res = await fetch(this.rpcEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "aether",
        method,
        params,
      }),
    });
    const body = (await res.json()) as {
      result?: T;
      error?: { message?: string; code?: number };
    };
    if (body.error) {
      throw new Error(body.error.message ?? `RPC error ${body.error.code}`);
    }
    return body.result as T;
  }

  async getBalanceLamports(ownerAddress: string): Promise<number> {
    const result = await this.rpc<{ value: number }>("getBalance", [
      ownerAddress,
    ]);
    return result.value;
  }

  async getSlot(): Promise<number> {
    return this.rpc<number>("getSlot", []);
  }

  async getAssetsByOwner(
    ownerAddress: string,
    page = 1,
    limit = 50,
  ): Promise<HeliusAssetsPage> {
    if (!this.apiKey) {
      return { items: [], page, limit, total: 0 };
    }
    const result = await this.rpc<{
      items?: HeliusAssetItem[];
      total?: number;
      page?: number;
      limit?: number;
    }>("getAssetsByOwner", [
      {
        ownerAddress,
        page,
        limit,
        options: {
          showFungible: true,
          showNativeBalance: true,
        },
      },
    ]);
    return {
      items: result.items ?? [],
      total: result.total,
      page: result.page ?? page,
      limit: result.limit ?? limit,
    };
  }

  async getTransactionsForAddress(
    address: string,
    limit = 20,
  ): Promise<HeliusTxSummary[]> {
    if (!this.apiKey) return [];
    try {
      const result = await this.rpc<{
        data?: Array<{
          signature?: string;
          slot?: number;
          blockTime?: number | null;
          err?: unknown;
        }>;
      }>("getTransactionsForAddress", [
        address,
        {
          transactionDetails: "full",
          sortOrder: "desc",
          limit,
        },
      ]);
      return (result.data ?? []).map((tx) => ({
        signature: tx.signature ?? "",
        slot: tx.slot,
        blockTime: tx.blockTime,
        err: tx.err,
      }));
    } catch {
      const sigs = await this.rpc<
        Array<{ signature: string; slot: number; blockTime?: number | null; err: unknown }>
      >("getSignaturesForAddress", [address, { limit }]);
      return sigs.map((s) => ({
        signature: s.signature,
        slot: s.slot,
        blockTime: s.blockTime,
        err: s.err,
      }));
    }
  }

  async getEnhancedTransactionsByAddress(
    address: string,
    limit = 20,
  ): Promise<HeliusTxSummary[]> {
    if (!this.apiKey) return [];
    const url = `${apiBase(this.network)}/v0/addresses/${address}/transactions?api-key=${this.apiKey}&limit=${limit}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Helius enhanced API HTTP ${res.status}`);
    }
    const data = (await res.json()) as Array<{
      signature?: string;
      slot?: number;
      timestamp?: number;
      description?: string;
      type?: string;
      source?: string;
      fee?: number;
    }>;
    return (data ?? []).map((tx) => ({
      signature: tx.signature ?? "",
      slot: tx.slot,
      blockTime: tx.timestamp ?? null,
      description: tx.description,
      type: tx.type,
      source: tx.source,
      fee: tx.fee,
    }));
  }

  async verifySignatureSuccess(signature: string): Promise<boolean> {
    try {
      const result = await this.rpc<{
        value?: Array<{ confirmationStatus?: string; err?: unknown } | null>;
      }>("getSignatureStatuses", [[signature], { searchTransactionHistory: true }]);
      const st = result.value?.[0];
      if (!st) return false;
      return !st.err;
    } catch {
      return false;
    }
  }

  async getPriorityFeeEstimate(accountKeys: string[]): Promise<number | null> {
    if (!this.apiKey) return null;
    try {
      const result = await this.rpc<{ priorityFeeEstimate?: number }>(
        "getPriorityFeeEstimate",
        [{ accountKeys, options: { priorityLevel: "Medium" } }],
      );
      return result.priorityFeeEstimate ?? null;
    } catch {
      return null;
    }
  }
}

let _client: HeliusClient | null = null;

export function getHeliusClient(): HeliusClient {
  if (!_client) _client = new HeliusClient();
  return _client;
}

export async function createSdkHelius(
  apiKey: string,
  network: HeliusNetwork = "mainnet",
) {
  try {
    const mod = await import("helius-sdk");
    const createHelius = (
      mod as { createHelius?: (o: { apiKey: string; network?: string }) => unknown }
    ).createHelius;
    if (createHelius) {
      return createHelius({ apiKey, network });
    }
  } catch {
    /* package not installed */
  }
  return new HeliusClient({ apiKey, network });
}
