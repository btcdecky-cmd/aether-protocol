# Aether Protocol

**On-chain Solana adoption, advertising, and lending.**

Discover projects → complete real actions → earn rewards from escrow → unlock lending.

Live product loop: **Discover → Participate → Earn**. Lending markets stay locked until a campaign has paid you (journey step 6).

Repository: [github.com/btcdecky-cmd/aether-protocol](https://github.com/btcdecky-cmd/aether-protocol)

**Website (after deploy):** Import this repo on [Vercel](https://vercel.com/new) → production URL will look like `https://aether-protocol.vercel.app`. Update this line with your live URL after the first deploy.

---

## Quick start (Supabase + Bags placeholders)

```bash
git clone https://github.com/btcdecky-cmd/aether-protocol.git
cd aether-protocol
cp .env.example .env
# Edit .env:
#   DATABASE_URL / SUPABASE_*  → https://supabase.com/dashboard
#   BAGS_API_KEY               → https://dev.bags.fm (or leave placeholder)
npm install
npm run dev          # http://localhost:3000
```

Demo mode works with placeholder keys (in-memory campaigns, no real auth/DB).

---

## What’s in this repo

| Area | Description |
|------|-------------|
| **User app** | Vite + React routes: Home, Discover, Campaign, Journey, Wallet, Advertise, Lend, Bags |
| **Campaign marketplace** | Status lifecycle + zones + priority |
| **Adoption journey** | 7-step path |
| **Advertise** | Draft → review → **Fund & activate** |
| **Bags.fm API** | Integrated client (`src/lib/bags`) |
| **Solana programs** | Campaign escrow + lending sketches |

---

## Campaign model

**Status:** `draft → pending_review → active → paused → ended`  
**Zones:** `discover | journey | project | lend_teaser`  
**Priority:** `override > contract > remnant`

---

## Bags.fm API integration

**Bags.fm is integrated** in this repository.

| Item | Detail |
|------|--------|
| Client | `src/lib/bags/client.ts` |
| Docs | [docs.bags.fm](https://docs.bags.fm) |
| Auth | `x-api-key` from [dev.bags.fm](https://dev.bags.fm) |
| Env | `BAGS_API_KEY`, `BAGS_API_BASE` |

```bash
curl https://public-api-v2.bags.fm/ping
export BAGS_API_KEY=your_key && npm run bags:ping
```

---

## Deploy (Vercel)

1. Open [vercel.com/new](https://vercel.com/new) → Import **btcdecky-cmd/aether-protocol**
2. Framework: **Vite** · Build: `npm run build` · Output: `dist`
3. Env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `BAGS_API_KEY`, `DATABASE_URL`
4. Deploy → paste the production URL into the Website line above

---

## License

MIT
