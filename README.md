# Aether Protocol

**On-chain Solana adoption, advertising, and lending.**

Discover → Participate → Earn. Lending unlocks after your first campaign payout.

Repository: [github.com/btcdecky-cmd/aether-protocol](https://github.com/btcdecky-cmd/aether-protocol)

**Static UI preview:** [htmlpreview](https://htmlpreview.github.io/?https://github.com/btcdecky-cmd/aether-protocol/blob/main/public/preview.html)

---

## Quick start

```bash
git clone https://github.com/btcdecky-cmd/aether-protocol.git
cd aether-protocol
cp .env.example .env
# Supabase → supabase.com/dashboard
# Bags    → dev.bags.fm
# Helius  → dashboard.helius.dev
npm install
npm run dev
npm run helius:ping   # optional
```

---

## Integrations

### Helius ([helius-labs/helius-sdk](https://github.com/helius-labs/helius-sdk))

**Helius is integrated** in this repository.

| Item | Path / detail |
|------|----------------|
| Client | `src/lib/helius/client.ts` |
| Task proof | `src/lib/helius/verify-task.ts` |
| UI | `/helius` route |
| Package | `helius-sdk` in `package.json` |
| Env | `HELIUS_API_KEY`, `VITE_HELIUS_API_KEY`, `SOLANA_RPC_URL` |
| Docs | [helius.dev/docs](https://www.helius.dev/docs) |
| Dashboard | [dashboard.helius.dev](https://dashboard.helius.dev) |

Used for: RPC balance/slot, DAS `getAssetsByOwner`, transaction history, signature verification before escrow rewards, priority fee estimates.

```ts
import { createHelius } from "helius-sdk";
const helius = createHelius({ apiKey: process.env.HELIUS_API_KEY!, network: "mainnet" });
```

Or use the built-in wrapper (works without the SDK installed):

```ts
import { getHeliusClient } from "./src/lib/helius";
const client = getHeliusClient();
await client.getAssetsByOwner(wallet);
await client.verifySignatureSuccess(sig);
```

### Bags.fm

Client: `src/lib/bags/client.ts` · Env: `BAGS_API_KEY` · [docs.bags.fm](https://docs.bags.fm)

---

## Campaign model

**Status:** `draft → pending_review → active → paused → ended`  
**Zones:** `discover | journey | project | lend_teaser`  
**Priority:** `override > contract > remnant`

Advertise flow: draft → review card → **Fund & activate**.

---

## Deploy (Vercel)

Import the repo on [vercel.com/new](https://vercel.com/new). Framework: Vite. Set `VITE_HELIUS_API_KEY`, `VITE_SUPABASE_*`, `BAGS_API_KEY`.

---

## License

MIT
