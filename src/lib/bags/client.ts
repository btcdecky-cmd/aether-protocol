/**
 * Bags.fm API client (reference integration — no SDK install required).
 *
 * Docs: https://docs.bags.fm
 * Base: https://public-api-v2.bags.fm/api/v1/
 * Auth: x-api-key header (from https://dev.bags.fm)
 *
 * Aether uses Bags for:
 * - Pool discovery (live Solana token markets)
 * - Token launch metadata lookups
 * - Lifetime fees / creators (project credibility signals)
 * - Optional trade quotes for activation tasks
 */

const DEFAULT_BASE = "https://public-api-v2.bags.fm/api/v1";

export type BagsSuccess<T> = { success: true; response: T };
export type BagsError = {
  success: false;
  error?: { code?: string; message?: string };
};

export type BagsResponse<T> = BagsSuccess<T> | BagsError;

export interface BagsPool {
  tokenMint: string;
  dbcConfigKey?: string;
  dbcPoolKey?: string;
  dammV2PoolKey?: string;
}

export interface BagsTokenCreators {
  [key: string]: unknown;
}

export interface BagsClientOptions {
  apiKey?: string;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
}

export class BagsClient {
  private apiKey: string;
  private baseUrl: string;
  private fetchImpl: typeof fetch;

  constructor(opts: BagsClientOptions = {}) {
    this.apiKey =
      opts.apiKey ??
      (typeof process !== "undefined" ? process.env.BAGS_API_KEY : undefined) ??
      "";
    this.baseUrl =
      opts.baseUrl ??
      (typeof process !== "undefined"
        ? process.env.BAGS_API_BASE
        : undefined) ??
      DEFAULT_BASE;
    this.fetchImpl = opts.fetchImpl ?? fetch;
  }

  get configured(): boolean {
    return Boolean(this.apiKey);
  }

  private async request<T>(
    path: string,
    init: RequestInit = {},
  ): Promise<BagsResponse<T>> {
    if (!this.apiKey) {
      return {
        success: false,
        error: {
          code: "missing_api_key",
          message:
            "BAGS_API_KEY is not set. Create a key at https://dev.bags.fm",
        },
      };
    }

    const url = `${this.baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
    const headers: Record<string, string> = {
      "x-api-key": this.apiKey,
      Accept: "application/json",
      ...(init.headers as Record<string, string> | undefined),
    };

    try {
      const res = await this.fetchImpl(url, { ...init, headers });
      const body = (await res.json()) as BagsResponse<T>;
      if (!res.ok && body && typeof body === "object" && "success" in body) {
        return body;
      }
      if (!res.ok) {
        return {
          success: false,
          error: {
            code: `http_${res.status}`,
            message: res.statusText,
          },
        };
      }
      return body;
    } catch (err) {
      return {
        success: false,
        error: {
          code: "network_error",
          message: err instanceof Error ? err.message : String(err),
        },
      };
    }
  }

  async ping(): Promise<{ ok: boolean; message: string }> {
    try {
      const pingUrl = "https://public-api-v2.bags.fm/ping";
      const res = await this.fetchImpl(pingUrl);
      const data = (await res.json()) as { message?: string };
      return { ok: res.ok, message: data.message ?? res.statusText };
    } catch (err) {
      return {
        ok: false,
        message: err instanceof Error ? err.message : String(err),
      };
    }
  }

  async getPools(onlyMigrated = false): Promise<BagsResponse<BagsPool[]>> {
    const q = onlyMigrated ? "?onlyMigrated=true" : "";
    return this.request<BagsPool[]>(`solana/bags/pools${q}`);
  }

  async getTokenLifetimeFees(tokenMint: string): Promise<BagsResponse<unknown>> {
    return this.request(
      `token-launch/lifetime-fees?tokenMint=${encodeURIComponent(tokenMint)}`,
    );
  }

  async getTokenCreators(tokenMint: string): Promise<BagsResponse<BagsTokenCreators>> {
    return this.request(
      `token-launch/creators?tokenMint=${encodeURIComponent(tokenMint)}`,
    );
  }

  async getLaunchFeed(): Promise<BagsResponse<unknown>> {
    return this.request("token-launch/feed");
  }
}

let _client: BagsClient | null = null;

export function getBagsClient(): BagsClient {
  if (!_client) _client = new BagsClient();
  return _client;
}
